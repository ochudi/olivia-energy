/**
 * Pure layout for the line chart: one call per viewBox turns series points
 * into rounded SVG paths and percentage positions for the HTML labels. No
 * React here, so the geometry is unit-tested and snapshot-stable.
 */
import {
  formatTick,
  formatValue,
  formatYear,
  type ValueFormat,
} from "./format";
import {
  areaPath,
  bandPath,
  linePath,
  linear,
  log10,
  type Point,
  type Scale,
} from "./scale";

/**
 * wide: a full-width plate at 768px and up. half: a half-width plate at
 * 768px and up (taller, so the plot keeps its presence beside the text).
 * tall: every plate below 768px.
 */
export type Variant = "wide" | "half" | "tall";

/**
 * The viewBoxes (build spec 2.6): a chart draws two of them, wide or half
 * at 768px and up and tall below, switched in CSS.
 */
export const VIEWBOX: Record<
  Variant,
  {
    w: number;
    h: number;
    /** Left edge of the plot; the gutter before it holds the y tick labels. */
    plotLeft: number;
    /** Right edge of the plot; the rest is the end-label gutter. */
    plotRight: number;
    top: number;
    bottom: number;
    /** Minimum vertical distance between end labels, in units. */
    labelGap: number;
  }
> = {
  wide: {
    w: 1200,
    h: 560,
    plotLeft: 76,
    plotRight: 940,
    top: 14,
    bottom: 548,
    labelGap: 52,
  },
  half: {
    w: 1200,
    h: 800,
    plotLeft: 104,
    plotRight: 860,
    top: 20,
    bottom: 780,
    // 170 units is 55 px on the narrowest half plate (1024 px viewport,
    // where "Sub-Saharan Africa" wraps to two lines under its value) and
    // 75 px at 1440; 104 let the two Fig. 1 labels collide at 1024.
    labelGap: 170,
  },
  tall: {
    w: 360,
    h: 440,
    plotLeft: 44,
    plotRight: 236,
    top: 14,
    bottom: 428,
    // 80 units is 62px on a 278px plate (a half-folded screen), where a
    // three-line end label would otherwise run into its neighbour, and
    // 77px at 390; 52 let them collide on the folded screen.
    labelGap: 80,
  },
};

export type LineInput = {
  name: string;
  points: readonly Point[];
  color: "chart-1" | "chart-2" | "chart-3";
};

export type AxisX = { from: number; to: number; ticks: readonly number[] };
export type AxisY = {
  from: number;
  to: number;
  ticks: readonly number[];
  scale?: "linear" | "log";
  format: ValueFormat;
  decimals?: number;
};

export type Label = {
  name: string;
  color: LineInput["color"];
  /** Percent of the box. */
  x: number;
  /** The line end, percent of the box. */
  y: number;
  /** Where the label sits after collision resolution, percent of the box. */
  labelY: number;
  /** The formatted value and the full display text. */
  value: string;
  text: string;
  /** `text` split around the value: "World", "91.9%", "" or "", "$132.38", "in 1975". */
  before: string;
  after: string;
};

export type ChartLayout = {
  variant: Variant;
  w: number;
  h: number;
  plotLeftPct: number;
  plotRightPct: number;
  lines: { name: string; color: LineInput["color"]; d: string }[];
  gridY: { y: number; label: string }[];
  ticksX: { x: number; label: string }[];
  endLabels: Label[];
  startLabels: Label[];
  gap?: { d: string; pillX: number; pillY: number };
  area?: { d: string };
  /**
   * Where an annotation pill sits (percent of the box), when asked for.
   * `anchor`: centre (on the gap band), above or below (beside a line
   * point, on the side the line leaves clear: above-right of a falling
   * line, below-right of a rising one).
   */
  pill?: {
    x: number;
    y: number;
    anchor: "centre" | "above" | "below";
  };
  /** 1 / w and 1 / h, for an objectBoundingBox clipPath over the box. */
  bboxScale: string;
};

const pct = (v: number, total: number) => Math.round((v / total) * 10000) / 100;

const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

function last(points: readonly Point[]): Point {
  return points[points.length - 1];
}

