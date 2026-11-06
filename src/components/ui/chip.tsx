import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ChipTone = "outline" | "solid" | "gap" | "opening";

export type ChipProps = {
  children: ReactNode;
  /**
   * outline: topic and format chips, "Target" and "Context". solid: a
   * selected chip. gap: the solid red gap pill (the only solid red on a
   * page). opening: the opening that answers a gap.
   */
  tone?: ChipTone;
  /** Renders a link (a filter, a topic page). */
  href?: string;
  as?: "span" | "li";
  /**
   * Lets a long label wrap onto more lines (a credential on a phone):
   * at least 28 px tall instead of exactly, and it may shrink.
   */
  wrap?: boolean;
  className?: string;
};

const TONES: Record<ChipTone, string> = {
  outline: "border-line-strong text-ink border bg-transparent",
  solid: "bg-ink text-canvas border border-transparent",
  gap: "bg-accent text-accent-fg border border-transparent",
  opening: "bg-primary text-primary-fg border border-transparent",
};

/* 12px medium, sentence case: a chip is a word, not a label (DESIGN.md,
   Typography: tracked uppercase lives on table heads and chart axes only). */
const BASE =
  "inline-flex items-center gap-1.5 rounded-pill px-3 font-sans text-xs font-medium leading-none";
/* cn() does not merge Tailwind classes, so the sizing is chosen here
   rather than overridden through className. */
const FIXED = "h-7 shrink-0 whitespace-nowrap";
const WRAPPING = "min-h-7 max-w-full py-1.5 leading-snug";

/**
 * Chip — a pill label (DESIGN.md, Shapes: pills are for buttons and chips).
 * 12px medium, sentence case, 28px tall.
 */
export function Chip({
  children,
  tone = "outline",
  href,
  as = "span",
  wrap = false,
  className,
}: ChipProps) {
  const classes = cn(BASE, wrap ? WRAPPING : FIXED, TONES[tone], className);
  if (href) {
    const link = (
      <Link
        href={href}
        className={cn(
          classes,
          "tap duration-fast ease-standard hover:border-ink focus-visible:ring-focus focus-visible:ring-offset-canvas transition-[border-color,background-color,color] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          tone === "outline" && "hover:bg-ink/[0.06]",
        )}
      >
        {children}
      </Link>
    );
    return as === "li" ? <li className="contents">{link}</li> : link;
  }
  const Tag = as;
  return <Tag className={classes}>{children}</Tag>;
}
