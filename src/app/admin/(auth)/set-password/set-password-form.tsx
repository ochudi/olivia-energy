"use client";

import { useActionState } from "react";
import { Field, Input, Notice, SubmitButton } from "@/components/admin";
import { setPassword } from "@/lib/admin/actions/auth";

export function SetPasswordForm() {
  const [state, action] = useActionState(setPassword, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state && !state.ok ? (
        <Notice tone="error">{state.message}</Notice>
      ) : null}
      <Field
        label="New password"
        htmlFor="password"
        hint="At least 10 characters."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          autoFocus
        />
      </Field>
      <Field
        label="Confirm password"
        htmlFor="confirm"
        error={state?.errors?.confirm}
      >
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>
      <SubmitButton pendingLabel="Saving…" size="md" className="mt-2 w-full">
        Save password
      </SubmitButton>
    </form>
  );
}
