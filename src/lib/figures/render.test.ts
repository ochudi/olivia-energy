/**
 * Render budget for every figure: the server markup of each chart, as the
 * pages call it, is at most 15 KB and never hides itself (no opacity:0;
 * the final state is the HTML, motion only sets a pre-state in the browser).
 */
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AfricaMap,
  CompareBars,
  DotRow,
  FigurePlate,
  type FigurePlateProps,
  LineChart,
  NumeralFigure,
  PrintTimeline,
  ShareBar,
  Waffle,
} from "@/components/figures";
import { HOME_EVIDENCE } from "@/content/home";
import { INSIGHTS_PAGE } from "@/content/insights";
import { OPEDS } from "@/content/commentary";
import { RESEARCH_PAGE } from "@/content/publications";
import {
  INSTALLED_FIGURE,
  SERVICE_LINES,
  WWD_HERO,
} from "@/content/what-we-do";
import { dataHref, seriesTable } from "./table";

const BUDGET = 15 * 1024;
/* opacity:0 as a style; fill-opacity on the waffle's outlined squares is a final state. */
const HIDDEN = /(?<![-\w])opacity:\s*0(?![.\d])/;

const home = HOME_EVIDENCE.figure;
const homeInclude = ["World", "Nigeria", "Sub-Saharan Africa"];
const homeChart = () =>
  createElement(LineChart, {
    series: home.series,
    include: homeInclude,
    x: { from: 2000, to: 2024, ticks: [2000, 2006, 2012, 2018, 2024] },
    y: { from: 0, to: 100, ticks: [0, 25, 50, 75, 100], format: "percent" },
    colors: {
      World: "chart-2",
      Nigeria: "chart-1",
      "Sub-Saharan Africa": "chart-3",
    },
    endLabels: home.endLabels,
    gap: home.gapPill ? { ...home.gap, pill: home.gapPill } : undefined,
    readout: {
      template: home.readout,
      names: ["Nigeria", "Sub-Saharan Africa", "World"],
    },
    ariaLabel: home.title,
  });

const solar = WWD_HERO.figure;
const solarChart = () =>
  createElement(LineChart, {
    series: solar.series,
    include: ["World"],
    x: { from: 1975, to: 2024, ticks: [1975, 1990, 2005, 2024] },
    y: {
      from: 0.1,
      to: 200,
      ticks: [0.1, 1, 10, 100],
      scale: "log",
      format: "usd",
    },
    colors: { World: "chart-1" },
    endLabels: { World: solar.labels.end },
    startLabels: { World: solar.labels.start },
    pill: { text: solar.pill, tone: "opening", at: 0.55 },
    ariaLabel: solar.title,
    plate: "half",
  });

const people = INSIGHTS_PAGE.hero.figure;
const peopleChart = () =>
  createElement(LineChart, {
    series: people.series,
    include: ["World", "Sub-Saharan Africa"],
    x: { from: 2000, to: 2024, ticks: [2000, 2008, 2016, 2024] },
    y: { from: 0, to: 1.5e9, ticks: [0, 5e8, 1e9, 1.5e9], format: "millions" },
    colors: { World: "chart-2", "Sub-Saharan Africa": "chart-1" },
    endLabels: people.endLabels,
    hatchArea: people.hatchArea,
    ariaLabel: people.title,
    plate: "half",
  });

const research = RESEARCH_PAGE.hero.figure;
const timeline = () =>
  createElement(PrintTimeline, {
    items: [
      ...["2022", "2023", "2024", "2024", "2025"].map((date) => ({
        date,
        kind: "article" as const,
      })),
      ...OPEDS.map((o) => ({ date: o.publishedOn, kind: "oped" as const })),
    ],
    from: 2022,
    to: 2026,
    legend: research.legend,
    ariaLabel: research.title,
  });

const card = SERVICE_LINES.find((l) => l.card)!.card!;

