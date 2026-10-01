import "server-only";

import { Resend } from "resend";
import { SITE } from "@/content/site";

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: "unconfigured" | "failed"; detail?: string };

export type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

const DEFAULT_FROM = `${SITE.name} <no-reply@oliviaenergyandpower.com>`;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends one email through Resend. Without RESEND_API_KEY it answers
 * `unconfigured` and sends nothing, so callers can degrade (the contact
 * form still stores the message; an invite shows its link instead).
 * RESEND_FROM_EMAIL must be on a domain verified in Resend.
 */
export async function sendEmail(message: OutgoingEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "unconfigured" };
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [message.to],
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
      headers: message.headers,
    });
    if (error) return { ok: false, reason: "failed", detail: error.message };
    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    return {
      ok: false,
      reason: "failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
