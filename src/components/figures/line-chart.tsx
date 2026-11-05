import { Fragment, useId } from "react";
import type { SeriesId } from "@/types/contracts";
import { Chip } from "@/components/ui/chip";
import { Reveal } from "@/components/ui/reveal";
import { getSeries } from "@/content/data/series";
import { MICROCOPY } from "@/content/site";
import {
  layoutChart,
  VIEWBOX,
  type ChartLayout,
  type Label,
  type LineInput,
  type Variant,
} from "@/lib/figures/chart-layout";
import {
  formatNumber,
  formatValue,
  formatYear,
  type ValueFormat,
} from "@/lib/figures/format";
import { cn } from "@/lib/utils/cn";
import { ChartReadout } from "./chart-readout";
import { HATCH_BACKGROUND, HatchPattern, hatchPitch } from "./hatch";

export type ChartColor = "chart-1" | "chart-2" | "chart-3";

export type LineChartProps = {
  series: SeriesId;
  /** Line names to draw, in legend order (the first is the lead). */
  include: string[];
  x: { from: number; to: number; ticks: number[] };
  y: {
    from: number;
    to: number;
    ticks: number[];
    scale?: "linear" | "log";
    format: ValueFormat;
    decimals?: number;
  };
  colors: Record<string, ChartColor>;
  /** Per line: "World 91.9%", "{name} {value}", or just "World". */
  endLabels: Record<string, string>;
  /** The same, at a line's first point ("$132.38 in 1975"). */
  startLabels?: Record<string, string>;
  /** Hatch the band between two lines and name it with the solid red pill. */
  gap?: { upper: string; lower: string; pill: string };
  /** Hatch the area under one line. */
  hatchArea?: string;
  /** An annotation pill that is not a gap ("99.8% cheaper", lime on night). */
  pill?: { text: string; tone?: "gap" | "opening"; at?: number; on?: string };
  /**
   * Mounts the readout island. `true` reads "{year}: Name value, ..." with
   * units; a template of your own gets bare numbers for {a}, {b}, {c}...
   * (in `names` order, else `include` order) so it can carry the unit.
   */
  readout?: boolean | { template: string; names?: string[] };
  ariaLabel: string;
  /** Wrap in a sweep Reveal (sweep, hatch, pop on entering the viewport). */
  animate?: boolean;
  /** How wide the plate is shown at 768px+ (sets the hatch pitch). */
  plate?: "full" | "half";
  className?: string;
};

const COLOR: Record<ChartColor, string> = {
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
};

/* How a pill sits on its anchor point (see ChartLayout.pill). */
const PILL_OFFSET = {
  centre: "translate(-50%, -50%)",
  above: "translate(10px, calc(-100% - 6px))",
  below: "translate(10px, 6px)",
} as const;

/* The plate's chart width at 1440 for each plate size, for the hatch pitch. */
const PLATE_PX = { full: 1232, half: 572 } as const;

/**
 * One end or start label: the value in Newsreader, the words in 12px sans.
 * An end label stacks beside its marker; a start label runs on one line
 * above and to the right of its point (the line leaves below it).
 */
function EndLabel({
  label,
  anchor,
  valueClass,
}: {
  label: Label;
  anchor: "end" | "start";
  valueClass: string;
}) {
  const words = [label.before, label.after].filter(Boolean);
  const start = anchor === "start";
  return (
    <div
      className={cn(
        "pop absolute flex leading-none",
        start ? "flex-row items-baseline gap-1.5 pl-3.5" : "flex-col pl-3.5",
      )}
      style={{
        left: `${label.x}%`,
        top: `${label.labelY}%`,
        transform: start ? "translateY(calc(-100% + 4px))" : "translateY(-50%)",
        maxWidth: `${Math.max(12, 100 - label.x)}%`,
      }}
    >
      <span
        className={cn(
          "font-display numerals block whitespace-nowrap",
          valueClass,
        )}
        style={{ color: COLOR[label.color], order: 1 }}
      >
        {label.value}
      </span>
      {words.length ? (
        <span
          className={cn(
            "text-ink-muted block text-xs leading-[1.25]",
            start ? "whitespace-nowrap" : "mt-1 text-pretty",
          )}
          style={{ order: label.before ? 0 : 2 }}
        >
          {/* Each word unbreakable, so a compound such as "Sub-Saharan"
              never splits at its hyphen (WebKit at 390 broke it into three
              lines); the label wraps between words only. */}
          {words
            .join(" ")
            .split(" ")
            .map((word, i) => (
              <Fragment key={i}>
                {i > 0 ? " " : null}
                <span className="whitespace-nowrap">{word}</span>
              </Fragment>
            ))}
        </span>
      ) : null}
    </div>
  );
}

