/**
 * Pure scale and path helpers for the server-rendered figures. No DOM, no
 * dependencies; every path is rounded (one decimal by default) so the markup
 * stays small and stable between renders.
 */

export type Scale = (v: number) => number;

export type Point = readonly [number, number];

/** Linear map from `domain` to `range`; values outside the domain extrapolate. */
export function linear(
  domain: [number, number],
  range: [number, number],
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => r0;
  const k = (r1 - r0) / span;
  return (v) => r0 + (v - d0) * k;
}

/** Base-10 logarithmic map; the domain must be positive. */
export function log10(
  domain: [number, number],
  range: [number, number],
): Scale {
  const [d0, d1] = domain;
  if (d0 <= 0 || d1 <= 0) {
    throw new Error("log10 scale needs a positive domain");
  }
  const l = linear([Math.log10(d0), Math.log10(d1)], range);
  return (v) => l(Math.log10(v));
}

/**
 * About `count` round tick values covering the domain (steps of 1, 2 or 5
 * times a power of ten), clamped to the domain.
 */
export function ticks(domain: [number, number], count: number): number[] {
  const [a, b] = domain;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  if (lo === hi || count < 1) return [lo];
  const rough = (hi - lo) / count;
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const ratio = rough / power;
  const step =
    (ratio >= 7.5 ? 10 : ratio >= 3.5 ? 5 : ratio >= 1.5 ? 2 : 1) * power;
  const out: number[] = [];
  const start = Math.ceil(lo / step - 1e-9) * step;
  const digits = Math.max(0, -Math.floor(Math.log10(step)));
  for (let v = start; v <= hi + step * 1e-9; v += step) {
    out.push(Number(v.toFixed(digits)));
  }
  return a <= b ? out : out.reverse();
}

/** Powers of ten between the domain ends, inclusive, for a log axis. */
export function logTicks(domain: [number, number]): number[] {
  const lo = Math.ceil(Math.log10(Math.min(...domain)) - 1e-9);
  const hi = Math.floor(Math.log10(Math.max(...domain)) + 1e-9);
  const out: number[] = [];
  for (let p = lo; p <= hi; p++) out.push(Math.pow(10, p));
  return out;
}

/** Number to a fixed precision without a trailing ".0" or "-0". */
export function fixed(v: number, precision = 1): string {
  const s = v.toFixed(precision);
  const trimmed = s.includes(".") ? s.replace(/\.?0+$/, "") : s;
  return trimmed === "-0" ? "0" : trimmed;
}

const pair = (p: Point, x: Scale, y: Scale, precision: number) =>
  `${fixed(x(p[0]), precision)} ${fixed(y(p[1]), precision)}`;

/** `M x y L x y ...` through every point, in order. */
export function linePath(
  points: readonly Point[],
  x: Scale,
  y: Scale,
  precision = 1,
): string {
  if (points.length === 0) return "";
  let d = `M${pair(points[0], x, y, precision)}`;
  for (let i = 1; i < points.length; i++) {
    d += `L${pair(points[i], x, y, precision)}`;
  }
  return d;
}

/** The closed region between two lines (the gap hatch). */
export function bandPath(
  upper: readonly Point[],
  lower: readonly Point[],
  x: Scale,
  y: Scale,
  precision = 1,
): string {
  if (upper.length === 0 || lower.length === 0) return "";
  let d = linePath(upper, x, y, precision);
  for (let i = lower.length - 1; i >= 0; i--) {
    d += `L${pair(lower[i], x, y, precision)}`;
  }
  return d + "Z";
}

/** The closed region between a line and a horizontal baseline value. */
export function areaPath(
  points: readonly Point[],
  baseline: number,
  x: Scale,
  y: Scale,
  precision = 1,
): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  const base = fixed(y(baseline), precision);
  return (
    linePath(points, x, y, precision) +
    `L${fixed(x(last[0]), precision)} ${base}` +
    `L${fixed(x(first[0]), precision)} ${base}Z`
  );
}

/**
 * Repeated geometry as one path: a circle of radius r at every centre,
 * drawn with two arcs, so a hundred dots cost one element.
 */
export function dotsPath(
  centres: readonly Point[],
  r: number,
  precision = 1,
): string {
  const d2 = fixed(r * 2, precision);
  const rr = fixed(r, precision);
  let d = "";
  for (const [cx, cy] of centres) {
    d += `M${fixed(cx - r, precision)} ${fixed(cy, precision)}a${rr} ${rr} 0 1 0 ${d2} 0a${rr} ${rr} 0 1 0 -${d2} 0`;
  }
  return d;
}

/** Repeated geometry as one path: an axis-aligned rectangle at every origin. */
export function rectsPath(
  origins: readonly Point[],
  w: number,
  h: number,
  precision = 1,
): string {
  const ww = fixed(w, precision);
  const hh = fixed(h, precision);
  let d = "";
  for (const [x, y] of origins) {
    d += `M${fixed(x, precision)} ${fixed(y, precision)}h${ww}v${hh}h-${ww}Z`;
  }
  return d;
}