const FIGURES: [string, () => ReactElement][] = [
  ["LineChart: home Fig. 1 (gap, readout)", homeChart],
  ["LineChart: What we do Fig. 1 (log, start label, pill)", solarChart],
  ["LineChart: Insights Fig. 1 (hatched area)", peopleChart],
  [
    "FigurePlate around home Fig. 1, with table and data link",
    () =>
      createElement(
        FigurePlate,
        {
          n: home.n,
          title: home.title,
          interpretation: home.interpretation,
          sources: home.sources,
          retrieved: home.retrieved,
          table: seriesTable(home.series, homeInclude, "percent", {
            from: 2000,
            to: 2024,
          }),
          dataHref: dataHref(home.series),
        } as FigurePlateProps,
        homeChart(),
      ),
  ],
  ["PrintTimeline: Research Fig. 1", timeline],
  [
    "Waffle: What we do Fig. 2",
    () =>
      createElement(Waffle, {
        ...INSTALLED_FIGURE.squares,
        ariaLabel: INSTALLED_FIGURE.title,
      }),
  ],
  [
    "NumeralFigure: band tile",
    () =>
      createElement(NumeralFigure, { ...HOME_EVIDENCE.tiles[0], size: "band" }),
  ],
  [
    "NumeralFigure: card",
    () => createElement(NumeralFigure, { ...card, size: "card" }),
  ],
  ["DotRow", () => createElement(DotRow, { count: 87, ariaLabel: "87 dots" })],
  [
    "ShareBar",
    () =>
      createElement(ShareBar, {
        value: 4458,
        total: 13625,
        labels: ["Available", "Installed"],
      }),
  ],
  [
    "CompareBars",
    () =>
      createElement(CompareBars, {
        a: { value: 2, label: "Clean energy investment" },
        b: { value: 20, label: "Population" },
        mode: "gap",
      }),
  ],
  [
    "AfricaMap",
    () =>
      createElement(AfricaMap, { alt: "", regionLabel: "Southwest Nigeria" }),
  ],
];

describe("figure markup", () => {
  it.each(FIGURES)("%s is at most 15 KB and never hidden", (_, make) => {
    const html = renderToStaticMarkup(make());
    expect(html.length).toBeGreaterThan(100);
    expect(Buffer.byteLength(html, "utf8")).toBeLessThanOrEqual(BUDGET);
    expect(html).not.toMatch(HIDDEN);
  });

  it("draws each line chart's lines with one-decimal paths and HTML labels", () => {
    const html = renderToStaticMarkup(homeChart());
    const ds = [...html.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
    expect(ds.length).toBeGreaterThan(0);
    for (const d of ds) expect(d).not.toMatch(/\.\d\d/);
    // Two viewBoxes, switched in CSS.
    expect(html).toContain('viewBox="0 0 1200 560"');
    expect(html).toContain('viewBox="0 0 360 440"');
    // The end labels' values are HTML text, not SVG text.
    expect(html).not.toContain("<text");
    expect(html).toContain("62.5%");
  });

  it("hatches the remainder of a share bar by default and the value on request", () => {
    const rest = renderToStaticMarkup(
      createElement(ShareBar, { value: 85, total: 100, labels: ["A", "B"] }),
    );
    expect(rest).toMatch(/class="sweep[^"]*"[^>]*width:max\(85\.00%/);
    expect(rest).toMatch(/class="hatch[^"]*"[^>]*width:max\(15\.00%/);
    const value = renderToStaticMarkup(
      createElement(ShareBar, {
        value: 85,
        total: 100,
        labels: ["Debt service", ""],
        hatch: "value",
      }),
    );
    expect(value).not.toContain('class="sweep');
    expect(value).toMatch(/class="hatch[^"]*"[^>]*width:max\(85\.00%/);
    // The empty label is skipped, not rendered as an empty span.
    expect(value.match(/<span/g) ?? []).toHaveLength(1);
  });
});
