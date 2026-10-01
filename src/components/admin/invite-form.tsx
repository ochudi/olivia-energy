"use client";

import { useActionState } from "react";
import { inviteAdmin } from "@/lib/admin/actions/team";
import { Field, Input } from "./field";
import { Notice } from "./notice";
import { SubmitButton } from "./submit-button";

export function InviteForm() {
  const [state, action] = useActionState(inviteAdmin, null);
  return (
    <form action={action} className="flex max-w-lg flex-col gap-3">
      <Field
        label="Invite an admin by email"
        htmlFor="invite-email"
        hint="They receive a link to choose a password; no public sign-up exists."
      >
        <div className="flex gap-2">
          <Input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="colleague@example.com"
          />
          <SubmitButton pendingLabel="Sending…" className="shrink-0">
            Send invite
          </SubmitButton>
        </div>
      </Field>
      {state ? (
        <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>
      ) : null}
      {state?.link ? (
        <Field label="One-time link" htmlFor="invite-link">
          <Input
            id="invite-link"
            readOnly
            value={state.link}
            onFocus={(event) => event.currentTarget.select()}
          />
        </Field>
      ) : null}
    </form>
  );
}
