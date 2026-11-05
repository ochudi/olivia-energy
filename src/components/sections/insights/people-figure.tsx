import { FigurePlate, LineChart } from "@/components/figures";
import type { SeriesId } from "@/types/contracts";
import { getLine } from "@/content/data/series";
import { INSIGHTS_PAGE } from "@/content/insights";
import { ticks } from "@/lib/figures/scale";
import { dataHref, seriesTable } from "@/lib/figures/table";

/** Intervals on the x axis: first year, two between, last year. */
const X_INTERVALS = 3;
/** Rough number of y gridlines asked of the tick helper. */
const Y_TICKS = 3;

/**
 * The axes come from the series itself: x runs from its first to its last
 * year, y from zero to the first round step above the largest value drawn.
 */
function axes(series: SeriesId, include: string[]) {
  const points = include.flatMap((name) => getLine(series, name)?.points ?? []);
  const xs = points.map((p) => p[0]);
  const from = Math.min(...xs);
  const to = Math.max(...xs);
  const span = (to - from) / X_INTERVALS;
  const xTicks = Array.from({ length: X_INTERVALS + 1 }, (_, i) =>
    Math.round(from + span * i),
  );

  const max = Math.max(...points.map((p) => p[1]));
  const rough = ticks([0, max], Y_TICKS);
  const step = rough[1] - rough[0];
  const top = Math.ceil(max / step) * step;
  return {
    x: { from, to, ticks: xTicks },
    y: { from: 0, to: top, ticks: ticks([0, top], Y_TICKS) },
  };
}

/**
 * Insights Fig. 1 (creative brief 4.4): people without electricity, world
 * and sub-Saharan Africa, on a night plate. The sub-Saharan area is
 * hatched: the share of the world's unlit that the region now holds. The
 * lines sweep in, the hatch follows, the end labels pop. The hatched line
 * draws in the lead colour, the other in the second.
 */
export function PeopleFigure({ className }: { className?: string }) {
  const f = INSIGHTS_PAGE.hero.figure;
  const include = Object.keys(f.endLabels);
  const { x, y } = axes(f.series, include);
  return (
    <FigurePlate
      n={f.n}
      title={f.title}
      surface="night"
      dateChip={f.dateChip}
      interpretation={f.interpretation}
      sources={f.sources}
      retrieved={f.retrieved}
      table={seriesTable(f.series, include, "millions", {
        from: x.from,
        to: x.to,
      })}
      dataHref={dataHref(f.series)}
      className={className}
    >
      <LineChart
        series={f.series}
        include={include}
        x={x}
        y={{ ...y, format: "millions" }}
        colors={Object.fromEntries(
          include.map((name) => [
            name,
            name === f.hatchArea ? ("chart-1" as const) : ("chart-2" as const),
          ]),
        )}
        endLabels={f.endLabels}
        hatchArea={f.hatchArea}
        ariaLabel={f.title}
        plate="half"
      />
    </FigurePlate>
  );
}
