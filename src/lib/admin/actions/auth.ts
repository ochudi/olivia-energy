"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { turnstileConfigured, verifyTurnstile } from "@/lib/contact/turnstile";
import { adminLinkUrl, sendAdminLink } from "@/lib/admin/links";
import { isAdminLinkType, safeNext } from "@/lib/admin/paths";
import { createServerSupabase } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/service";
import type { ActionState } from "./types";

const credentials = z.object({
  email: z.email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

const GENERIC_SIGN_IN_ERROR = "That email and password do not match.";
const RATE_LIMIT_ERROR =
  "Too many attempts. Wait a few minutes, then try again.";
const OUTAGE_ERROR = "The sign-in service is unavailable. Try again shortly.";
const TURNSTILE_ERROR =
  "We could not verify that request. Reload the page and try again.";
const RESET_NOTICE = "If that address has an account, a link is on its way.";

/** Best-effort caller IP for Turnstile's siteverify, same as the contact form. */
async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
}

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    next: formData.get("next")?.toString(),
  });
  const values = { email: String(formData.get("email") ?? "").trim() };
  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter your email address and password.",
      values,
    };
  }

  // Sign-in requests run on the server, so Supabase's own per-IP limit
  // only ever sees the host's IP. Turnstile puts the check back on the
  // visitor. It is verified here and nowhere else: a token verifies once,
  // so it cannot also be handed to Supabase's CAPTCHA setting, which must
  // stay off for this project (see docs/DEVELOPER_HANDOVER.md §7).
  if (turnstileConfigured()) {
    const token = String(formData.get("cf-turnstile-response") ?? "");
    const verified = await verifyTurnstile(token, await clientIp());
    if (!verified.ok) {
      return { ok: false, message: TURNSTILE_ERROR, values };
    }
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    if (error.status === 429) {
      return { ok: false, message: RATE_LIMIT_ERROR, values };
    }
    if (!error.status || error.status >= 500) {
      return { ok: false, message: OUTAGE_ERROR, values };
    }
    return { ok: false, message: GENERIC_SIGN_IN_ERROR, values };
  }
  redirect(safeNext(parsed.data.next));
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const resetEmail = z.object({ email: z.email() });

/** A member may be sent one recovery link per minute. */
const RESET_INTERVAL_MS = 60_000;

/**
 * Mails a one-time recovery link, but only to an address that is a member
 * of this site's admin: the Auth project may hold other applications'
 * users, and they have no business receiving this site's email. The link
 * is minted with the service role and sent through Resend (see links.ts).
 */
async function sendRecoveryLink(email: string): Promise<void> {
  const service = getServiceSupabase();
  const { data: member } = await service
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (!member) return;
  const { data: account } = await service.auth.admin.getUserById(member.id);
  const lastSent = account.user?.recovery_sent_at;
  if (lastSent && Date.now() - Date.parse(lastSent) < RESET_INTERVAL_MS) return;
  const { data, error } = await service.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error) {
    console.warn("[auth] recovery link not created:", error.message);
    return;
  }
  const sent = await sendAdminLink(
    "recovery",
    email,
    adminLinkUrl(data.properties),
  );
  if (!sent.ok) {
    console.warn(
      `[auth] recovery email not sent (${sent.reason})${sent.detail ? `: ${sent.detail}` : ""}`,
    );
  }
}

/**
 * Requests a recovery email. Always answers with the same neutral message,
 * whether or not the address is a member and whether or not Turnstile
 * accepted the request or the email went out — nothing here should let a
 * caller tell those cases apart.
 */
export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = { email: String(formData.get("email") ?? "").trim() };
  const parsed = resetEmail.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email address.", values };
  }

  if (turnstileConfigured()) {
    const token = String(formData.get("cf-turnstile-response") ?? "");
    const verified = await verifyTurnstile(token, await clientIp());
    if (!verified.ok) return { ok: true, message: RESET_NOTICE };
  }
  try {
    await sendRecoveryLink(parsed.data.email.toLowerCase());
  } catch (error) {
    console.error("[auth] recovery request failed:", error);
  }
  return { ok: true, message: RESET_NOTICE };
}

/**
 * Spends a one-time invite or reset link and signs the person in. This is
 * the confirm page's button, so the token is verified on a POST the person
 * made, never on the GET that merely opened the link.
 */
export async function confirmLink(formData: FormData): Promise<void> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = formData.get("type");
  if (!tokenHash || !isAdminLinkType(type)) redirect("/admin/login?error=link");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  redirect(error ? "/admin/login?error=link" : "/admin/set-password");
}

const passwords = z
  .object({
    password: z.string().min(10, "Use at least 10 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "The two passwords do not match.",
    path: ["confirm"],
  });

export async function setPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwords.safeParse({
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      message: issue?.message ?? "Check the password fields.",
      errors: issue?.path[0]
        ? { [String(issue.path[0])]: issue.message }
        : undefined,
    };
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, message: error.message };
  redirect("/admin");
}
