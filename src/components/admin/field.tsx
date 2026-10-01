import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const controlClass =
  "border-line-strong bg-surface text-ink placeholder:text-ink-subtle focus-visible:ring-focus focus-visible:ring-offset-canvas w-full rounded-xs border px-3 font-sans text-sm transition-[border-color,box-shadow] duration-fast ease-standard hover:border-ink/50 focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:opacity-50";

export type FieldProps = {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  /** Right-aligned meta beside the label, e.g. a character count. */
  meta?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint/error, stacked, in the admin's compact rhythm. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  meta,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="text-ink text-xs font-medium">
          {label}
        </label>
        {meta ? (
          <span className="text-ink-subtle font-mono text-[0.6875rem] tabular-nums">
            {meta}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-accent text-xs">
          {error}
        </p>
      ) : hint ? (
        <p className="text-ink-muted text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(controlClass, "h-9", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(controlClass, "min-h-24 py-2 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select className={cn(controlClass, "h-9 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "accent-primary focus-visible:ring-focus size-5 rounded-xs focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
