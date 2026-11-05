/**
 * The gap hatch (creative brief 2.1): 45 degree lines, 6 px pitch, 1.5 px
 * stroke, in `--hatch-color` (red at 85% on night and paper; solid red
 * with an ink outline on lime, where the shape itself carries
 * `--hatch-outline`). Hatch means "the gap" and nothing else.
 */

export type HatchPatternProps = {
  /** Unique within the page; shapes fill with `url(#id)`. */
  id: string;
  /**
   * Pitch in user units. A pattern scales with its viewBox, so a chart that
   * is shown smaller than its viewBox passes a larger pitch to keep about
   * 6 px on screen (see `hatchPitch`).
   */
  pitch?: number;
};

/** The pitch that reads as 6 px when a viewBox of `viewWidth` is shown at `cssWidth`. */
export function hatchPitch(viewWidth: number, cssWidth: number): number {
  return Math.round((6 * viewWidth) / cssWidth);
}

export function HatchPattern({ id, pitch = 6 }: HatchPatternProps) {
  const stroke = pitch / 4;
  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={pitch}
      height={pitch}
      patternTransform="rotate(45)"
    >
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={pitch}
        stroke="var(--hatch-color)"
        strokeWidth={stroke}
      />
    </pattern>
  );
}

/**
 * The same hatch as a CSS background, for HTML bars (the share and compare
 * glyphs), where the pitch is exact at any size.
 */
export const HATCH_BACKGROUND =
  "repeating-linear-gradient(45deg, var(--hatch-color) 0, var(--hatch-color) 1.5px, transparent 1.5px, transparent 6px)";
