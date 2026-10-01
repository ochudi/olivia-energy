import type { CSSProperties } from "react";
import { SITE } from "@/content/site";
import {
  MARK_COLORS,
  MARK_HEIGHT,
  MARK_LOCKUP,
  MARK_MONO_PATH,
  MARK_PATHS,
  MARK_VIEWBOX,
  MARK_WIDTH,
} from "@/lib/brand/mark";
import { cn } from "@/lib/utils/cn";

export type LogoVariant = "lockup" | "mark" | "stacked";
export type LogoTone = "color" | "mono";

export type LogoProps = {
  /** lockup: mark beside the wordmark. stacked: mark above it. mark: the mark alone. */
  variant?: LogoVariant;
  /**
   * color: the full-colour mark, which turns one-colour by itself inside any
   * inverse surface (data-tone="inverse", the header over a dark hero or with
   * the menu open). mono: one colour everywhere, taken from currentColor.
   */
  tone?: LogoTone;
  /**
   * Height of the mark in px. Omit it to size from the inherited font size,
   * where 1em is the wordmark (so a text-* class sizes the whole logo).
   */
  size?: number;
  className?: string;
};

const RATIO = MARK_WIDTH / MARK_HEIGHT;

/** Mark height in ems of the logo's own font size, per variant. */
const MARK_EM: Record<LogoVariant, number> = {
  lockup: MARK_LOCKUP.markEm,
  stacked: MARK_LOCKUP.stackedMarkEm,
  mark: 1,
};

/** The colour tone reads each fill from a variable that inverse surfaces set to currentColor. */
const fill = (name: keyof typeof MARK_COLORS): CSSProperties => ({
  fill: `var(--brand-mark-${name}, ${MARK_COLORS[name]})`,
});
const FILL_TRANSITION = "transition-[fill] duration-base ease-standard";

function Mark({ tone, em }: { tone: LogoTone; em: number }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      style={{ width: `${em * RATIO}em`, height: `${em}em` }}
    >
      {tone === "color" ? (
        <>
          <path
            d={MARK_PATHS.lime}
            style={fill("lime")}
            className={FILL_TRANSITION}
          />
          <path
            d={MARK_PATHS.red}
            style={fill("red")}
            className={FILL_TRANSITION}
          />
          <path
            d={MARK_PATHS.ring}
            style={fill("green")}
            className={FILL_TRANSITION}
          />
        </>
      ) : (
        <path d={MARK_MONO_PATH} fill="currentColor" />
      )}
    </svg>
  );
}

/**
 * Logo — the Olivia Energy mark, alone or locked up with the wordmark.
 *
 * The mark is inline SVG drawn from src/lib/brand/mark.ts (no request, crisp
 * at any density); the wordmark is live text in the display serif. In the
 * lockup the wordmark's baseline sits on the ring's base and its cap height
 * reaches the top of the ring's counter (see MARK_LOCKUP). The logo carries
 * no accessible name of its own: the mark is aria-hidden and the wordmark is
 * plain text, so a wrapping link reads "Olivia Energy" plus whatever it adds.
 */
export function Logo({
  variant = "lockup",
  tone = "color",
  size,
  className,
}: LogoProps) {
  const em = MARK_EM[variant];
  const style: CSSProperties | undefined = size
    ? { fontSize: `${size / em}px` }
    : undefined;

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)} style={style}>
        <Mark tone={tone} em={em} />
      </span>
    );
  }

  const wordmark = (
    <span className="font-display leading-none font-medium tracking-tight whitespace-nowrap">
      {SITE.name}
    </span>
  );

  if (variant === "stacked") {
    return (
      <span
        className={cn("inline-flex flex-col items-center", className)}
        style={{ ...style, gap: `${MARK_LOCKUP.stackedGapEm}em` }}
      >
        <Mark tone={tone} em={em} />
        {wordmark}
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-baseline", className)}
      style={{ ...style, gap: `${MARK_LOCKUP.gapEm}em` }}
    >
      {/* The flex baseline of an SVG is its bottom edge; nudge the round base
          a hair below the baseline, as round letters overshoot it. */}
      <span
        className="relative inline-flex"
        style={{ top: `${MARK_LOCKUP.overshootEm}em` }}
      >
        <Mark tone={tone} em={em} />
      </span>
      {wordmark}
    </span>
  );
}
