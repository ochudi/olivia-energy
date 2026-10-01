"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { turnstileConfigured, verifyTurnstile } from "@/lib/contact/turnstile";
import { safeNext } from "@/lib/admin/paths";
import { siteUrl } from "@/lib/seo/urls";
import { createServerSupabase } from "@/lib/supabase/server";
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

  // Signed-in requests run on the server, so Supabase's own per-IP limit
  // only ever sees the host's IP. Turnstile puts the check back on the
  // visitor; verified here (defence in depth) and also handed to Supabase
  // via `captchaToken` so its own Attack Protection setting can use it too.
  const token = String(formData.get("cf-turnstile-response") ?? "");
  let captchaToken: string | undefined;
  if (turnstileConfigured()) {
    const verified = await verifyTurnstile(token, await clientIp());
    if (!verified.ok) {
      return { ok: false, message: TURNSTILE_ERROR, values };
    }
    captchaToken = token;
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: captchaToken ? { captchaToken } : undefined,
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

/**
 * Requests a recovery email. Always answers with the same neutral message,
 * whether or not the address has an account and whether or not Turnstile or
 * Supabase accepted the request — nothing here should let a caller tell
 * those cases apart.
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

  const token = String(formData.get("cf-turnstile-response") ?? "");
  let captchaToken: string | undefined;
  let blockedByTurnstile = false;
  if (turnstileConfigured()) {
    const verified = await verifyTurnstile(token, await clientIp());
    if (verified.ok) captchaToken = token;
    else blockedByTurnstile = true;
  }

  if (!blockedByTurnstile) {
    const supabase = await createServerSupabase();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${siteUrl()}/admin/auth/callback?next=/admin/set-password`,
      ...(captchaToken ? { captchaToken } : {}),
    });
  }
  return { ok: true, message: RESET_NOTICE };
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
