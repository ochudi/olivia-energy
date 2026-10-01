/**
 * THE OLIVIA ENERGY MARK — single source of truth.
 *
 * A clean vector redraw of the client's legacy mark (an open ring with a
 * three-tongue flame rising from its gap), fitted to the 1024px reference
 * with least-squares Bézier curves and then tidied by hand: circles are true
 * circles, tangents meet where they should, pixel noise is gone. Every
 * rendering of the mark reads from this file: the <Logo> component, the
 * social images, and scripts/brand-assets.mjs, which writes the static SVG
 * and PNG files in public/brand and the app icons. Change a value here, run
 * `node scripts/brand-assets.mjs`, and everything follows.
 *
 * Geometry lives in a 72 × 100 box (the mark's own bounding box, so a lockup
 * can align to its edges). Paint order for the full-colour mark is lime, red,
 * ring. The lime tongue runs under the red one as far as the red's midline,
 * so the two colours overlap instead of abutting: no hairline seam at any
 * size, and the same three paths filled with one colour give a seamless
 * one-colour mark.
 */

export const MARK_WIDTH = 72;
export const MARK_HEIGHT = 100;
export const MARK_VIEWBOX = `0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`;

/**
 * Colours sampled from the legacy artwork (median of solid interior pixels)
 * in both the 157px original and the 1024px upscale; each value is the mean
 * of the two samples. Green matches the green-500 token exactly. The red is
 * the mark's own and is warmer than the UI accent (--color-accent, #c5372b),
 * which was toned for interface use; do not substitute one for the other.
 */
export const MARK_COLORS = {
  green: "#04923F",
  red: "#D5281B",
  lime: "#88C029",
} as const;

/** Off-white for the one-colour mark on dark surfaces (neutral-50). */
export const MARK_INVERSE = "#FAF7F3";

export const MARK_PATHS = {
  /** Outer tongue. Painted first; extends under the red tongue to its midline. */
  lime: "M30.5 0C38.4 8.6 38.2 16.8 37.5 25.3C39.9 31.8 29.4 45.8 23.7 52.3C14.6 61.2 8.7 78.2 16.8 91.8C4.9 87.9 .2 71.8 .2 62.8C.2 33.6 28.6 31.1 30.5 0Z",
  /** Middle tongue, with the small secondary lick on its upper edge. */
  red: "M39.9 17.9C41.3 23.5 40.9 29.2 38.9 33.6C39.7 34.1 40.7 34.9 40.7 36C40.7 48.1 15.9 59.1 15.9 79.6C15.9 85.6 16.8 85.8 16.8 91.8C10.1 89.8 9.9 74.6 9.9 71.7C9.9 51.8 28.4 42.1 37.5 25.3C38.3 22.8 39.4 20.3 39.9 17.9Z",
  /** The open ring: its upper end is the flame's third, innermost tongue. */
  ring: "M44.6 31.6A34.6 34.6 0 0 1 71.8 65.4A34.6 34.6 0 0 1 24.5 97.6C20.8 96.1 16 85.2 18.1 78.5C25.2 84.4 29 84.6 37.2 84.6A19.2 19.2 0 0 0 56.5 65.4A19.2 19.2 0 0 0 40.6 46.5C43.2 41.2 44.6 39 44.6 31.6Z",
  /** Outline of the whole flame (lime and red as one shape), for the one-colour mark. */
  flame:
    "M30.5 0C38.4 8.6 38.2 16.8 37.5 25.3C38.3 22.8 39.4 20.3 39.9 17.9C41.3 23.5 40.9 29.2 38.9 33.6C39.7 34.1 40.7 34.9 40.7 36C40.7 48.1 15.9 59.1 15.9 79.6C15.9 85.6 16.8 85.8 16.8 91.8C4.9 87.9 .2 71.8 .2 62.8C.2 33.6 28.6 31.1 30.5 0Z",
} as const;

