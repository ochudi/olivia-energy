"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { savePublication } from "@/lib/admin/actions/publications";
import { fieldsFor } from "@/lib/admin/publication-fields";
import {
  PUBLICATION_KIND_LABELS,
  PUBLICATION_KINDS,
  isPublicationKind,
  type Publication,
} from "@/lib/supabase/types";
import type { PublicationKind } from "@/types/contracts";
import { Checkbox, Field, Input, Select, Textarea } from "./field";
import { Notice } from "./notice";
import { SubmitButton } from "./submit-button";

/** The BusinessDay default offered for a new op-ed. */
const DEFAULT_OUTLET = "BusinessDay";

export function PublicationForm({
  publication,
  topics,
}: {
  publication: Publication | null;
  /** The topic chips an op-ed or mention can carry (OPED_TOPICS, passed from the page). */
  topics: readonly string[];
}) {
  const action = savePublication.bind(null, publication?.id ?? null);
  const [state, formAction] = useActionState(action, null);
  const e = state?.errors ?? {};
  // React resets the form after an action; `values` carries the submission
  // back (after an error, or a save without the new fields) so nothing typed is lost.
  const v = state?.values ?? {};
  const [kind, setKind] = useState<PublicationKind>(
    isPublicationKind(publication?.kind) ? publication.kind : "journal",
  );
  const shows = fieldsFor(kind);
  const saved = publication?.topics ?? [];
  const checked = (topic: string) => saved.includes(topic);
  const createdId = state?.ok ? (v.id ?? "") : "";

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state && !state.ok ? (
        <Notice tone="error">{state.message}</Notice>
      ) : null}
      {state?.ok && state.message ? (
        <Notice tone="info">{state.message}</Notice>
      ) : null}
      <input type="hidden" name="created_id" value={createdId} />
      <Field
        label="Kind"
        htmlFor="kind"
        hint="Op-eds and mentions are listed by date under Insights. The other kinds go on Publications."
        error={e.kind}
      >
        <Select
          id="kind"
          name="kind"
          defaultValue={isPublicationKind(v.kind) ? v.kind : kind}
          // React does not apply a changed defaultValue to a mounted select, so a
          // submission coming back remounts it with the kind that was sent.
          key={v.kind ?? "initial"}
          onChange={(event) => setKind(event.target.value as PublicationKind)}
        >
          {PUBLICATION_KINDS.map((k) => (
            <option key={k} value={k}>
              {PUBLICATION_KIND_LABELS[k]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Title" htmlFor="title" error={e.title}>
        <Input
          id="title"
          name="title"
          defaultValue={v.title ?? publication?.title ?? ""}
          required
          autoFocus
        />
      </Field>
      <Field
        label={shows.authors.label}
        htmlFor="authors"
        hint={shows.authors.hint}
        error={e.authors}
      >
        <Input
          id="authors"
          name="authors"
          defaultValue={v.authors ?? publication?.authors.join(", ") ?? ""}
        />
      </Field>
      <div
        className={
          shows.year
            ? "grid gap-4 sm:grid-cols-[1fr_8rem]"
            : "grid gap-4 sm:grid-cols-[1fr_12rem]"
        }
      >
        <Field
          label={shows.venue.label}
          htmlFor="venue"
          hint={shows.venue.hint}
          error={e.venue}
        >
          <Input
            id="venue"
            name="venue"
            defaultValue={
              v.venue ??
              publication?.venue ??
              (!publication && kind === "op-ed" ? DEFAULT_OUTLET : "")
            }
          />
        </Field>
        {shows.year ? (
          <Field label="Year" htmlFor="year" error={e.year}>
            <Input
              id="year"
              name="year"
              inputMode="numeric"
              defaultValue={v.year ?? publication?.year ?? ""}
            />
          </Field>
        ) : (
          <Field
            label={shows.date.label}
            htmlFor="published_on"
            error={e.published_on}
          >
            <Input
              id="published_on"
              name="published_on"
              type="date"
              required={shows.date.required}
              defaultValue={v.published_on ?? publication?.published_on ?? ""}
            />
          </Field>
        )}
      </div>
      {shows.year ? (
        <Field
          label={shows.date.label}
          htmlFor="published_on"
          hint="Optional. Fills the year when that is left empty."
          error={e.published_on}
          className="sm:max-w-[12rem]"
        >
          <Input
            id="published_on"
            name="published_on"
            type="date"
            defaultValue={v.published_on ?? publication?.published_on ?? ""}
          />
        </Field>
      ) : null}
      <Field
        label={shows.link.label}
        htmlFor="url"
        hint={shows.link.hint}
        error={e.url}
      >
        <Input
          id="url"
          name="url"
          type="url"
          required={shows.link.required}
          defaultValue={v.url ?? publication?.url ?? ""}
          placeholder={shows.link.placeholder}
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
          defaultValue={v.summary ?? publication?.summary ?? ""}
          rows={4}
        />
      </Field>
      {shows.topics ? (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-ink mb-1.5 text-xs font-medium">
            Topics
          </legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {topics.map((topic) => (
              <label
                key={topic}
                className="inline-flex items-center gap-2 text-sm"
              >
                <Checkbox
                  name="topics"
                  value={topic}
                  defaultChecked={
                    v.topics !== undefined
                      ? v.topics.split("|").includes(topic)
                      : checked(topic)
                  }
                />
                {topic}
              </label>
            ))}
          </div>
          {e.topics ? (
            <p role="alert" className="text-accent text-xs">
              {e.topics}
            </p>
          ) : (
            <p className="text-ink-muted text-xs">
              Shown as chips and used by the topic filter.
            </p>
          )}
        </fieldset>
      ) : null}
      {shows.pullQuote ? (
        <Field
          label="Pull quote"
          htmlFor="pull_quote"
          hint={
            kind === "mention"
              ? "The passage that names him, word for word. Optional."
              : "One sentence from the piece, word for word. Optional."
          }
          error={e.pull_quote}
        >
          <Textarea
            id="pull_quote"
            name="pull_quote"
            defaultValue={v.pull_quote ?? publication?.pull_quote ?? ""}
            rows={3}
            className="min-h-20"
          />
        </Field>
      ) : null}
      {shows.syndication ? (
        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            name="syndication"
            defaultChecked={
              v.syndication !== undefined
                ? v.syndication === "on"
                : (publication?.syndication ?? false)
            }
          />
          Syndicated copy of a report already listed (not counted)
        </label>
      ) : null}
      {shows.featured ? (
        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            name="featured"
            defaultChecked={
              v.featured !== undefined
                ? v.featured === "on"
                : (publication?.featured ?? false)
            }
          />
          Featured (shown as a card at the top of Publications)
        </label>
      ) : null}
      <div className="mt-2 flex items-center gap-4">
        <SubmitButton>
          {publication || createdId ? "Save changes" : "Add publication"}
        </SubmitButton>
        <Link
          href="/admin/publications"
          className="text-ink-muted hover:text-ink hit-area focus-visible:ring-focus focus-visible:ring-offset-canvas duration-instant ease-standard rounded-xs text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px"
        >
          {createdId ? "Back to the list" : "Cancel"}
        </Link>
      </div>
    </form>
  );
}
