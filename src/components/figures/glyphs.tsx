import type { CSSProperties } from "react";
import type { GlyphSpec } from "@/types/contracts";
import { formatNumber } from "@/lib/figures/format";
import { dotsPath } from "@/lib/figures/scale";
import { cn } from "@/lib/utils/cn";
import { HATCH_BACKGROUND } from "./hatch";

/* ------------------------------------------------------------------ */
/* Comparison glyphs for the numeral tiles and cards (Home and What we */
/* do chapters). Bars are HTML so the hatch is pixel-exact; the  */
/* dots are one SVG path. Colour is currentColor: ink on lime, ink on   */
/* card, white on night. The hatch is red and means the gap. The glyph  */
/* is what moves on a tile (DESIGN.md, Motion: numerals never count     */
/* up): the dots appear, the bars sweep and the hatch follows, on the   */
/* view timeline of the tile's figure-scope (or the dots' own svg).     */
/* ------------------------------------------------------------------ */

const HATCH_STYLE: CSSProperties = {
  backgroundImage: HATCH_BACKGROUND,
  boxShadow: "inset 0 0 0 1px var(--hatch-outline)",
};

const pct = (v: number, total: number) =>
  total > 0 ? Math.max(0, Math.min(100, (v / total) * 100)) : 0;

const width = (p: number) => ({ width: `max(${p.toFixed(2)}%, 3px)` });

export type DotRowProps = {
  count: number;
  /** Dots per row; by default the grid is about three times wider than tall. */
  perRow?: number;
  ariaLabel: string;
  className?: string;
};

/** DotRow — `count` dots as one path ("87 dots, each one million people"). */
export function DotRow({ count, perRow, ariaLabel, className }: DotRowProps) {
  const cols = Math.max(1, perRow ?? Math.ceil(Math.sqrt(count * 3)));
  const rows = Math.max(1, Math.ceil(count / cols));
  const unit = 10;
  const r = 3.2;
  const centres: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    centres.push([
      (i % cols) * unit + unit / 2,
      Math.floor(i / cols) * unit + unit / 2,
    ]);
  }
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${cols * unit} ${rows * unit}`}
      className={cn("draw-scope block h-auto w-full", className)}
    >
      <path className="draw-dot" d={dotsPath(centres, r)} fill="currentColor" />
    </svg>
  );
}

export type ShareBarProps = {
  value: number;
  total: number;
  /** Under the start of the bar, and at its end; an empty label is skipped. */
  labels: readonly [string, string];
  /**
   * Which part is the gap. `remainder` (the default): the value is solid
   * and the rest of the bar is hatched (available of installed). `value`:
   * the value itself is hatched (debt service as a share of investment,
   * What we do chapter 06).
   */
  hatch?: "value" | "remainder";
  className?: string;
};

/** ShareBar — one bar: a share of a total, with the gap hatched. */
export function ShareBar({
  value,
  total,
  labels,
  hatch = "remainder",
  className,
}: ShareBarProps) {
  const mode = hatch;
  const p = pct(value, total);
  const named = labels.filter(Boolean);
  const share = `${formatNumber(p, Number.isInteger(p) ? 0 : 1)}%`;
  const ariaLabel =
    named.length === 2
      ? `${named[0]} ${share} of ${named[1]}`
      : `${named[0] ?? "Share"}: ${share}`;
  return (
    <div role="img" aria-label={ariaLabel} className={cn("w-full", className)}>
      <div className="relative h-7 w-full border border-current/40">
        {mode === "remainder" ? (
          <>
            <div
              className="sweep absolute inset-y-0 left-0 bg-current"
              style={width(p)}
            />
            <div
              className="hatch absolute inset-y-0 right-0"
              style={{ ...HATCH_STYLE, ...width(100 - p) }}
            />
          </>
        ) : (
          <div
            className="hatch absolute inset-y-0 left-0"
            style={{ ...HATCH_STYLE, ...width(p) }}
          />
        )}
      </div>
      {named.length ? (
        <div className="mt-2 flex justify-between gap-4 text-xs leading-[1.25]">
          {labels[0] ? <span>{labels[0]}</span> : null}
          {labels[1] ? (
            <span className="ml-auto text-right">{labels[1]}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type CompareBarsProps = {
  a: { value: number; label: string };
  b: { value: number; label: string };
  /**
   * gap: the longer bar's excess over the shorter is hatched (2% of
   * investment against 20% of people). growth: two solid bars (46 to 350).
   */
  mode: "gap" | "growth";
  className?: string;
};

/** CompareBars — two bars to one scale, labelled, the difference hatched in gap mode. */
export function CompareBars({ a, b, mode, className }: CompareBarsProps) {
  const max = Math.max(a.value, b.value, 0);
  const min = Math.min(a.value, b.value);
  const rows = [a, b];
  // Whole numbers without a decimal ("2", not "2.00"); others to one place.
  const n = (v: number) => formatNumber(v, Number.isInteger(v) ? 0 : 1);
  const ariaLabel = `${a.label} ${n(a.value)}, ${b.label} ${n(b.value)}`;
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("flex w-full flex-col gap-3", className)}
    >
      {rows.map((row, i) => {
        const p = pct(row.value, max);
        const longer =
          mode === "gap" && row.value === max && a.value !== b.value;
        return (
          <div key={i}>
            <div className="mb-1.5 text-xs leading-[1.25]">{row.label}</div>
            <div className="relative h-5 w-full">
              {longer ? (
                <>
                  <div
                    className="sweep absolute inset-y-0 left-0 bg-current"
                    style={width(pct(min, max))}
                  />
                  <div
                    className="hatch absolute inset-y-0"
                    style={{
                      ...HATCH_STYLE,
                      left: `max(${pct(min, max).toFixed(2)}%, 3px)`,
                      width: `calc(${(p - pct(min, max)).toFixed(2)}% - 0px)`,
                    }}
                  />
                </>
              ) : (
                <div
                  className="sweep absolute inset-y-0 left-0 bg-current"
                  style={width(p)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type GlyphForProps = {
  spec: GlyphSpec;
  /** Overrides ShareBar's default for a share glyph. */
  shareHatch?: "value" | "remainder";
  ariaLabel?: string;
  className?: string;
};

/** GlyphFor — renders a content `GlyphSpec` with the matching glyph. */
export function GlyphFor({
  spec,
  shareHatch,
  ariaLabel,
  className,
}: GlyphForProps) {
  switch (spec.kind) {
    case "dots":
      return (
        <DotRow
          count={spec.count}
          ariaLabel={ariaLabel ?? `${formatNumber(spec.count, 0)} dots`}
          className={className}
        />
      );
    case "share":
      return (
        <ShareBar
          value={spec.value}
          total={spec.total}
          labels={spec.labels}
          hatch={shareHatch}
          className={className}
        />
      );
    case "compare":
      return (
        <CompareBars
          a={spec.a}
          b={spec.b}
          mode={spec.mode}
          className={className}
        />
      );
  }
}
