import type { CSSProperties } from "react";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { laneLayout, type LaneMark } from "@/lib/figures/lane";
import { cn } from "@/lib/utils/cn";

export type TimelineItem = {
  /** ISO date "2026-09-10", or a bare year "2024" (placed mid-year). */
  date: string;
  kind: "article" | "oped";
};

export type PrintTimelineProps = {
  items: readonly TimelineItem[];
  /** First and last year shown, inclusive. */
  from: number;
  to: number;
  ariaLabel: string;
  /** Legend labels ("Journal article", "BusinessDay op-ed"); omitted when absent. */
  legend?: { article: string; oped: string };
  /**
   * How the timeline draws itself (DESIGN.md, Motion). `lead`: the
   * Research page's signature moment, once on load on a desktop where the
   * plate is in the first screen, scroll-driven below 48rem. `scroll`: as
   * it scrolls into view. `none`: finished.
   */
  motion?: "lead" | "scroll" | "none";
  className?: string;
};

/** Journal article ring, px. */
const MARK = 14;
/** Article stacking step, px. */
const LEVEL = 18;
/** Op-ed flame: height (h-3.5), its width at that height (41 x 92 units), row step, px. */
const FLAME = 14;
const FLAME_W = 7;
const ROW = 17;
/**
 * Op-ed lane, laid out twice: for plates from 272 px (a 360 px phone) and
 * for plates from 420 px, where marks have more room and fewer need to
 * cluster. A container query on the figure picks the layout. Clear space
 * between flames in one row: 4 px.
 */
const LANE_NARROW = { refWidth: 272, mark: FLAME_W, gap: 4 } as const;
const LANE_WIDE = { refWidth: 420, mark: FLAME_W, gap: 4 } as const;
/** An op-ed's position: the narrow layout, the wide one from a 420 px plate (26.25rem). */
const WIDE_CLASSES =
  "left-(--x) top-(--y) @min-[26.25rem]:left-(--xw) @min-[26.25rem]:top-(--yw)";

function decimalYear(date: string): number {
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/.exec(date);
  if (!m) return NaN;
  const year = Number(m[1]);
  if (!m[2]) return year + 0.5;
  const month = Number(m[2]) - 1;
  const day = m[3] ? Number(m[3]) : 15;
  return year + (month + (day - 1) / 31) / 12;
}

function Marker({ kind }: { kind: TimelineItem["kind"] }) {
  return kind === "article" ? (
    <span
      aria-hidden="true"
      className="bg-canvas block rounded-full border-2"
      style={{ width: MARK, height: MARK, borderColor: "var(--chart-1)" }}
    />
  ) : (
    // currentColor on the flame: the second chart colour (white on night).
    <FlameBullet className="block h-3.5" />
  );
}

/**
 * PrintTimeline: Research Fig. 1, the founder's journal articles (rings,
 * above the line, stacked by year: their month is not known) and op-eds
 * (flames, below the line, at their month). Op-eds that would touch zigzag
 * in two rows around their mean date (`laneLayout`), so a burst of writing
 * reads as a dense run, never a tower. The axis and the marks are drawn by
 * one sweep from the first year to the last; each marker pops as the sweep
 * reaches its date.
 */
