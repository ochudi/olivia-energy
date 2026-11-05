import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

export type RingMarkProps = {
  /** Diameter in px. */
  size: number;
  /** Stroke width in px (default 2). */
  stroke?: number;
  /** The open gap as a fraction of the circumference (default 0.25). */
  gap?: number;
  /**
   * close: the gap closes when the ring is half in view (the close band).
   * draw: the ring draws itself from nothing. none: static, with its gap.
   */
  animate?: "close" | "draw" | "none";
  /**
   * fill: the ring fills its parent (which sets the size) instead of being
   * `size` px wide; `size` then only sets the drawing's own units.
   */
  fill?: boolean;
  className?: string;
};

/* The mark's ring opens at about half past ten; the dash gap is centred
   there. A circle path starts at 3 o'clock, so the gap (the last `gap` of
   the circumference) is rotated into place. */
function gapRotation(gap: number): number {
  return -135 + 180 * gap;
}

/**
 * RingMark — the ring of the mark as a line: the closing ring on every red
 * close band, the halo, the 404's open ring. Server-rendered in its final
 * state; `close` and `draw` use Reveal's observer, so there is no new client
 * code. Circles appear only where the ring is meant (brief 2.4).
 */
export function RingMark({
  size,
  stroke = 2,
  gap = 0.25,
  animate = "none",
  fill = false,
  className,
}: RingMarkProps) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  const d = `M${c} ${c - r}A${r} ${r} 0 1 1 ${c} ${c + r}A${r} ${r} 0 1 1 ${c} ${c - r}`;
  const open = animate === "none" && gap > 0;
  const svg = (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={fill ? undefined : size}
      height={fill ? undefined : size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("ring-mark shrink-0", fill && "h-full w-full", className)}
    >
      <path
        d={d}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={open ? `${1 - gap} ${gap}` : undefined}
        transform={`rotate(${gapRotation(gap)} ${c} ${c})`}
        className={
          animate === "close"
            ? "ring-close"
            : animate === "draw"
              ? "draw"
              : undefined
        }
        style={
          animate === "close"
            ? ({ "--ring-gap": gap } as CSSProperties)
            : undefined
        }
      />
    </svg>
  );
  if (animate === "none") return svg;
  return (
    <Reveal
      as="span"
      variant={animate}
      className={fill ? "block h-full w-full" : "inline-flex"}
      style={fill ? undefined : { width: size, height: size }}
    >
      {svg}
    </Reveal>
  );
}