/**
 * Push labels apart until none is closer than `gap`, inside [top, bottom].
 * Overlapping labels merge into a cluster centred on the mean of their
 * targets, so a crowded pair moves apart in both directions rather than
 * the lower one alone sliding away from its line.
 */
export function spreadLabels(
  ys: number[],
  gap: number,
  top: number,
  bottom: number,
): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  type Cluster = { sum: number; n: number; start: number };
  const place = (c: Cluster) => {
    const span = (c.n - 1) * gap;
    const ideal = c.sum / c.n - span / 2;
    c.start = Math.max(top, Math.min(bottom - span, ideal));
  };
  const clusters: Cluster[] = [];
  for (const o of order) {
    const c: Cluster = { sum: o.y, n: 1, start: o.y };
    place(c);
    clusters.push(c);
    while (clusters.length > 1) {
      const b = clusters[clusters.length - 1];
      const a = clusters[clusters.length - 2];
      if (a.start + a.n * gap <= b.start) break;
      a.sum += b.sum;
      a.n += b.n;
      place(a);
      clusters.pop();
    }
  }
  const out: number[] = [];
  for (const c of clusters) {
    for (let k = 0; k < c.n; k++) out.push(c.start + k * gap);
  }
  const result = new Array<number>(ys.length);
  order.forEach((o, k) => {
    result[o.i] = out[k];
  });
  return result;
}

