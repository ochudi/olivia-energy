import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

export type RingMarkProps = {
  /** Diameter in px. */
  size: number;
  /** Stroke width in px (default 2). */
  stroke?: number;
  /** The open gap as a fraction of the circumference (default 0.25). */
  gap?: number;
  /**
   * close: the gap closes as the ring scrolls into view (the close band).
   * draw: the ring draws itself from nothing. none: static, with its gap.
   * Both motions are scroll-driven on a view timeline the ring names
   * (DESIGN.md, Motion); server HTML is the finished ring.
   * once: the ring is closed and the page (PortraitFrame) draws it one time
   * as it enters the viewport; this component only marks the path.
   */
  animate?: "close" | "draw" | "once" | "none";
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
 * close band, the halo, the 404's open ring. Circles appear only where the
 * ring is meant.
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
  // A once ring is a closed circle that starts at twelve o'clock.
  const rotation = animate === "once" ? 0 : gapRotation(gap);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={fill ? undefined : size}
      height={fill ? undefined : size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "ring-mark shrink-0",
        fill && "h-full w-full",
        (animate === "close" || animate === "draw") && "draw-scope",
        className,
      )}
    >
      <path
        d={d}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={open ? `${1 - gap} ${gap}` : undefined}
        transform={`rotate(${rotation} ${c} ${c})`}
        className={
          animate === "close"
            ? "ring-close"
            : animate === "draw"
              ? "draw"
              : animate === "once"
                ? "ring-once-path"
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
}
