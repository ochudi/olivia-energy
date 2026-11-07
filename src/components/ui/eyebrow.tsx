import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { FlameBullet } from "./flame-bullet";

export type EyebrowProps = {
  children: ReactNode;
  /** Section numeral, e.g. "01". Replaces the mark. */
  number?: string;
  /** The mark's flame before the label instead of the rule. */
  flame?: boolean;
  as?: "p" | "span" | "h2" | "h3" | ElementType;
  id?: string;
  className?: string;
};

/**
 * Eyebrow — the 12px label above a heading (uppercase, 600, tracked), in
 * the surface's muted ink. A 16px rule in the primary colour anchors it to
 * the grid; `flame` swaps the rule for the mark's flame; `number` for a
 * numeral.
 *
 * Not used on the public site: nothing
 * sits above a heading, and a line that carries information is a sentence
 * in the body face (DESIGN.md, Typography). Kept for the style guide's
 * record of the component.
 */
export function Eyebrow({
  children,
  number,
  flame = false,
  as,
  id,
  className,
}: EyebrowProps) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag
      id={id}
      className={cn("label text-ink-muted flex items-start gap-3", className)}
    >
      {number ? (
        <span className="numerals">{number}</span>
      ) : flame ? (
        <FlameBullet className="text-primary mt-[0.05em] h-[1.1em]" />
      ) : (
        <span
          aria-hidden
          className="bg-primary mt-[calc(0.7em-0.5px)] h-px w-4 shrink-0"
        />
      )}
      <span>{children}</span>
    </Tag>
  );
}
