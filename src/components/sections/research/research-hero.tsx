import type { Counts, OpEd } from "@/types/contracts";
import { FigurePlate, PrintTimeline } from "@/components/figures";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { RESEARCH_PAGE } from "@/content/publications";
import type { Publication } from "@/lib/supabase/types";

const copy = RESEARCH_PAGE.hero;

/** The years Fig. 1 spans: the first journal article to the latest op-ed. */
function span(
  journals: readonly Publication[],
  opeds: readonly OpEd[],
): { from: number; to: number } {
  const years = [
    ...journals.map((j) => j.year).filter((y): y is number => y !== null),
    ...opeds.map((o) => Number(o.publishedOn.slice(0, 4))),
  ].filter(Number.isFinite);
  return { from: Math.min(...years), to: Math.max(...years) };
}

/**
 * Research hero (creative brief 4.6, section 1): the field, the H1 (a
 * sentence, so display-lg) and lede in cols 1 to 6, and Fig. 1 (the print
 * timeline: journal articles above the line, op-eds below) on a night
 * plate in cols 7 to 12 with the two counters under it (the brief puts the
 * counters under the lede; moved so the first screen at 1440 holds the H1
 * and the whole figure). The timeline drawing itself is the page's
 * signature moment (DESIGN.md, Layout): once on load on a desktop, on
 * scroll below 64rem.
 * The articles counter is the journal row count; the citation figure is the
 * dated Google Scholar reading in the copy.
 */
export function ResearchHero({
  journals,
  opeds,
  counts,
}: {
  journals: readonly Publication[];
  opeds: readonly OpEd[];
  counts: Counts;
}) {
  const items = [
    ...journals
      .filter((j) => j.year !== null)
      .map((j) => ({ date: String(j.year), kind: "article" as const })),
    ...opeds.map((o) => ({ date: o.publishedOn, kind: "oped" as const })),
  ];
  const { from, to } = span(journals, opeds);
  const counters = copy.counters.map((c) => ({
    ...c,
    value:
      c.key === "articles" && counts.articles > 0
        ? String(counts.articles)
        : c.value,
  }));

  return (
    <Section surface="paper" hero="light" aria-labelledby="research-title">
      <Container>
        {/* Phones: text, counters, plate. From 1024 px the text holds cols
            1 to 6; the plate starts level with the H1 in cols 7 to 12 and
            the counters sit under it, so the first screen shows both the
            headline and the figure. */}
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:gap-y-14">
          <div className="lg:col-span-6 lg:row-span-2 lg:pr-6">
            <Display as="h1" size="lg" headline id="research-title">
              {copy.title}
            </Display>
            <Lede className="mt-8">{copy.lede}</Lede>
          </div>

          <dl className="border-line grid grid-cols-2 gap-x-6 border-t pt-8 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:self-end">
            {counters.map((c) => (
              <div key={c.key} className="flex flex-col gap-3">
                <dt className="text-ink-muted max-w-[26ch] text-sm">
                  {c.label}
                </dt>
                <dd className="font-display text-display-xl text-primary numerals order-first">
                  {c.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:mt-[calc(1lh+1.5rem)]">
            <FigurePlate
              n={copy.figure.n}
              title={copy.figure.title}
              interpretation={copy.figure.interpretation(counts)}
              sources={copy.figure.sources}
              retrieved={copy.figure.retrieved}
            >
              <PrintTimeline
                items={items}
                from={from}
                to={to}
                legend={copy.figure.legend}
                ariaLabel={copy.figure.interpretation(counts)}
                motion="lead"
                className="py-4"
              />
            </FigurePlate>
          </div>
        </div>
      </Container>
    </Section>
  );
}
