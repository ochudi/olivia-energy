"use client";

import Link from "next/link";
import { useActionState, useCallback, useState } from "react";
import { Field, Input, Notice, SubmitButton } from "@/components/admin";
import { TurnstileWidget } from "@/components/contact/turnstile-widget";
import { requestPasswordReset } from "@/lib/admin/actions/auth";

const backLink =
  "hit-area focus-visible:ring-focus focus-visible:ring-offset-surface text-ink-muted hover:text-ink self-start rounded-xs text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

export function ResetForm({ siteKey }: { siteKey: string | null }) {
  const [state, action] = useActionState(requestPasswordReset, null);
  const [token, setToken] = useState<string | null>(null);
  // Every rejection remounts the widget: a Turnstile token verifies once.
  // Adjusted during render (React's documented pattern for deriving state
  // from a prop/state change) rather than in an effect, so it never lags a
  // render behind.
  const [prevState, setPrevState] = useState(state);
  const [resetCount, setResetCount] = useState(0);
  if (prevState !== state) {
    setPrevState(state);
    if (state && !state.ok) setResetCount((count) => count + 1);
  }

  const onToken = useCallback((value: string | null) => setToken(value), []);

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="info">{state.message}</Notice>
        <Link href="/admin/login" className={backLink}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {state && !state.ok ? (
        <Notice tone="error">{state.message}</Notice>
      ) : null}
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          required
          autoFocus
        />
      </Field>
      {siteKey ? (
        <TurnstileWidget
          siteKey={siteKey}
          onToken={onToken}
          resetKey={resetCount}
          className="min-h-[65px]"
        />
      ) : null}
      <input type="hidden" name="cf-turnstile-response" value={token ?? ""} />
      <SubmitButton
        pendingLabel="Sending…"
        size="md"
        className="mt-2 w-full"
        disabled={Boolean(siteKey) && !token}
      >
        Send reset link
      </SubmitButton>
      <Link href="/admin/login" className={backLink}>
        Back to sign in
      </Link>
    </form>
  );
}