/** The one-colour mark as a single path (flame and ring never touch). */
export const MARK_MONO_PATH = `${MARK_PATHS.flame}${MARK_PATHS.ring}`;

/**
 * Favicon construction, for 16–32px only: a single flame tongue and a
 * heavier ring with wider clearances, so the shape survives at 16px where the
 * full mark's secondary tips and the channel under the flame close up. Same
 * coordinate space as the mark, in a square box centred on it.
 */
export const FAVICON = {
  viewBox: "-14 0 100 100",
  flame:
    "M30.5 0C39 10.1 40.8 21.4 40.6 35.8C40.6 48.1 15.9 59.1 15.9 79.6C15.9 85.6 16.8 85.8 16.8 91.8C4.9 87.9 .2 71.8 .2 62.8C.2 33.6 28.6 31.1 30.5 0Z",
  ring: "M47.9 32.5A34.6 34.6 0 0 1 71.8 65.4A34.6 34.6 0 0 1 22.9 96.9L22.9 74.4A16.9 16.9 0 0 0 54.1 65.4A16.9 16.9 0 0 0 44.1 50Z",
  flameColor: MARK_COLORS.red,
  ringColor: MARK_COLORS.green,
} as const;

/**
 * How the mark pairs with the wordmark ("Olivia Energy", Newsreader 500,
 * tracking -0.015em). All values are in ems of the wordmark's font size.
 *
 * Horizontal lockup: the wordmark's baseline sits on the ring's base (less a
 * hair of overshoot, as round letters do) and its cap height reaches the top
 * of the ring's counter. Newsreader's cap height is 0.67em and the counter's
 * top is 46% of the way down the mark, so the mark is 0.67 / 0.53 = 1.264em
 * tall: a 22px wordmark takes a 27.8px mark.
 */
export const MARK_LOCKUP = {
  /** Newsreader cap height, as a fraction of the em. */
  capHeight: 0.67,
  /** Horizontal lockup: mark height and gap to the wordmark. */
  markEm: 1.264,
  gapEm: 0.38,
  /** How far the ring's base sits below the baseline (optical overshoot). */
  overshootEm: 0.012,
  /** Stacked lockup: mark height and gap above the wordmark. */
  stackedMarkEm: 2.6,
  stackedGapEm: 0.42,
} as const;

/**
 * Clear space on every side of the mark or a lockup: one quarter of the
 * mark's height. Minimum sizes are the height of the mark on screen.
 */
export const MARK_RULES = {
  clearSpace: 0.25,
  minMarkPx: 24,
  minLockupMarkPx: 20,
  minStackedMarkPx: 40,
  faviconBelowPx: 24,
} as const;

/** A complete, standalone SVG document for the mark (used by the asset script). */
export function markSvg(
  tone: "color" | "mono" | "inverse" = "color",
  { width, height }: { width?: number; height?: number } = {},
): string {
  const size =
    width || height
      ? ` width="${width ?? (height! * MARK_WIDTH) / MARK_HEIGHT}" height="${height ?? (width! * MARK_HEIGHT) / MARK_WIDTH}"`
      : "";
  const body =
    tone === "color"
      ? `<path fill="${MARK_COLORS.lime}" d="${MARK_PATHS.lime}"/><path fill="${MARK_COLORS.red}" d="${MARK_PATHS.red}"/><path fill="${MARK_COLORS.green}" d="${MARK_PATHS.ring}"/>`
      : `<path fill="${tone === "inverse" ? MARK_INVERSE : "currentColor"}" d="${MARK_MONO_PATH}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}"${size}>${body}</svg>`;
}

/** The favicon as a standalone SVG document. */
export function faviconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FAVICON.viewBox}"><path fill="${FAVICON.flameColor}" d="${FAVICON.flame}"/><path fill="${FAVICON.ringColor}" d="${FAVICON.ring}"/></svg>`;
}
