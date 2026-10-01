import type { Metadata } from "next";
import { turnstileSiteKey } from "@/lib/contact/turnstile";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <>
      <h1 className="font-display text-display-xs font-normal">
        Reset your password
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        Enter your admin email address. If it has an account, we will send a
        link to set a new password.
      </p>
      <div className="mt-6">
        <ResetForm siteKey={turnstileSiteKey()} />
      </div>
    </>
  );
}
