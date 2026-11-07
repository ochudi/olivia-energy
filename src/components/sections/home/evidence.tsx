import { FigurePlate, LineChart, NumeralFigure } from "@/components/figures";
import { Container } from "@/components/ui/container";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { getSeries } from "@/content/data/series";
import { HOME_EVIDENCE } from "@/content/home";
import { dataHref, seriesTable } from "@/lib/figures/table";
import { HomeSectionHeader } from "./section-header";

/* Fig. 1 draws the three lines in this order (the lead first); the readout
   names them in the order of its copy: Nigeria, sub-Saharan Africa, world. */
const LINES = ["World", "Nigeria", "Sub-Saharan Africa"];
const READOUT_ORDER = ["Nigeria", "Sub-Saharan Africa", "World"];
const COLORS = {
  World: "chart-2",
  Nigeria: "chart-1",
  "Sub-Saharan Africa": "chart-3",
} as const;

/** A share of the population: the whole axis, in quarters. */
const PERCENT_AXIS: [number, number] = [0, 100];
const X_TICK_COUNT = 5;
const Y_TICK_COUNT = 5;

/** The years the series covers, from the data file itself. */
function yearSpan(id: typeof HOME_EVIDENCE.figure.series) {
  const xs = getSeries(id)
    .series.filter((s) => LINES.includes(s.name))
    .flatMap((s) => s.points.map(([x]) => x));
  return { from: Math.min(...xs), to: Math.max(...xs) };
}

/** Evenly spaced ticks that land on both ends of the domain. */
function evenTicks(from: number, to: number, count: number): number[] {
  const step = (to - from) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(from + i * step));
}

/**
 * The gaps, measured: a lime flood with four
 * numerals, final and still, whose glyphs grow in as they scroll into view
 * (three hatched gaps and one solid opening), then Fig. 1 on a night plate,
 * sweeping across with the World to Nigeria gap hatching in behind it, and a
 * pointer and keyboard readout. Every number comes from the content's fact
 * ids and the series file.
 */
export function HomeEvidence() {
  const { title, lede, tiles, figure: f } = HOME_EVIDENCE;
  const span = yearSpan(f.series);
  return (
    <Section surface="lime" id="evidence" aria-labelledby="evidence-title">
      <Container>
        <HomeSectionHeader
          title={title}
          titleId="evidence-title"
          aside={<Lede>{lede}</Lede>}
        />

        <ul
          data-fold-split=""
          className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 md:mt-20 lg:grid-cols-2 lg:gap-y-20"
        >
          {tiles.map((tile) => (
            <li key={tile.fact} className="flex">
              <NumeralFigure {...tile} size="band" className="w-full" />
            </li>
          ))}
        </ul>

        <FigurePlate
          n={f.n}
          title={f.title}
          subtitle={f.subtitle}
          surface="night"
          interpretation={f.interpretation}
          sources={f.sources}
          retrieved={f.retrieved}
          table={seriesTable(f.series, LINES, "percent", span)}
          dataHref={dataHref(f.series)}
          className="mt-16 md:mt-24"
        >
          <LineChart
            series={f.series}
            include={LINES}
            x={{ ...span, ticks: evenTicks(span.from, span.to, X_TICK_COUNT) }}
            y={{
              from: PERCENT_AXIS[0],
              to: PERCENT_AXIS[1],
              ticks: evenTicks(...PERCENT_AXIS, Y_TICK_COUNT),
              format: "percent",
            }}
            colors={COLORS}
            endLabels={f.endLabels}
            gap={f.gapPill ? { ...f.gap, pill: f.gapPill } : undefined}
            readout={{ template: f.readout, names: READOUT_ORDER }}
            ariaLabel={f.title}
            plate="full"
          />
        </FigurePlate>
      </Container>
    </Section>
  );
}
