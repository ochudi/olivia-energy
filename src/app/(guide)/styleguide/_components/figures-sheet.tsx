import type { ReactNode } from "react";
import type { GlyphSpec, Surface } from "@/types/contracts";
import {
  AfricaMap,
  CompareBars,
  DotRow,
  FigurePlate,
  LineChart,
  NumeralFigure,
  PrintTimeline,
  ShareBar,
  Waffle,
  WaffleKey,
} from "@/components/figures";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Source } from "@/components/ui/source";
import { OPEDS } from "@/content/commentary";
import { CONTACT_PAGE } from "@/content/contact";
import { HOME_EVIDENCE } from "@/content/home";
import { INSIGHTS_PAGE } from "@/content/insights";
import { RESEARCH_PAGE } from "@/content/publications";
import { MAP_CREDIT } from "@/content/credits";
import {
  INSTALLED_FIGURE,
  SERVICE_LINES,
  WWD_HERO,
} from "@/content/what-we-do";
import { dataHref, seriesTable } from "@/lib/figures/table";
import { SurfaceFrame } from "./frame";
import {
  getCommentaryCounts,
  getJournalArticles,
} from "@/lib/supabase/queries";

/* Chapter 06 names one part (debt service): its share is the gap, hatched. */
function shareHatchFor(glyph?: GlyphSpec): "value" | undefined {
  return glyph?.kind === "share" && !glyph.labels[1] ? "value" : undefined;
}

function Block({
  surface,
  id,
  title,
  children,
}: {
  surface: Surface;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <SurfaceFrame surface={surface} id={id}>
      <div className="flex flex-col gap-6 p-5 md:p-8">
        <Eyebrow as="h4">{title}</Eyebrow>
        {children}
      </div>
    </SurfaceFrame>
  );
}

/* Home Fig. 1: three lines, the World to Nigeria gap hatched, a readout. */
function HomeFigure({
  surface,
  plate,
}: {
  surface: "night" | "card";
  plate: "full" | "half";
}) {
  const f = HOME_EVIDENCE.figure;
  const include = ["World", "Nigeria", "Sub-Saharan Africa"];
  return (
    <FigurePlate
      n={f.n}
      title={f.title}
      surface={surface}
      interpretation={f.interpretation}
      sources={f.sources}
      retrieved={f.retrieved}
      table={seriesTable(f.series, include, "percent", {
        from: 2000,
        to: 2024,
      })}
      dataHref={dataHref(f.series)}
    >
      <LineChart
        series={f.series}
        include={include}
        x={{ from: 2000, to: 2024, ticks: [2000, 2006, 2012, 2018, 2024] }}
        y={{ from: 0, to: 100, ticks: [0, 25, 50, 75, 100], format: "percent" }}
        colors={{
          World: "chart-2",
          Nigeria: "chart-1",
          "Sub-Saharan Africa": "chart-3",
        }}
        endLabels={f.endLabels}
        gap={f.gapPill ? { ...f.gap, pill: f.gapPill } : undefined}
        readout={{
          template: f.readout,
          names: ["Nigeria", "Sub-Saharan Africa", "World"],
        }}
        ariaLabel={f.title}
        plate={plate}
      />
    </FigurePlate>
  );
}

/* What we do Fig. 1: one line on a log axis, start and end labels, a lime pill. */
function SolarFigure({ surface }: { surface: "night" | "card" }) {
  const f = WWD_HERO.figure;
  return (
    <FigurePlate
      n={f.n}
      title={f.title}
      subtitle={f.subtitle}
      surface={surface}
      interpretation={f.interpretation}
      sources={f.sources}
      retrieved={f.retrieved}
      table={seriesTable(f.series, ["World"], "usd")}
      dataHref={dataHref(f.series)}
    >
      <LineChart
        series={f.series}
        include={["World"]}
        x={{ from: 1975, to: 2024, ticks: [1975, 1990, 2005, 2024] }}
        y={{
          from: 0.1,
          to: 200,
          ticks: [0.1, 1, 10, 100],
          scale: "log",
          format: "usd",
        }}
        colors={{ World: "chart-1" }}
        endLabels={{ World: f.labels.end }}
        startLabels={{ World: f.labels.start }}
        pill={{ text: f.pill, tone: "opening", at: 0.55 }}
        ariaLabel={f.title}
        plate="half"
      />
    </FigurePlate>
  );
}

