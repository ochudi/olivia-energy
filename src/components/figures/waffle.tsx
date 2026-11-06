import { useId } from "react";
import { rectsPath } from "@/lib/figures/scale";
import { cn } from "@/lib/utils/cn";
import { HATCH_BACKGROUND, HatchPattern } from "./hatch";

export type WaffleProps = {
  /** Squares in all (136 of 100 MW). */
  total: number;
  /** Squares lit in state 2 (45). */
  available: number;
  /** Squares still lit in state 3 (41); the rest of `available` is hatched. */
  generated: number;
  columns?: number;
  ariaLabel: string;
  className?: string;
};

const SIZE = 24;
const GAP = 6;
const UNIT = SIZE + GAP;

/**
 * Waffle — `total` squares in rows from the top left, as one path per
 * class: lit, hatched (available but not generated) and outlined
 * (unavailable). Static SVG in its final state (generated lit, the hatched
 * gap, the rest outlined). The pinned scene on What we do (chapter-
 * installed.module.css) animates the two marked paths on the step
 * timelines: `data-waffle="off"` is the unavailable squares, lit at step 1;
 * `data-waffle="cover"` lies over the hatched squares, lit at steps 1 and 2.
 */
export function Waffle({
  total,
  available,
  generated,
  columns = 17,
  ariaLabel,
  className,
}: WaffleProps) {
  const rows = Math.ceil(total / columns);
  const origin = (i: number): [number, number] => [
    (i % columns) * UNIT,
    Math.floor(i / columns) * UNIT,
  ];
  const range = (from: number, to: number) =>
    Array.from({ length: Math.max(0, to - from) }, (_, k) => origin(from + k));
  const lit = rectsPath(range(0, generated), SIZE, SIZE);
  const gap = rectsPath(range(generated, available), SIZE, SIZE);
  const off = rectsPath(range(available, total), SIZE, SIZE);
  const hatchId = `waffle-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${columns * UNIT - GAP} ${rows * UNIT - GAP}`}
      className={cn("block h-auto w-full", className)}
    >
      <defs>
        {/* About 6px on screen at the plate's width (504 units at ~320px). */}
        <HatchPattern id={hatchId} pitch={9} />
      </defs>
      <path
        data-waffle="off"
        d={off}
        fill="var(--chart-1)"
        fillOpacity={0}
        stroke="var(--color-line-strong)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <path d={lit} fill="var(--chart-1)" />
      <path
        d={gap}
        fill={`url(#${hatchId})`}
        stroke="var(--hatch-color)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <path
        data-waffle="cover"
        d={gap}
        fill="var(--chart-1)"
        fillOpacity={0}
        stroke="var(--chart-1)"
        strokeOpacity={0}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export type WaffleKeyProps = {
  /** "Each square is 100 MW" (beside a lit square). */
  unit: string;
  /** "Available, not generated" (beside a hatched square). */
  hatched: string;
  /** "Unavailable" (beside an outlined square). */
  outline: string;
  className?: string;
};

const SWATCH = "inline-block size-3 shrink-0";

/** WaffleKey — the legend for Waffle, each label beside its own square. */
export function WaffleKey({
  unit,
  hatched,
  outline,
  className,
}: WaffleKeyProps) {
  return (
    <ul
      className={cn(
        "text-ink-muted flex flex-wrap gap-x-5 gap-y-2 text-xs leading-[1.25]",
        "*:flex *:items-center *:gap-2",
        className,
      )}
    >
      <li>
        <span
          aria-hidden="true"
          className={SWATCH}
          style={{ background: "var(--chart-1)" }}
        />
        {unit}
      </li>
      <li>
        <span
          aria-hidden="true"
          className={SWATCH}
          style={{
            backgroundImage: HATCH_BACKGROUND,
            boxShadow: "inset 0 0 0 1px var(--hatch-color)",
          }}
        />
        {hatched}
      </li>
      <li>
        <span
          aria-hidden="true"
          className={cn(SWATCH, "border-line-strong border")}
        />
        {outline}
      </li>
    </ul>
  );
}
