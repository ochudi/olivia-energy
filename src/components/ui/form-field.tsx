import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Public-site form controls. Hairline border in line-strong, 48px inputs,
 * the focus ring from the tokens, and the accent reserved for invalid state.
 */
const inputClass =
  "border-line-strong bg-surface text-ink placeholder:text-ink-subtle w-full rounded-xs border px-4 font-sans text-base transition-[border-color,box-shadow] duration-fast ease-standard hover:border-ink/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus/25 focus-visible:ring-offset-0 focus-visible:outline-none aria-invalid:border-accent disabled:opacity-50";

export type FormFieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  /** Marks the field optional in the label row. */
  optional?: boolean;
  optionalLabel?: string;
  className?: string;
  children: ReactNode;
};

/** Label, control, then the error (announced) or the hint. */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  optional,
  optionalLabel = "Optional",
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="text-ink text-sm font-medium">
          {label}
        </label>
        {optional ? (
          <span className="text-ink-muted text-xs">{optionalLabel}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-accent animate-field-error text-sm"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-ink-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(inputClass, "h-12", className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(inputClass, "min-h-40 py-3 leading-relaxed", className)}
      {...props}
    />
  );
}