function Box({
  layout,
  variant,
  hatchId,
  pitch,
  pill,
  gapPill,
  valueClass,
}: {
  layout: ChartLayout;
  variant: Variant;
  hatchId: string;
  pitch: number;
  pill?: LineChartProps["pill"];
  gapPill?: string;
  valueClass: string;
}) {
  const box = VIEWBOX[variant];
  const grid = layout.gridY
    .map(
      (g) =>
        `M${box.plotLeft} ${((g.y / 100) * box.h).toFixed(1)}H${box.plotRight}`,
    )
    .join("");
  return (
    <div
      className={cn(
        "relative w-full",
        variant === "tall" ? "md:hidden" : "hidden md:block",
      )}
      style={{ aspectRatio: `${box.w} / ${box.h}` }}
    >
      <svg
        viewBox={`0 0 ${box.w} ${box.h}`}
        className="block h-full w-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <HatchPattern id={hatchId} pitch={pitch} />
        </defs>
        <path
          d={grid}
          fill="none"
          stroke="var(--chart-grid)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {layout.area ? (
          <path
            className="hatch"
            d={layout.area.d}
            fill={`url(#${hatchId})`}
            stroke="var(--hatch-outline)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {layout.gap ? (
          <path
            className="hatch"
            d={layout.gap.d}
            fill={`url(#${hatchId})`}
            stroke="var(--hatch-outline)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <g
          className="sweep"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {layout.lines.map((l) => (
            <path
              key={l.name}
              d={l.d}
              stroke={COLOR[l.color]}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>

      {/* Tick labels, end markers, labels and pills are HTML. Shared
          styles sit on a wrapper (`*:`), so the markup stays light. */}
      <div
        aria-hidden="true"
        className="text-ink-muted numerals pointer-events-none text-xs leading-none *:absolute *:left-0 *:-translate-y-1/2 *:pr-2.5 *:text-right"
      >
        {layout.gridY.map((g) => (
          <span
            key={g.y}
            style={{ top: `${g.y}%`, width: `${layout.plotLeftPct}%` }}
          >
            {g.label}
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="*:bg-canvas pointer-events-none *:absolute *:size-3 *:-translate-1/2 *:rounded-full *:border-2"
      >
        {[...layout.startLabels, ...layout.endLabels].map((l) => (
          <span
            key={`${l.name}-${l.x}`}
            className="pop"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              borderColor: COLOR[l.color],
            }}
          />
        ))}
      </div>
      {layout.startLabels.map((l) => (
        <EndLabel
          key={`s-${l.name}`}
          label={l}
          anchor="start"
          valueClass={valueClass}
        />
      ))}
      {layout.endLabels.map((l) => (
        <EndLabel
          key={`e-${l.name}`}
          label={l}
          anchor="end"
          valueClass={valueClass}
        />
      ))}
      {layout.gap && layout.pill && gapPill ? (
        <span
          className="pop absolute"
          style={{
            left: `${layout.pill.x}%`,
            top: `${layout.pill.y}%`,
            transform: PILL_OFFSET[layout.pill.anchor],
          }}
        >
          <Chip tone="gap">{gapPill}</Chip>
        </span>
      ) : null}
      {pill && layout.pill && !layout.gap ? (
        <span
          className="pop absolute"
          style={{
            left: `${layout.pill.x}%`,
            top: `${layout.pill.y}%`,
            transform: PILL_OFFSET[layout.pill.anchor],
          }}
        >
          <Chip tone={pill.tone ?? "opening"}>{pill.text}</Chip>
        </span>
      ) : null}
    </div>
  );
}

/**
 * LineChart — a server-rendered line chart: two viewBoxes (wide 1200 x 560
 * at 768px and up, tall 360 x 440 below) switched in CSS, each with a fixed
 * aspect ratio; paths rounded to one decimal; every label, marker and pill
 * is HTML positioned in percent. The gap hatch is the only hatch. The
 * readout is the one client island.
 */
export function LineChart({
  series,
  include,
  x,
  y,
  colors,
  endLabels,
  startLabels,
  gap,
  hatchArea,
  pill,
  readout,
  ariaLabel,
  animate = true,
  plate = "full",
  className,
}: LineChartProps) {
  const file = getSeries(series);
  const lines: LineInput[] = include
    .map((name) => file.series.find((s) => s.name === name))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      name: s.name,
      points: s.points,
      color: colors[s.name] ?? "chart-1",
    }));

  const base = {
    lines,
    x,
    y,
    endLabels,
    startLabels,
    gap: gap ? { upper: gap.upper, lower: gap.lower } : undefined,
    hatchArea,
    pill: pill ? { at: pill.at, on: pill.on } : gap ? { at: 0.6 } : undefined,
  };
  // At 768px and up a half-width plate draws the taller half box (its
  // labels keep about 50px apart at half scale); below, the tall box.
  const mdVariant: Variant = plate === "half" ? "half" : "wide";
  const wide = layoutChart({ variant: mdVariant, ...base });
  // A phone plot is narrower than the gap pill is long, so there the pill
  // heads the chart beside a hatch swatch instead of sitting on the band.
  const tall = layoutChart({
    variant: "tall",
    ...base,
    pill: gap ? undefined : base.pill,
  });
  const valueClass =
    plate === "half" ? "text-[1.25rem]" : "text-[1.25rem] lg:text-[1.5rem]";

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = { wide: `hatch-w-${uid}`, tall: `hatch-t-${uid}` };

  // x ticks: every tick at 768px and up, at most three on a phone.
  const ticks = (
    <div className="text-ink-muted numerals relative mt-2 h-4 text-xs leading-none *:absolute *:-translate-x-1/2">
      {wide.ticksX.map((t) => (
        <span
          key={`w-${t.label}`}
          className="hidden md:inline"
          style={{ left: `${t.x}%` }}
        >
          {t.label}
        </span>
      ))}
      {tall.ticksX.map((t) => (
        <span
          key={`t-${t.label}`}
          className="md:hidden"
          style={{ left: `${t.x}%` }}
        >
          {t.label}
        </span>
      ))}
    </div>
  );

  const boxes = (
    <>
      <Box
        layout={wide}
        variant={mdVariant}
        hatchId={ids.wide}
        pitch={hatchPitch(VIEWBOX[mdVariant].w, PLATE_PX[plate])}
        pill={pill}
        gapPill={gap?.pill}
        valueClass={valueClass}
      />
      <Box
        layout={tall}
        variant="tall"
        hatchId={ids.tall}
        pitch={6}
        pill={pill}
        gapPill={gap?.pill}
        valueClass="text-[1.125rem]"
      />
      {ticks}
    </>
  );

  // The readout data: every x any drawn line has, in the domain.
  let body = boxes;
  if (readout) {
    const inDomain = (v: number) => v >= x.from && v <= x.to;
    const xs = [...new Set(lines.flatMap((l) => l.points.map((p) => p[0])))]
      .filter(inDomain)
      .sort((a, b) => a - b);
    const custom = typeof readout === "object";
    const order =
      custom && readout.names
        ? readout.names
            .map((n) => lines.find((l) => l.name === n))
            .filter((l): l is LineInput => Boolean(l))
        : lines;
    const lookup = order.map((l) => new Map(l.points));
    const values = xs.map((xv) =>
      lookup.map((m) => {
        const v = m.get(xv);
        if (v === undefined) return "";
        return custom
          ? formatNumber(
              v,
              y.decimals ?? (y.format === "percent" ? 1 : undefined),
            )
          : formatValue(v, y.format, y.decimals);
      }),
    );
    const template = custom
      ? readout.template
      : `{year}: ${order.map((l, i) => `${l.name} {${"abcdefghij"[i]}}`).join(", ")}`;
    body = (
      <ChartReadout
        xs={xs}
        labels={xs.map(formatYear)}
        values={values}
        template={template}
        plot={{
          wide: [wide.plotLeftPct, wide.plotRightPct],
          tall: [tall.plotLeftPct, tall.plotRightPct],
        }}
        hint={MICROCOPY.readoutHint}
      >
        {boxes}
      </ChartReadout>
    );
  }

  const phoneKey = gap?.pill ? (
    <div className="pop mb-4 flex items-center gap-2.5 md:hidden">
      <span
        aria-hidden="true"
        className="inline-block size-4 shrink-0"
        style={{
          backgroundImage: HATCH_BACKGROUND,
          boxShadow: "inset 0 0 0 1px var(--hatch-outline)",
        }}
      />
      <Chip tone="gap">{gap.pill}</Chip>
    </div>
  ) : null;
  const content = (
    <>
      {phoneKey}
      {body}
    </>
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
    >
      {animate ? (
        <Reveal as="div" variant="sweep">
          {content}
        </Reveal>
      ) : (
        content
      )}
    </div>
  );
}
