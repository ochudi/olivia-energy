import { cn } from "@/lib/utils/cn";

export type DividerProps = {
  /** Optional centred label, rendered in the eyebrow style. */
  label?: string;
  /** Uses the stronger line token. */
  strong?: boolean;
  className?: string;
};

/**
 * Divider — a 1px hairline. With `label`, the label interrupts the rule.
 * Vertical rhythm is left to the caller (use margin utilities).
 */
export function Divider({ label, strong = false, className }: DividerProps) {
  const line = strong ? "bg-line-strong" : "bg-line";
  if (label) {
    return (
      <div
        role="separator"
        aria-label={label}
        className={cn("flex items-center gap-4", className)}
      >
        <span aria-hidden className={cn("h-px flex-1", line)} />
        <span className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
          {label}
        </span>
        <span aria-hidden className={cn("h-px flex-1", line)} />
      </div>
    );
  }
  return <hr className={cn("h-px w-full border-0", line, className)} />;
}
