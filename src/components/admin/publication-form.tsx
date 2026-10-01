"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePublication } from "@/lib/admin/actions/publications";
import type { Publication } from "@/lib/supabase/types";
import { Checkbox, Field, Input, Textarea } from "./field";
import { Notice } from "./notice";
import { SubmitButton } from "./submit-button";

export function PublicationForm({
  publication,
}: {
  publication: Publication | null;
}) {
  const action = savePublication.bind(null, publication?.id ?? null);
  const [state, formAction] = useActionState(action, null);
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state && !state.ok ? (
        <Notice tone="error">{state.message}</Notice>
      ) : null}
      <Field label="Title" htmlFor="title" error={e.title}>
        <Input
          id="title"
          name="title"
          defaultValue={publication?.title ?? ""}
          required
          autoFocus
        />
      </Field>
      <Field
        label="Authors"
        htmlFor="authors"
        hint="Comma-separated, in citation order."
        error={e.authors}
      >
        <Input
          id="authors"
          name="authors"
          defaultValue={publication?.authors.join(", ") ?? ""}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field
          label="Venue"
          htmlFor="venue"
          hint="Journal, publisher or conference."
          error={e.venue}
        >
          <Input
            id="venue"
            name="venue"
            defaultValue={publication?.venue ?? ""}
          />
        </Field>
        <Field label="Year" htmlFor="year" error={e.year}>
          <Input
            id="year"
            name="year"
            inputMode="numeric"
            defaultValue={publication?.year ?? ""}
          />
        </Field>
      </div>
      <Field
        label="Link"
        htmlFor="url"
        hint="Google Scholar or DOI. Opens in a new tab on the site."
        error={e.url}
      >
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={publication?.url ?? ""}
          placeholder="https://doi.org/…"
        />
      </Field>
      <Field
        label="Summary"
        htmlFor="summary"
        hint="One or two sentences, shown on the site."
        error={e.summary}
      >
        <Textarea
          id="summary"
          name="summary"
          defaultValue={publication?.summary ?? ""}
          rows={4}
        />
      </Field>
      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox
          name="featured"
          defaultChecked={publication?.featured ?? false}
        />
        Featured (shown as a card at the top of Publications)
      </label>
      <div className="mt-2 flex items-center gap-4">
        <SubmitButton>
          {publication ? "Save changes" : "Add publication"}
        </SubmitButton>
        <Link
          href="/admin/publications"
          className="text-ink-muted hover:text-ink hit-area focus-visible:ring-focus focus-visible:ring-offset-canvas duration-instant ease-standard rounded-xs text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
