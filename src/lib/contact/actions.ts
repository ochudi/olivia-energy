"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSettings } from "@/lib/supabase/queries";
import { sendContactEmail } from "./email";
import { contactSchema, fieldErrors, type ContactErrors } from "./schema";
import { siteUrl } from "@/lib/seo/urls";
import { getServiceSupabase } from "@/lib/supabase/service";
import { parseSettings } from "@/lib/supabase/types";
import { turnstileConfigured, verifyTurnstile } from "./turnstile";

export type ContactFailure =
  "invalid" | "turnstile" | "rate_limited" | "unconfigured" | "server";

export type ContactState =
  | { status: "idle" }
  | { status: "success"; name: string; email: string; at: number }
  | {
      status: "error";
      reason: ContactFailure;
      errors?: ContactErrors;
      at: number;
    };

const text = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value : "";

/**
 * Contact-form submission. In order: honeypot, zod, Turnstile (verified
 * with Cloudflare), insert into contact_messages with the service role
 * (the database trigger enforces the 3-per-hour limit and answers PT429),
 * then email through Resend. The message has to reach at least one of the
 * two: a mail failure is only logged when the row is in the admin inbox,
 * and a database failure is only logged when the email went out.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const at = Date.now();
  const raw = {
    name: text(formData.get("name")),
    email: text(formData.get("email")),
    organization: text(formData.get("organization")),
    message: text(formData.get("message")),
  };

  // Honeypot: real users never see the field. Pretend it worked, keep nothing.
  if (text(formData.get("website"))) {
    return { status: "success", name: raw.name, email: raw.email, at };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      reason: "invalid",
      errors: fieldErrors(parsed.error),
      at,
    };
  }
  const values = parsed.data;

  if (!isSupabaseConfigured() || !turnstileConfigured()) {
    console.error(
      "[contact] not configured: Supabase or Turnstile env missing",
    );
    return { status: "error", reason: "unconfigured", at };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const verified = await verifyTurnstile(
    text(formData.get("cf-turnstile-response")),
    ip,
  );
  if (!verified.ok) {
    console.warn("[contact] turnstile rejected:", verified.codes.join(", "));
    return { status: "error", reason: "turnstile", at };
  }

  const id = randomUUID();
  if (!hostnameMatches(verified.hostname)) {
    console.warn("[contact] turnstile hostname mismatch:", verified.hostname);
    return { status: "error", reason: "turnstile", at };
  }

  // The service role writes the row: anon has no insert privilege on
  // contact_messages (see the grants in the migration), so the only way
  // into the inbox is through this action, after Turnstile has passed.
  const { error } = await getServiceSupabase().from("contact_messages").insert({
    id,
    name: values.name,
    email: values.email,
    organization: values.organization,
    message: values.message,
    turnstile_score: 1,
  });
  if (error?.code === "PT429") {
    return { status: "error", reason: "rate_limited", at };
  }
  if (error) {
    console.error("[contact] insert failed:", error.code, error.message);
  }

  // With the database unreachable the cached settings may be too; the
  // defaults carry the same mailbox.
  const settings = await getSettings().catch(() => parseSettings([]));
  const sent = await sendContactEmail({
    to: settings.contact_email,
    id,
    name: values.name,
    email: values.email,
    organization: values.organization,
    message: values.message,
    receivedAt: new Date(at),
  });
  if (!sent.ok) {
    console.warn(
      `[contact] ${error ? "not stored" : `stored ${id}`} and email not sent (${sent.reason})${sent.detail ? `: ${sent.detail}` : ""}`,
    );
    if (error) return { status: "error", reason: "server", at };
  }
  return { status: "success", name: values.name, email: values.email, at };
}

/**
 * Cloudflare reports the hostname the widget was solved on. On the live
 * site it must be ours; locally and on previews the test keys report a
 * placeholder, so the check only runs in production.
 */
function hostnameMatches(hostname: string | undefined): boolean {
  if (process.env.VERCEL_ENV !== "production" || !hostname) return true;
  try {
    return new URL(siteUrl()).hostname === hostname;
  } catch {
    return true;
  }
}