/* Insights Fig. 1: two lines, the sub-Saharan area hatched, a date chip. */
function PeopleFigure({ surface }: { surface: "night" | "card" }) {
  const f = INSIGHTS_PAGE.hero.figure;
  const include = ["World", "Sub-Saharan Africa"];
  return (
    <FigurePlate
      n={f.n}
      title={f.title}
      surface={surface}
      dateChip={f.dateChip}
      interpretation={f.interpretation}
      sources={f.sources}
      retrieved={f.retrieved}
      table={seriesTable(f.series, include, "millions")}
      dataHref={dataHref(f.series)}
    >
      <LineChart
        series={f.series}
        include={include}
        x={{ from: 2000, to: 2024, ticks: [2000, 2008, 2016, 2024] }}
        y={{
          from: 0,
          to: 1.5e9,
          ticks: [0, 5e8, 1e9, 1.5e9],
          format: "millions",
        }}
        colors={{ World: "chart-2", "Sub-Saharan Africa": "chart-1" }}
        endLabels={f.endLabels}
        hatchArea={f.hatchArea}
        ariaLabel={f.title}
        plate="half"
      />
    </FigurePlate>
  );
}

/** Every figure primitive with real data, on night, card and the floods (was /figures-preview). */
export async function FiguresSheet() {
  const counts = await getCommentaryCounts();
  const journals = await getJournalArticles();
  // Without a database the journal years come from the seeded record
  // (supabase/seeds/publications.sql): two in 2022 and 2023, three in 2024,
  // two in 2025. Preview only; the Research page reads the database.
  const journalYears =
    journals.length > 0
      ? journals.map((j) => String(j.year ?? ""))
      : [
          "2022",
          "2022",
          "2023",
          "2023",
          "2024",
          "2024",
          "2024",
          "2025",
          "2025",
        ];
  const timelineItems = [
    ...journalYears.map((date) => ({ date, kind: "article" as const })),
    ...OPEDS.map((o) => ({ date: o.publishedOn, kind: "oped" as const })),
  ];
  const research = RESEARCH_PAGE.hero.figure;

  return (
    <div className="flex flex-col gap-8">
      <Block
        surface="lime"
        id="home-fig-1"
        title="Home Fig. 1 on a night plate, full width"
      >
        <HomeFigure surface="night" plate="full" />
      </Block>
      <Block
        surface="paper"
        id="home-fig-1-paper"
        title="Home Fig. 1 on a card plate, full width"
      >
        <HomeFigure surface="card" plate="full" />
      </Block>

      <Block
        surface="green"
        id="wwd-fig-1"
        title="What we do Fig. 1, half width, night and card"
      >
        <div className="grid justify-items-start gap-6 *:w-full *:max-w-2xl">
          <SolarFigure surface="night" />
          <div data-surface="paper" className="bg-canvas shoulder p-4">
            <SolarFigure surface="card" />
          </div>
        </div>
      </Block>

      <Block
        surface="lime"
        id="insights-fig-1"
        title="Insights Fig. 1, half width, night and card"
      >
        <div className="grid justify-items-start gap-6 *:w-full *:max-w-2xl">
          <PeopleFigure surface="night" />
          <div data-surface="paper" className="bg-canvas shoulder p-4">
            <PeopleFigure surface="card" />
          </div>
        </div>
      </Block>

      <Block
        surface="paper"
        id="research-fig-1"
        title="Research Fig. 1, night and card"
      >
        <div className="grid justify-items-start gap-6 *:w-full *:max-w-2xl">
          {(["night", "card"] as const).map((surface) => (
            <FigurePlate
              key={surface}
              n={research.n}
              title={research.title}
              surface={surface}
              interpretation={research.interpretation(counts)}
              sources={research.sources}
              retrieved={research.retrieved}
            >
              <PrintTimeline
                items={timelineItems}
                from={2022}
                to={2026}
                legend={research.legend}
                ariaLabel={research.title}
              />
            </FigurePlate>
          ))}
        </div>
      </Block>

      <Block
        surface="lime"
        id="numbers-band"
        title="The numbers band: four tiles"
      >
        <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
          {HOME_EVIDENCE.tiles.map((t) => (
            <NumeralFigure key={t.fact} {...t} size="band" />
          ))}
        </div>
      </Block>

      <Block
        surface="paper-deep"
        id="numeral-cards"
        title="Numeral cards (chapters 01, 03, 04, 05, 06)"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICE_LINES.filter((l) => l.card).map((l) => (
            <NumeralFigure
              key={l.slug}
              {...l.card!}
              size="card"
              shareHatch={shareHatchFor(l.card!.glyph)}
            />
          ))}
        </div>
      </Block>

      <Block
        surface="night"
        id="numeral-cards-night"
        title="Numeral cards on night"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICE_LINES.filter((l) => l.card)
            .slice(0, 3)
            .map((l) => (
              <NumeralFigure
                key={l.slug}
                {...l.card!}
                size="card"
                shareHatch={shareHatchFor(l.card!.glyph)}
              />
            ))}
        </div>
      </Block>

      <Block
        surface="paper"
        id="waffle"
        title="What we do Fig. 2: the three steps"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {INSTALLED_FIGURE.steps.map((step, i) => (
            <div
              key={step.label}
              data-step={i + 1}
              className="flex flex-col gap-4"
            >
              <FigurePlate
                n={INSTALLED_FIGURE.n}
                title={INSTALLED_FIGURE.title}
                surface="night"
                sources={INSTALLED_FIGURE.sources}
                retrieved={INSTALLED_FIGURE.retrieved}
              >
                <Waffle
                  {...INSTALLED_FIGURE.squares}
                  ariaLabel={`${step.heading}. ${INSTALLED_FIGURE.legend.unit}.`}
                />
                <WaffleKey {...INSTALLED_FIGURE.legend} />
                <p className="text-ink-muted text-xs">
                  {INSTALLED_FIGURE.note}
                </p>
              </FigurePlate>
              <div className="flex flex-col gap-1">
                <Eyebrow as="p">{step.label}</Eyebrow>
                <p className="font-display text-display-xs">{step.heading}</p>
                <p className="text-ink-muted text-sm">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      {(["paper", "night", "lime"] as const).map((surface) => (
        <Block
          key={surface}
          surface={surface}
          id={`glyphs-${surface}`}
          title={`Glyphs on ${surface}`}
        >
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2">
              <DotRow count={87} ariaLabel="87 dots" />
              <p className="text-ink-muted text-xs">
                {HOME_EVIDENCE.tiles[0].glyphCaption}
              </p>
            </div>
            <ShareBar
              value={4458}
              total={13625}
              labels={["Available", "Installed"]}
            />
            <ShareBar
              value={85}
              total={100}
              labels={["Debt service as a share of energy investment", ""]}
              hatch="value"
            />
            <CompareBars
              a={{ value: 2, label: "Clean energy investment" }}
              b={{ value: 20, label: "Population" }}
              mode="gap"
            />
            <CompareBars
              a={{ value: 46, label: "2023" }}
              b={{ value: 350, label: "Q2 2026" }}
              mode="growth"
            />
            <CompareBars
              a={{ value: 83, label: "Gas flaring" }}
              b={{ value: 46, label: "Oil production" }}
              mode="gap"
            />
            <CompareBars
              a={{ value: 175, label: "Nigeria" }}
              b={{ value: 3860, label: "World" }}
              mode="gap"
            />
          </div>
        </Block>
      ))}

      <Block
        surface="red"
        id="africa"
        title="The dotted Africa with the region ring"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <AfricaMap
            alt=""
            regionLabel={CONTACT_PAGE.hero.mapLabel}
            className="max-w-md"
          />
          <div className="text-sm">
            <p>{CONTACT_PAGE.hero.mapSecondary}</p>
            <Source sources={MAP_CREDIT.source} className="mt-4" />
          </div>
        </div>
      </Block>
    </div>
  );
}
