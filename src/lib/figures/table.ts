/**
 * "View as table" and "Get the data" for a series: the same points the
 * chart draws, as rows for FigurePlate's table and the CSV path.
 */
import type { SeriesId } from "@/types/contracts";
import { getSeries } from "@/content/data/series";
import { formatValue, formatYear, type ValueFormat } from "./format";

export type SeriesTable = {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
};

/** `/data/<id>.csv`, written by scripts/build-figure-data.mjs. */
export function dataHref(id: SeriesId): string {
  return `/data/${id}.csv`;
}

/**
 * One row per x across the included lines (in `include` order), values
 * formatted like the chart's labels; a missing point is an empty cell.
 */
export function seriesTable(
  id: SeriesId,
  include: readonly string[],
  format: ValueFormat,
  opts: {
    from?: number;
    to?: number;
    decimals?: number;
    caption?: string;
  } = {},
): SeriesTable {
  const file = getSeries(id);
  const lines = include
    .map((name) => file.series.find((s) => s.name === name))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const xs = [...new Set(lines.flatMap((l) => l.points.map((p) => p[0])))]
    .filter(
      (x) =>
        (opts.from === undefined || x >= opts.from) &&
        (opts.to === undefined || x <= opts.to),
    )
    .sort((a, b) => a - b);
  const lookup = lines.map((l) => new Map(l.points));
  return {
    // The unit only when the title does not already name it ("Access to
    // electricity, % of population" carries its own).
    caption:
      opts.caption ??
      (file.title.toLowerCase().includes(file.unit.toLowerCase())
        ? file.title
        : `${file.title}, ${file.unit}`),
    columns: ["Year", ...lines.map((l) => l.name)],
    rows: xs.map((x) => [
      formatYear(x),
      ...lookup.map((m) => {
        const v = m.get(x);
        return v === undefined ? "" : formatValue(v, format, opts.decimals);
      }),
    ]),
  };
}