export function PrintTimeline({
  items,
  from,
  to,
  ariaLabel,
  legend,
  motion = "scroll",
  className,
}: PrintTimelineProps) {
  const span = to + 1 - from;
  const placed = items
    .map((it) => ({ ...it, t: decimalYear(it.date) }))
    .filter((it) => Number.isFinite(it.t) && it.t >= from && it.t < to + 1)
    .sort((a, b) => a.t - b.t)
    .map((it) => ({ ...it, x: (it.t - from) / span }));

  const articles = placed.filter((p) => p.kind === "article");
  const opeds = placed.filter((p) => p.kind === "oped");

  // Articles carry a year only: stack each year's rings upwards.
  const perYear = new Map<number, number>();
  const articleLevel = articles.map((p) => {
    const y = Math.floor(p.t);
    const level = perYear.get(y) ?? 0;
    perYear.set(y, level + 1);
    return level;
  });
  const up = Math.max(1, ...perYear.values());
  const xs = opeds.map((p) => p.x);
  const narrow = laneLayout(xs, LANE_NARROW);
  const wide = laneLayout(xs, LANE_WIDE);
  const rows = [...narrow, ...wide].some((m) => m.row === 1) ? 2 : 1;
  const axis = up * LEVEL + MARK / 2;
  const laneTop = axis + 8;
  const years = Array.from({ length: span }, (_, i) => from + i);

  const at = (m: LaneMark) =>
    `calc(${(m.centre * 100).toFixed(3)}% + ${m.offset.toFixed(1)}px)`;
  const marks: {
    p: (typeof placed)[number];
    place: CSSProperties;
    className?: string;
    color: string;
  }[] = [
    ...articles.map((p, i) => ({
      p,
      place: {
        left: `${p.x * 100}%`,
        top: (up - 1 - articleLevel[i]!) * LEVEL,
        width: MARK,
        height: MARK,
      },
      color: "var(--chart-1)",
    })),
    ...opeds.map((p, i) => ({
      p,
      place: {
        "--x": at(narrow[i]!),
        "--y": `${laneTop + narrow[i]!.row * ROW}px`,
        "--xw": at(wide[i]!),
        "--yw": `${laneTop + wide[i]!.row * ROW}px`,
        width: FLAME_W,
        height: FLAME,
      } as CSSProperties,
      className: WIDE_CLASSES,
      color: "var(--chart-2)",
    })),
  ].sort((a, b) => a.p.t - b.p.t);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "@container w-full",
        motion !== "none" && "figure-scope",
        motion === "lead" && "figure-lead",
        className,
      )}
    >
      {/* The sweep clips the axis and every mark, so the marks appear in
          date order as it passes them. */}
      <div
        className="sweep relative"
        style={{ height: laneTop + (rows - 1) * ROW + FLAME }}
      >
        <div
          aria-hidden="true"
          className="bg-line-strong absolute inset-x-0 h-px"
          style={{ top: axis }}
        />
        {years.map((y, i) => (
          <span
            key={y}
            aria-hidden="true"
            className="bg-line-strong absolute h-2 w-px"
            style={{ left: `${(i / span) * 100}%`, top: axis - 4 }}
          />
        ))}
        <span
          aria-hidden="true"
          className="bg-line-strong absolute right-0 h-2 w-px"
          style={{ top: axis - 4 }}
        />
        {marks.map(({ p, place, className: placeClass, color }, i) => (
          <span
            key={`${p.kind}-${p.date}-${i}`}
            className={cn(
              "pop absolute flex items-center justify-center",
              placeClass,
            )}
            style={
              {
                ...place,
                transform: "translateX(-50%)",
                color,
                // Where along the sweep this mark sits (the lead figure's
                // load animation pops it as the sweep reaches it).
                "--pop-at": p.x.toFixed(3),
              } as CSSProperties
            }
          >
            <Marker kind={p.kind} />
          </span>
        ))}
      </div>
      <div className="text-ink-muted numerals relative mt-3 h-4 text-xs leading-none">
        {years.map((y, i) => (
          <span
            key={y}
            className="absolute -translate-x-1/2"
            style={{ left: `${((i + 0.5) / span) * 100}%` }}
          >
            {y}
          </span>
        ))}
      </div>
      {legend ? (
        <ul className="text-ink-muted mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <li className="flex items-center gap-2">
            <Marker kind="article" />
            {legend.article}
          </li>
          <li
            className="flex items-center gap-2"
            style={{ color: "var(--chart-2)" }}
          >
            <Marker kind="oped" />
            <span className="text-ink-muted">{legend.oped}</span>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
