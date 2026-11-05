import { MARK_HEIGHT, MARK_MONO_PATH, MARK_WIDTH } from "@/lib/brand/mark";

/**
 * The mark window's geometry (creative brief 2.10). Pure functions, shared
 * by the server markup and the client stage, so the path data is built once
 * and never changes: only the <g>'s transform moves.
 *
 * Units are the mark's own (72 x 100 box). The flood is one even-odd path:
 * a rectangle far larger than any viewport at any scale, with the mark
 * silhouette as the hole the photograph shows through.
 */

/** Rectangle bounds in mark units (at the final scale of about 5.8 px a unit it is still about 11,500 px from the mark). */
const FAR = 2000;

export const FLOOD_PATH = `M${-FAR} ${-FAR}H${MARK_WIDTH + FAR}V${MARK_HEIGHT + FAR}H${-FAR}Z${MARK_MONO_PATH}`;

/**
 * The zoom anchor: the middle of the flame's broad lower body (the lime
 * and red tongues together are about 17 units wide and 44 tall here), near
 * the mark's left edge. Zooming about a point this far left keeps the
 * whole mark to the right of the anchor as it shrinks, so the flood
 * arrives from the left edge as one curved front, clears the text columns
 * before the lines appear, and never sweeps the flame back across them.
 */
export const ANCHOR = { x: 8.5, y: 64 } as const;

/**
 * Progress windows (brief 2.10). `why` is 0.18, not 0.22 (Q3): by 0.18 the
 * flood has cleared the text columns, and the earlier fade removes a beat
 * of flat green with no words between the hero copy and Why Olivia.
 */
export const P = {
  heroFadeFrom: 0.04,
  heroFadeTo: 0.16,
  floodFrom: 0.08,
  floodTo: 0.42,
  why: 0.18,
  firstLine: 0.3,
  lineStep: 0.07,
  closing: 0.86,
} as const;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** The brief's in-out curve, cubic-bezier(0.65, 0, 0.35, 1), approximated by a symmetric cubic (max error under 2%). */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type FloodFrame = {
  /** Screen position of the anchor at rest and at the end (stage pixels). */
  ax: number;
  ay: number;
  /** Scale (px a mark unit) when the hole covers the viewport. */
  s0: number;
  /** Final scale: the mark fills the slot. */
  sf: number;
};

/** The flood's flood progress (0 to 1, eased) at scroll progress p. */
export function floodProgress(p: number): number {
  return easeInOut(clamp01((p - P.floodFrom) / (P.floodTo - P.floodFrom)));
}

/**
 * The scale at eased progress e: the reciprocal is interpolated, which is
 * a camera pulling back at constant speed (a dolly). Most of the closing
 * happens early, so by p = 0.22 the left half is flood and by p = 0.30 the
 * mark is within a fifth of its final size, clear of the lines.
 */
export function floodScale(frame: FloodFrame, e: number): number {
  return 1 / (1 / frame.s0 + (1 / frame.sf - 1 / frame.s0) * e);
}

/**
 * The transform attribute for the <g> at scroll progress p: a scale about
 * the anchor, which sits at its final position on screen throughout.
 */
export function floodTransform(frame: FloodFrame, p: number): string {
  const s = floodScale(frame, floodProgress(p));
  const tx = frame.ax - ANCHOR.x * s;
  const ty = frame.ay - ANCHOR.y * s;
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`;
}

/**
 * The frame for a stage of width w and height h whose mark slot (the
 * window's box, 72:100) sits at x, y with height sh, all in stage pixels.
 * `inside(mx, my)` reports whether a point in mark units is inside the mark
 * silhouette; the client passes Path2D's isPointInPath. S0 is the smallest
 * scale at which every sampled point of the stage falls inside the hole,
 * plus a margin, so at rest no green shows anywhere.
 */
export function floodFrame(
  stage: { w: number; h: number },
  slot: { x: number; y: number; h: number },
  inside: (mx: number, my: number) => boolean,
): FloodFrame {
  const sf = slot.h / MARK_HEIGHT;
  const ax = slot.x + ANCHOR.x * sf;
  const ay = slot.y + ANCHOR.y * sf;
  const samples: [number, number][] = [];
  const cols = 12;
  const rows = 8;
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      samples.push([(stage.w * i) / cols, (stage.h * j) / rows]);
    }
  }
  const covers = (s: number) =>
    samples.every(([x, y]) =>
      inside(ANCHOR.x + (x - ax) / s, ANCHOR.y + (y - ay) / s),
    );
  let hi = sf * 2;
  while (!covers(hi) && hi < sf * 4096) hi *= 2;
  let lo = hi / 2;
  for (let k = 0; k < 18; k++) {
    const mid = (lo + hi) / 2;
    if (covers(mid)) hi = mid;
    else lo = mid;
  }
  return { ax, ay, s0: hi * 1.12, sf };
}
