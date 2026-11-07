import { FigurePlate, LineChart } from "@/components/figures";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { getSeries } from "@/content/data/series";
import { WWD_HERO } from "@/content/what-we-do";
import { dataHref, seriesTable } from "@/lib/figures/table";

const LINE = "World";

/**
 * The x range and ticks follow the series file itself (its first and last
 * year, with two ticks between), so no year is typed here.
 */
function yearAxis() {
  const points =
    getSeries(WWD_HERO.figure.series).series.find((s) => s.name === LINE)
      ?.points ?? [];
  const from = points[0]?.[0] ?? 0;
  const to = points[points.length - 1]?.[0] ?? 0;
  const step = Math.round((to - from) / 3 / 5) * 5;
  return { from, to, ticks: [from, from + step, from + 2 * step, to] };
}

/**
 * What we do, section 1 (creative brief 4.2): the green hero. The H1 (a
 * sentence, so display-lg; the page's LCP, never animated) and the lede in
 * columns 1 to 6; Fig. 1, the price of solar modules on a log scale, on a
 * night plate in columns 7 to 12. On phones the plate follows the lede with
 * its tall viewBox and sweeps in as it scrolls into view.
 */
export function WhatWeDoHero() {
  const f = WWD_HERO.figure;
  const x = yearAxis();
  return (
    <Section
      surface="green"
      hero="dark"
      spacing="sm"
      id="overview"
      aria-labelledby="what-we-do-title"
      className="pb-section"
    >
      <Container>
        <div className="grid gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-6">
          <div className="lg:col-span-6 lg:pr-6">
            <Display
              as="h1"
              size="lg"
              headline
              id="what-we-do-title"
              className="max-w-[14ch]"
            >
              {WWD_HERO.title}
            </Display>
            <Lede className="mt-8 lg:mt-10">{WWD_HERO.lede}</Lede>
            {/* The second sentence from 768px only: on a phone the first
                screen is the headline, one sentence and the figure, and a
                paragraph stranded under the plate read worse than none. */}
            <p className="text-ink mt-5 hidden max-w-[48ch] text-lg text-pretty md:block">
              {WWD_HERO.ledeMore}
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <FigurePlate
              n={f.n}
              title={f.title}
              subtitle={f.subtitle}
              surface="night"
              interpretation={f.interpretation}
              sources={f.sources}
              retrieved={f.retrieved}
              table={seriesTable(f.series, [LINE], "usd")}
              dataHref={dataHref(f.series)}
            >
              <LineChart
                series={f.series}
                include={[LINE]}
                x={x}
                y={{
                  from: 0.1,
                  to: 200,
                  ticks: [0.1, 1, 10, 100],
                  scale: "log",
                  format: "usd",
                }}
                // One series on a night plate is paper white: lime is the
                // lead line only beside a white series or the red hatch,
                // never alone on night (DESIGN.md, Colors). The pill stays
                // the lime accent beside it.
                colors={{ [LINE]: "chart-2" }}
                endLabels={{ [LINE]: f.labels.end }}
                startLabels={{ [LINE]: f.labels.start }}
                pill={{ text: f.pill, tone: "opening", at: 0.55 }}
                ariaLabel={`${f.title}. ${f.labels.start}; ${f.labels.end}; ${f.pill}.`}
                plate="half"
              />
            </FigurePlate>
          </div>
        </div>
      </Container>
    </Section>
  );
}
