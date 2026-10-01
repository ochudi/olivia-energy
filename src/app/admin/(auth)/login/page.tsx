import type { Metadata } from "next";
import { safeNext } from "@/lib/admin/paths";
import { turnstileSiteKey } from "@/lib/contact/turnstile";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, string> = {
  unconfigured:
    "Supabase is not configured on this deployment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  link: "That link is invalid, has expired or was already used. Use “Forgot your password?” below for a new one, or ask an admin to invite you again.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1 className="font-display text-display-xs font-normal">Sign in</h1>
      <p className="text-ink-muted mt-1 text-sm">
        Admin access is by invitation. There is no public sign-up.
      </p>
      <div className="mt-6">
        <LoginForm
          next={safeNext(next)}
          notice={error ? NOTICES[error] : undefined}
          siteKey={turnstileSiteKey()}
        />
      </div>
    </>
  );
}
