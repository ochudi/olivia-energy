"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  useActionState,
  useCallback,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { FormField, TextArea, TextInput } from "@/components/ui/form-field";
import { CONTACT_PAGE } from "@/content/contact";
import { submitContact, type ContactState } from "@/lib/contact/actions";
import { cn } from "@/lib/utils/cn";
import {
  contactSchema,
  fieldErrors,
  CONTACT_FIELDS,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact/schema";
import { TurnstileWidget, type TurnstileStatus } from "./turnstile-widget";

export type ContactFormProps = {
  /** Turnstile site key; null renders the form disabled with a fallback. */
  siteKey: string | null;
  /** Where messages go; shown in the success and failure copy. */
  contactEmail: string;
};

type Values = Record<ContactField, string>;
const EMPTY: Values = { name: "", email: "", organization: "", message: "" };
const INITIAL: ContactState = { status: "idle" };

type Local = { key: number; errors: ContactErrors; banner: string | null };
type ErrorReason = Extract<ContactState, { status: "error" }>["reason"];

function bannerFor(reason: ErrorReason, contactEmail: string): string {
  switch (reason) {
    case "invalid":
      return CONTACT_PAGE.errors.invalid;
    case "turnstile":
      return CONTACT_PAGE.errors.turnstile;
    case "rate_limited":
      return CONTACT_PAGE.errors.rateLimited(contactEmail);
    case "unconfigured":
      return CONTACT_PAGE.errors.unconfigured(contactEmail);
    default:
      return CONTACT_PAGE.errors.server(contactEmail);
  }
}

const copy = CONTACT_PAGE.form;

/**
 * Moves focus to the success heading when it mounts. A callback ref runs at
 * commit, so this needs no effect and reads no ref during render. (React
 * applies `autoFocus` only to form controls, so it cannot do this job.)
 */
const focusOnMount = (node: HTMLHeadingElement | null) => {
  node?.focus();
};

/** Keeps disabled controls at full strength inside the dimmed field group. */
const pendingControl = "disabled:opacity-100!";

export function ContactForm({ siteKey, contactEmail }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL);
  const [values, setValues] = useState<Values>(EMPTY);
  const [token, setToken] = useState<string | null>(null);
  const [turnstile, setTurnstile] = useState<TurnstileStatus>("loading");
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  // Client-side validation and banner overrides, keyed to the server
  // response they were made against: a newer response always wins, so the
  // server's answer never has to be copied into state by an effect.
  const [local, setLocal] = useState<Local>({
    key: 0,
    errors: {},
    banner: null,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  const onToken = useCallback((next: string | null) => setToken(next), []);
  const onStatus = useCallback(
    (next: TurnstileStatus) => setTurnstile(next),
    [],
  );

  const stateKey = state.status === "idle" ? 0 : state.at;
  const current = local.key === stateKey;
  const errors: ContactErrors = current
    ? local.errors
    : state.status === "error"
      ? (state.errors ?? {})
      : {};
  const banner = current
    ? local.banner
    : state.status === "error"
      ? bannerFor(state.reason, contactEmail)
      : null;
  // Every rejection remounts the widget: a Turnstile token verifies once.
  const resetKey = state.status === "error" ? state.at : 0;
  const patchLocal = (patch: Partial<Omit<Local, "key">>) =>
    setLocal({ key: stateKey, errors, banner, ...patch });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      event.preventDefault();
      const next = fieldErrors(parsed.error);
      patchLocal({ errors: next, banner: null });
      const first = CONTACT_FIELDS.find((field) => next[field]);
      if (first)
        formRef.current?.querySelector<HTMLElement>(`#${id}-${first}`)?.focus();
      return;
    }
    if (!siteKey) {
      event.preventDefault();
      patchLocal({
        errors: {},
        banner: CONTACT_PAGE.errors.unconfigured(contactEmail),
      });
      return;
    }
    if (!token) {
      event.preventDefault();
      patchLocal({
        errors: {},
        banner:
          turnstile === "unavailable"
            ? CONTACT_PAGE.errors.turnstileLoad(contactEmail)
            : turnstile === "error"
              ? CONTACT_PAGE.errors.turnstileError(contactEmail)
              : CONTACT_PAGE.errors.turnstilePending,
      });
      return;
    }
    patchLocal({ errors: {}, banner: null });
  };

  const set = (field: ContactField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      patchLocal({ errors: { ...errors, [field]: undefined } });
  };

  if (state.status === "success" && dismissedAt !== state.at) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-start"
      >
        <h2
          ref={focusOnMount}
          tabIndex={-1}
          className="font-display text-display-sm font-normal tracking-tight text-balance focus:outline-none"
        >
          {CONTACT_PAGE.success.title}
        </h2>
        <p className="text-ink-muted mt-4 max-w-[48ch] text-base leading-relaxed text-pretty">
          {CONTACT_PAGE.success.body(contactEmail)}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-8"
          onClick={() => {
            setValues(EMPTY);
            setToken(null);
            setLocal({ key: 0, errors: {}, banner: null });
            setDismissedAt(state.at);
          }}
        >
          {CONTACT_PAGE.success.again}
        </Button>
      </div>
    );
  }

  const describedBy = (field: ContactField, hasHint = false) =>
    errors[field]
      ? `${id}-${field}-error`
      : hasHint
        ? `${id}-${field}-hint`
        : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-busy={pending}
      className="flex flex-col gap-6"
    >
      <h2 className="sr-only">{copy.heading}</h2>

      {banner ? (
        <div
          role="alert"
          className="border-accent/40 bg-accent/8 text-ink flex items-start gap-3 rounded-xs border px-4 py-3 text-sm leading-relaxed"
        >
          <AlertCircle
            aria-hidden
            className="text-accent mt-0.5 size-4 shrink-0"
          />
          <p>{banner}</p>
        </div>
      ) : null}

      <div
        className={cn(
          "duration-fast ease-standard flex flex-col gap-6 transition-opacity",
          pending && "opacity-70",
        )}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label={copy.name}
            htmlFor={`${id}-name`}
            error={errors.name}
          >
            <TextInput
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              required
              value={values.name}
              onChange={(e) => set("name")(e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name")}
              disabled={pending}
              className={pendingControl}
            />
          </FormField>
          <FormField
            label={copy.email}
            htmlFor={`${id}-email`}
            error={errors.email}
          >
            <TextInput
              id={`${id}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(e) => set("email")(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy("email")}
              disabled={pending}
              className={pendingControl}
            />
          </FormField>
        </div>

        <FormField
          label={copy.organization}
          htmlFor={`${id}-organization`}
          optional
          optionalLabel={copy.optional}
          error={errors.organization}
        >
          <TextInput
            id={`${id}-organization`}
            name="organization"
            autoComplete="organization"
            value={values.organization}
            onChange={(e) => set("organization")(e.target.value)}
            aria-invalid={errors.organization ? true : undefined}
            aria-describedby={describedBy("organization")}
            disabled={pending}
            className={pendingControl}
          />
        </FormField>

        <FormField
          label={copy.message}
          htmlFor={`${id}-message`}
          hint={copy.messageHint}
          error={errors.message}
        >
          <TextArea
            id={`${id}-message`}
            name="message"
            required
            rows={6}
            value={values.message}
            onChange={(e) => set("message")(e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message", true)}
            disabled={pending}
            className={pendingControl}
          />
        </FormField>
      </div>

      {/* Honeypot: off-screen, never shown, never filled by a person. */}
      <div
        aria-hidden
        className="absolute top-auto -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {siteKey ? (
        <TurnstileWidget
          siteKey={siteKey}
          onToken={onToken}
          onStatus={onStatus}
          resetKey={resetKey}
          className="min-h-[65px]"
        />
      ) : null}
      <input type="hidden" name="cf-turnstile-response" value={token ?? ""} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          size="lg"
          icon={<ArrowRight />}
          disabled={pending || !siteKey}
          className="min-w-[11rem]"
        >
          {pending ? copy.sending : copy.submit}
        </Button>
        <p className="text-ink-muted max-w-[34ch] text-xs leading-relaxed">
          {copy.privacy}{" "}
          <Link
            href={copy.privacyLink.href}
            className="link-underline hover:text-ink"
          >
            {copy.privacyLink.label}
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
