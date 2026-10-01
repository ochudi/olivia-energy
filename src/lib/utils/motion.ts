/**
 * Client-side readers for motion tokens.
 *
 * The CSS custom properties in src/styles/tokens.css are the single source of
 * truth. JavaScript animations (e.g. AnimatedNumber) read them at run time
 * instead of duplicating the values, so changing a token changes everything.
 */

const FALLBACK_BEZIER: readonly [number, number, number, number] = [
  0.16, 1, 0.3, 1,
];

export function readCssToken(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value.length > 0 ? value : null;
}

/** Parses `240ms` / `0.24s` into seconds. */
export function parseDurationSeconds(
  value: string | null,
  fallbackSeconds: number,
): number {
  if (!value) return fallbackSeconds;
  const match = /^([\d.]+)\s*(ms|s)$/.exec(value);
  if (!match) return fallbackSeconds;
  const n = parseFloat(match[1] ?? "");
  if (Number.isNaN(n)) return fallbackSeconds;
  return match[2] === "ms" ? n / 1000 : n;
}

/** Parses `cubic-bezier(a, b, c, d)` into a tuple for framer-motion. */
export function parseCubicBezier(
  value: string | null,
  fallback: readonly [number, number, number, number] = FALLBACK_BEZIER,
): [number, number, number, number] {
  if (!value) return [...fallback];
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  if (!match) return [...fallback];
  const parts = (match[1] ?? "").split(",").map((p) => parseFloat(p.trim()));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) {
    return [...fallback];
  }
  return [parts[0]!, parts[1]!, parts[2]!, parts[3]!];
}

/**
 * A CSS cubic-bezier easing as a function of progress (0–1). Solves the
 * curve for x with Newton–Raphson, falling back to bisection; matches the
 * browser's interpretation of the same four numbers.
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const c = (a1: number) => 3 * a1;
  const bezier = (t: number, a1: number, a2: number) =>
    ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
  const slope = (t: number, a1: number, a2: number) =>
    3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1);
  const solve = (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) break;
      const err = bezier(t, x1, x2) - x;
      if (Math.abs(err) < 1e-6) return t;
      t -= err / s;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (hi - lo > 1e-6) {
      t = (lo + hi) / 2;
      if (bezier(t, x1, x2) < x) lo = t;
      else hi = t;
    }
    return t;
  };
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return bezier(solve(t), y1, y2);
  };
}

export type AnimateValueOptions = {
  from: number;
  to: number;
  /** Milliseconds. */
  duration: number;
  ease?: (t: number) => number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

/** Tweens a number on requestAnimationFrame. Returns a handle to stop it. */
export function animateValue({
  from,
  to,
  duration,
  ease = (t) => t,
  onUpdate,
  onComplete,
}: AnimateValueOptions): { stop: () => void } {
  let frame = 0;
  let start: number | null = null;
  const step = (now: number) => {
    if (start === null) start = now;
    const progress = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
    onUpdate(from + (to - from) * ease(progress));
    if (progress < 1) frame = requestAnimationFrame(step);
    else onComplete?.();
  };
  frame = requestAnimationFrame(step);
  return { stop: () => cancelAnimationFrame(frame) };
}