export function layoutChart(opts: {
  variant: Variant;
  lines: readonly LineInput[];
  x: AxisX;
  y: AxisY;
  /** Display name per series; "{value}" and "{x}" are filled in. */
  endLabels: Record<string, string>;
  startLabels?: Record<string, string>;
  gap?: { upper: string; lower: string };
  hatchArea?: string;
  /**
   * An annotation pill: at a fraction of the x domain, on the midpoint of
   * the gap band when there is one, else on the named (or first) line.
   */
  pill?: { at?: number; on?: string };
  /** Minimum distance between end labels, in box units (default per viewBox). */
  labelGap?: number;
}): ChartLayout {
  const box = VIEWBOX[opts.variant];
  const sx: Scale = linear(
    [opts.x.from, opts.x.to],
    [box.plotLeft, box.plotRight],
  );
  const sy: Scale =
    opts.y.scale === "log"
      ? log10([opts.y.from, opts.y.to], [box.bottom, box.top])
      : linear([opts.y.from, opts.y.to], [box.bottom, box.top]);

  const inDomain = (p: Point) => p[0] >= opts.x.from && p[0] <= opts.x.to;
  const lines = opts.lines.map((l) => ({
    name: l.name,
    color: l.color,
    points: l.points.filter(inDomain),
  }));

  /**
   * The content may give the finished label ("World 91.9%", "$132.38 in
   * 1975"), a template ("{name} {value}"), or just the name. All three end
   * up as before + value + after, so the value can be set in Newsreader.
   */
  const makeLabel = (
    l: (typeof lines)[number],
    p: Point,
    template: string,
  ): Label => {
    const value = formatValue(p[1], opts.y.format, opts.y.decimals);
    const vars = { value, x: formatYear(p[0]), name: l.name };
    let text: string;
    if (/\{\w+\}/.test(template)) text = fill(template, vars);
    else if (template.includes(value)) text = template;
    else text = `${template} ${value}`;
    const at = text.indexOf(value);
    const y = pct(sy(p[1]), box.h);
    return {
      name: l.name,
      color: l.color,
      x: pct(sx(p[0]), box.w),
      y,
      labelY: y,
      value,
      text,
      before: at >= 0 ? text.slice(0, at).trim() : text,
      after: at >= 0 ? text.slice(at + value.length).trim() : "",
    };
  };

  const endLabels = lines
    .filter((l) => l.points.length > 0 && opts.endLabels[l.name] !== undefined)
    .map((l) => makeLabel(l, last(l.points), opts.endLabels[l.name]));
  const startLabels = lines
    .filter(
      (l) => l.points.length > 0 && opts.startLabels?.[l.name] !== undefined,
    )
    .map((l) => makeLabel(l, l.points[0], opts.startLabels![l.name]));

  const labelGap = opts.labelGap ?? box.labelGap;
  const spread = spreadLabels(
    endLabels.map((l) => (l.y / 100) * box.h),
    labelGap,
    box.top + labelGap / 2,
    box.bottom - labelGap / 2,
  );
  endLabels.forEach((l, i) => {
    l.labelY = pct(spread[i], box.h);
  });

  const nearest = (points: readonly Point[], xv: number): Point =>
    points.reduce((best, p) =>
      Math.abs(p[0] - xv) < Math.abs(best[0] - xv) ? p : best,
    );

  let gap: ChartLayout["gap"];
  let pill: ChartLayout["pill"];
  const pillX =
    opts.x.from + (opts.x.to - opts.x.from) * (opts.pill?.at ?? 0.6);
  if (opts.gap) {
    const upper = lines.find((l) => l.name === opts.gap!.upper);
    const lower = lines.find((l) => l.name === opts.gap!.lower);
    if (upper && lower && upper.points.length && lower.points.length) {
      const u = nearest(upper.points, pillX);
      const d = nearest(lower.points, pillX);
      gap = {
        d: bandPath(upper.points, lower.points, sx, sy),
        pillX: pct(sx(u[0]), box.w),
        pillY: pct((sy(u[1]) + sy(d[1])) / 2, box.h),
      };
      if (opts.pill) {
        pill = { x: gap.pillX, y: gap.pillY, anchor: "centre" };
      }
    }
  }
  if (opts.pill && !pill) {
    const l =
      (opts.pill.on && lines.find((s) => s.name === opts.pill!.on)) ||
      lines.find((s) => s.points.length > 0);
    if (l) {
      const p = nearest(l.points, pillX);
      const k = l.points.indexOf(p);
      const before = l.points[Math.max(0, k - 2)];
      const after = l.points[Math.min(l.points.length - 1, k + 2)];
      const rising = after[1] > before[1];
      pill = {
        x: pct(sx(p[0]), box.w),
        y: pct(sy(p[1]), box.h),
        anchor: rising ? "below" : "above",
      };
    }
  }

  let area: ChartLayout["area"];
  if (opts.hatchArea) {
    const l = lines.find((s) => s.name === opts.hatchArea);
    if (l && l.points.length) {
      area = { d: areaPath(l.points, opts.y.from, sx, sy) };
    }
  }

  const fixed = (v: number) => Math.round(v * 1e6) / 1e6;
  return {
    variant: opts.variant,
    w: box.w,
    h: box.h,
    plotLeftPct: pct(box.plotLeft, box.w),
    plotRightPct: pct(box.plotRight, box.w),
    lines: lines.map((l) => ({
      name: l.name,
      color: l.color,
      d: linePath(l.points, sx, sy),
    })),
    gridY: opts.y.ticks.map((t) => ({
      y: pct(sy(t), box.h),
      label: formatTick(t, opts.y.format),
    })),
    ticksX: thinTicks(opts.x.ticks, opts.variant === "tall" ? 3 : 8).map(
      (t) => ({
        x: pct(sx(t), box.w),
        label: formatYear(t),
      }),
    ),
    endLabels,
    startLabels,
    gap,
    area,
    pill,
    bboxScale: `scale(${fixed(1 / box.w)} ${fixed(1 / box.h)})`,
  };
}

/**
 * At most `max` ticks, always the first and the last, evenly picked between
 * (a phone axis keeps three: 2000, 2012, 2024).
 */
export function thinTicks(ticks: readonly number[], max: number): number[] {
  if (ticks.length <= max) return [...ticks];
  const out: number[] = [];
  for (let k = 0; k < max; k++) {
    out.push(ticks[Math.round((k * (ticks.length - 1)) / (max - 1))]);
  }
  return out;
}

/** The difference between two lines at their last shared x, formatted. */
export function gapAtEnd(
  upper: readonly Point[],
  lower: readonly Point[],
  decimals = 1,
): { x: number; value: number; text: string } | undefined {
  const lowerMap = new Map(lower.map((p) => [p[0], p[1]]));
  for (let i = upper.length - 1; i >= 0; i--) {
    const [x, u] = upper[i];
    const l = lowerMap.get(x);
    if (l !== undefined) {
      const value = u - l;
      return {
        x,
        value,
        text: new Intl.NumberFormat("en-GB", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value),
      };
    }
  }
  return undefined;
}
