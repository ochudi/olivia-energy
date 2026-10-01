import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type EyebrowProps = {
  children: ReactNode;
  /** Section numeral, e.g. "01". Replaces the rule mark. */
  number?: string;
  /** Uses the accent (legacy red) for the mark. Budget: once per page. */
  accent?: boolean;
  /** Suppresses the mark entirely. */
  plain?: boolean;
  as?: ElementType;
  id?: string;
  className?: string;
};

/**
 * Eyebrow — small-caps label that sits above a heading. A short hairline in
 * primary green anchors it to the grid; pass `number` for numbered sections.
 */
export function Eyebrow({
  children,
  number,
  accent = false,
  plain = false,
  as,
  id,
  className,
}: EyebrowProps) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag
      id={id}
      className={cn(
        "tracking-caps text-ink-muted flex items-start gap-3 font-sans text-xs font-medium uppercase",
        className,
      )}
    >
      {number ? (
        <span className="text-ink-muted tabular-nums">{number}</span>
      ) : plain ? null : (
        <span
          aria-hidden
          className={cn(
            "mt-[calc(0.75em-0.5px)] h-px w-4 shrink-0",
            accent ? "bg-accent" : "bg-primary",
          )}
        />
      )}
      <span>{children}</span>
    </Tag>
  );
}
