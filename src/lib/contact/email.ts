import "server-only";

import { Resend } from "resend";
import { SITE } from "@/content/site";
import { absoluteUrl } from "@/lib/seo/urls";

export type ContactEmail = {
  /** Destination mailbox (settings.contact_email). */
  to: string;
  id: string;
  name: string;
  email: string;
  organization: string | null;
  message: string;
  receivedAt: Date;
};

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: "unconfigured" | "failed"; detail?: string };

const DEFAULT_FROM = `${SITE.name} <no-reply@oliviaenergyandpower.com>`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Delivers a contact message to the site mailbox through Resend, with
 * Reply-To set to the sender so a reply from any mail client goes straight
 * back to them. RESEND_FROM_EMAIL must be on a domain verified in Resend.
 */
export async function sendContactEmail(m: ContactEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "unconfigured" };
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  const clean = (value: string) => value.replace(/\p{Cc}+/gu, " ").trim();
  const subject = `Website enquiry from ${clean(m.name)}${m.organization ? ` (${clean(m.organization)})` : ""}`;
  const when = m.receivedAt.toISOString();
  const inbox = absoluteUrl("/admin/inbox");
  // The mark is an image (hosted on the site); the name beside it is live
  // text, so the header still reads "Olivia Energy" with images blocked.
  const mark = absoluteUrl("/brand/mark-128.png");

  const text = [
    `From: ${m.name} <${m.email}>`,
    m.organization ? `Organisation: ${m.organization}` : null,
    `Received: ${when}`,
    "",
    m.message,
    "",
    "—",
    `Reply to this email to answer ${m.name}. The message is also in the admin inbox: ${inbox}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f5f1;font:15px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#151816">
<div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e3e1da;border-radius:4px;padding:28px">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px"><tr>
<td style="padding:0 9px 5px 0;vertical-align:bottom"><img src="${escapeHtml(mark)}" width="23" height="32" alt="" style="display:block;border:0;width:23px;height:32px"></td>
<td style="vertical-align:bottom;font:500 22px/1 Georgia,'Times New Roman',serif;letter-spacing:-.015em;color:#151816;padding:0 0 1px">${escapeHtml(SITE.name)}</td>
</tr></table>
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6b6f6a">Website enquiry</p>
<h1 style="margin:0 0 20px;font-size:20px;font-weight:600">${escapeHtml(m.name)}${m.organization ? ` <span style="font-weight:400;color:#6b6f6a">· ${escapeHtml(m.organization)}</span>` : ""}</h1>
<table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">
<tr><td style="padding:2px 16px 2px 0;color:#6b6f6a">Email</td><td><a href="mailto:${escapeHtml(m.email)}" style="color:#0f6a3e">${escapeHtml(m.email)}</a></td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#6b6f6a">Received</td><td>${escapeHtml(when)}</td></tr>
</table>
<div style="white-space:pre-wrap;border-top:1px solid #e3e1da;padding-top:20px">${escapeHtml(m.message)}</div>
<p style="margin:24px 0 0;font-size:13px;color:#6b6f6a">Reply to this email to answer ${escapeHtml(m.name)}. Also in the <a href="${escapeHtml(inbox)}" style="color:#0f6a3e">admin inbox</a>.</p>
</div></body></html>`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [m.to],
      replyTo: m.email,
      subject,
      text,
      html,
      headers: { "X-Entity-Ref-ID": m.id },
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
