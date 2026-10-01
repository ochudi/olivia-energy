"use client";

import Link from "next/link";
import { useActionState, useCallback, useState } from "react";
import { Field, Input, Notice, SubmitButton } from "@/components/admin";
import { TurnstileWidget } from "@/components/contact/turnstile-widget";
import { signIn } from "@/lib/admin/actions/auth";

export function LoginForm({
  next,
  notice,
  siteKey,
}: {
  next: string;
  notice?: string;
  /** Turnstile site key; the widget renders only when this is configured. */
  siteKey: string | null;
}) {
  const [state, action] = useActionState(signIn, null);
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

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      {notice ? <Notice tone="info">{notice}</Notice> : null}
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
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Link
        href="/admin/reset"
        className="hit-area focus-visible:ring-focus focus-visible:ring-offset-surface text-ink-muted hover:text-ink self-end rounded-xs text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Forgot your password?
      </Link>
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
        pendingLabel="Signing in…"
        size="md"
        className="mt-2 w-full"
        disabled={Boolean(siteKey) && !token}
      >
        Sign in
      </SubmitButton>
    </form>
  );
}
