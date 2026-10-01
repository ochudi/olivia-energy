import "server-only";

import { SITE } from "@/content/site";
import { escapeHtml, sendEmail, type SendResult } from "@/lib/email/send";
import { absoluteUrl, siteUrl } from "@/lib/seo/urls";
import type { AdminLinkType } from "./paths";

/**
 * Invitation and password-reset links for the admin.
 *
 * The links are minted with the service role (`auth.admin.generateLink`),
 * point at this site's own confirm page, and are mailed through Resend. Supabase's built-in emails are never used, so nothing depends on
 * the project's email templates, Site URL, redirect allow-list or SMTP
 * settings, which may belong to other applications sharing the project.
 */

/**
 * The one-time link. It opens /admin/auth/confirm, which verifies the token
 * only when its button is pressed, then continues to set-password.
 */
export function adminLinkUrl(properties: {
  hashed_token: string;
  verification_type: string;
}): string {
  const params = new URLSearchParams({
    token_hash: properties.hashed_token,
    type: properties.verification_type,
  });
  return `${siteUrl()}/admin/auth/confirm?${params}`;
}

const COPY: Record<
  AdminLinkType,
  {
    subject: string;
    heading: string;
    intro: string;
    action: string;
    ignore: string;
  }
> = {
  invite: {
    subject: `Your ${SITE.name} admin account`,
    heading: "You have been invited",
    intro: `You have been given access to the ${SITE.name} website admin. Choose a password to finish setting up your account.`,
    action: "Choose a password",
    ignore: "If you were not expecting this, you can ignore this email.",
  },
  recovery: {
    subject: `Reset your ${SITE.name} admin password`,
    heading: "Choose a new password",
    intro: `Someone asked to reset the password for your ${SITE.name} website admin account.`,
    action: "Choose a new password",
    ignore:
      "If that was not you, ignore this email and your password stays as it is.",
  },
};

export async function sendAdminLink(
  kind: AdminLinkType,
  to: string,
  url: string,
): Promise<SendResult> {
  const copy = COPY[kind];
  const mark = absoluteUrl("/brand/mark-128.png");
  const text = [
    copy.intro,
    "",
    `${copy.action}: ${url}`,
    "",
    "The link works once.",
    copy.ignore,
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f5f1;font:15px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#151816">
<div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e3e1da;border-radius:4px;padding:28px">
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px"><tr>
<td style="padding:0 9px 5px 0;vertical-align:bottom"><img src="${escapeHtml(mark)}" width="23" height="32" alt="" style="display:block;border:0;width:23px;height:32px"></td>
<td style="vertical-align:bottom;font:500 22px/1 Georgia,'Times New Roman',serif;letter-spacing:-.015em;color:#151816;padding:0 0 1px">${escapeHtml(SITE.name)}</td>
</tr></table>
<h1 style="margin:0 0 12px;font-size:20px;font-weight:600">${escapeHtml(copy.heading)}</h1>
<p style="margin:0 0 20px">${escapeHtml(copy.intro)}</p>
<p style="margin:0 0 20px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#0f6a3e;color:#fff;text-decoration:none;border-radius:4px;padding:10px 18px;font-weight:600">${escapeHtml(copy.action)}</a></p>
<p style="margin:0;font-size:13px;color:#6b6f6a">The link works once. ${escapeHtml(copy.ignore)}</p>
</div></body></html>`;
  return sendEmail({ to, subject: copy.subject, text, html });
}
