"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

export type ChartReadoutProps = {
  /** The x values in order (years). */
  xs: number[];
  /** `labels[i]` is the x shown for `xs[i]` ("2024"). */
  labels: string[];
  /** `values[i][k]` is the formatted value of line k at `xs[i]`, or "" if missing. */
  values: string[][];
  /**
   * Readout text with {year} and {a}, {b}, {c}... for the lines in order
   * ("{year}: Nigeria {a}%, sub-Saharan Africa {b}%, world {c}%").
   */
  template: string;
  /** Left and right edges of the plot as percents of the box: wide (768px+) and tall. */
  plot: { wide: [number, number]; tall: [number, number] };
  /** Visually hidden instruction (the readout hint). */
  hint: string;
  children: ReactNode;
};

const KEYS = "abcdefghij";

/**
 * ChartReadout — the only client code in the figures kit. It wraps the
 * chart box; pointer or touch movement and the arrow keys pick the nearest
 * year, a vertical rule marks it and one aria-live line reads the values.
 * Server HTML already shows the latest year, so nothing depends on
 * hydration.
 */
export function ChartReadout({
  xs,
  labels,
  values,
  template,
  plot,
  hint,
  children,
}: ChartReadoutProps) {
  const last = xs.length - 1;
  const [i, setI] = useState(last);
  /** The rule's left edge as a percent of the box, or null when idle. */
  const [pos, setPos] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const edges = () =>
    window.matchMedia("(min-width: 768px)").matches ? plot.wide : plot.tall;

  const pick = (n: number) => {
    const c = Math.max(0, Math.min(last, n));
    const [l, r] = edges();
    setI(c);
    setPos(last ? l + (c / last) * (r - l) : l);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = box.current;
    if (!el || last < 1) return;
    const rect = el.getBoundingClientRect();
    const [l, r] = edges();
    const f = ((e.clientX - rect.left) / rect.width) * 100;
    pick(Math.round(((f - l) / (r - l)) * last));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (!step) return;
    e.preventDefault();
    pick(i + step);
  };

  const text = template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k === "year" ? labels[i] : (values[i][KEYS.indexOf(k)] ?? m),
  );

  return (
    <>
      <div
        ref={box}
        className="relative touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
        tabIndex={0}
        onPointerMove={onMove}
        onPointerDown={onMove}
        // A finger lifting keeps its year on screen; a mouse leaving clears the rule.
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setPos(null);
        }}
        onBlur={() => setPos(null)}
        onKeyDown={onKey}
      >
        <span className="sr-only">{hint}</span>
        {children}
        {pos !== null ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px bg-[var(--chart-axis)]"
            style={{ left: `${pos}%` }}
          />
        ) : null}
      </div>
      <p
        aria-live="polite"
        className="numerals text-ink-muted mt-2 min-h-[1.5em] text-sm"
      >
        {text}
      </p>
    </>
  );
}
