import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/admin";
import { confirmLink } from "@/lib/admin/actions/auth";
import { isAdminLinkType, type AdminLinkType } from "@/lib/admin/paths";

export const metadata: Metadata = { title: "Continue" };

const COPY: Record<AdminLinkType, { title: string; body: string }> = {
  invite: {
    title: "Finish setting up your account",
    body: "You have been invited to the admin. Continue to choose your password.",
  },
  recovery: {
    title: "Reset your password",
    body: "Continue to choose a new password.",
  },
};

/**
 * Where an emailed invite or reset link lands. Opening the page spends
 * nothing: the one-time token is only verified when the button is pressed
 * (a POST), so a mail scanner or a chat app's link preview that fetches the
 * URL first cannot use the link up before the person does.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;
  if (!tokenHash || !isAdminLinkType(type)) {
    return (
      <>
        <h1 className="font-display text-display-xs font-normal">
          This link is not valid
        </h1>
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">
          It may have been cut short when it was copied. Open it again from the
          email, or request a new one from the sign-in page.
        </p>
        <p className="mt-6 text-sm">
          <Link
            href="/admin/login"
            className="hit-area text-ink hover:text-primary decoration-line-strong underline underline-offset-4"
          >
            Go to sign in
          </Link>
        </p>
      </>
    );
  }
  const copy = COPY[type];
  return (
    <>
      <h1 className="font-display text-display-xs font-normal">{copy.title}</h1>
      <p className="text-ink-muted mt-2 text-sm leading-relaxed">
        {copy.body} The link works once.
      </p>
      <form action={confirmLink} className="mt-6">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <SubmitButton pendingLabel="Checking…" size="md" className="w-full">
          Continue
        </SubmitButton>
      </form>
    </>
  );
}
