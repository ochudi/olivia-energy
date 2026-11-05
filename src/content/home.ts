/**
 * Home page copy (creative brief 4.1). Section order: hero, Why Olivia? in
 * the mark window, the gaps measured, services, who we serve, founder, on
 * the record in BusinessDay, the close band, footer. Guideline blocks shared
 * with other pages live in ./brand; service titles and summaries in ./site.
 *
 * Every numeral below is a verified figure: the fact id or series id next
 * to it names the record in src/content/data, and the source sits on the
 * face of the tile.
 */
import type {
  Counts,
  Cta,
  FactId,
  FactTag,
  GlyphSpec,
  OpEd,
  PhotoKey,
  SeriesId,
  SourceRef,
} from "@/types/contracts";
import { countWords, monthYear } from "@/lib/content/format";
import { COVER_COPY, FORMATS, POSITIONING, TAGLINE, WHY_OLIVIA } from "./brand";

/** Retrieval date of every figure and series on the site. */
export const RETRIEVED = "2026-10-02";

export const HOME_HERO: {
  eyebrow: string;
  title: string;
  turn: string;
  lede: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  latestLabel: string;
  photo: PhotoKey;
  /** Vertical credit on the right edge (desktop) or under the card (phone). */
  credit: string;
  /** Meta line on the latest op-ed card: "Op-ed · {first two topics}". */
  cardMeta: (oped: Pick<OpEd, "topics">) => string;
  cardLinkLabel: (title: string) => string;
} = {
  eyebrow: "Energy advisory · Research · Sustainability",
  title: TAGLINE.line1,
  turn: TAGLINE.line2,
  lede: POSITIONING,
  primaryCta: { label: "What we do", href: "/what-we-do" },
  secondaryCta: { label: "Read the commentary", href: "/insights#businessday" },
  latestLabel: "Latest in BusinessDay",
  photo: "lagos-third-mainland",
  credit: "Third Mainland Bridge, Lagos · Photo: Solasly, CC BY-SA 4.0",
  cardMeta: (oped) => ["Op-ed", ...oped.topics.slice(0, 2)].join(" · "),
  cardLinkLabel: COVER_COPY.linkLabel,
};

/** Home section 2. Re-exported so the opening imports one module. */
export const HOME_WHY = WHY_OLIVIA;

export type EvidenceTile = {
  fact: FactId;
  numeral: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  tag: FactTag;
  caption: string;
  glyph: GlyphSpec;
  glyphCaption?: string;
  source: SourceRef;
  retrieved: string;
};

export type FigureCopy = {
  n: number;
  title: string;
  subtitle?: string;
  interpretation: string;
  sources: SourceRef[];
  retrieved: string;
  series: SeriesId;
  /** Keyed by the series name in the data file. */
  endLabels: Record<string, string>;
  gapPill?: string;
  dateChip?: string;
};

export const HOME_EVIDENCE: {
  eyebrow: string;
  title: string;
  lede: string;
  tiles: readonly EvidenceTile[];
  /** `readout` placeholders: {year}, {a} Nigeria, {b} sub-Saharan Africa, {c} world. */
  figure: FigureCopy & {
    readout: string;
    gap: { upper: string; lower: string };
  };
} = {
  eyebrow: "The gaps, measured",
  title: "Driven by evidence.",
  lede: "Our work is driven by evidence and shaped by experience. Four numbers frame it: three gaps to close, and one sign of what closing them looks like.",
  tiles: [
    {
      fact: "nigeria-no-electricity-2024",
      numeral: 87,
      unit: "million",
      tag: "Gap",
      caption:
        "people in Nigeria had no electricity in 2024, more than in any other country.",
      glyph: { kind: "dots", count: 87 },
      glyphCaption: "Each dot is one million people.",
      source: {
        org: "Sustainable Energy for All",
        title: "Tracking SDG7: The Energy Progress Report 2026",
        url: "https://www.seforall.org/system/files/2026-07/SEforALL%20Tracking%20SDG7%20-%20The%20Energy%20Progress%20Report%202026_Executive%20Version_22Jul2026-2.pdf",
      },
      retrieved: RETRIEVED,
    },
    {
      fact: "nigeria-grid-installed-vs-available-q1-2026",
      numeral: 32.7,
      decimals: 1,
      suffix: "%",
      tag: "Gap",
      caption:
        "of Nigeria’s installed grid capacity was available, on average, in the first quarter of 2026: 4,458 MW of 13,625 MW.",
      /** Available drawn solid; the rest of the installed bar is the gap. */
      glyph: {
        kind: "share",
        value: 4458,
        total: 13625,
        labels: ["Available", "Installed"],
      },
      source: {
        org: "Nigerian Electricity Regulatory Commission",
        title: "Quarterly Report, first quarter 2026",
        url: "https://nerc.gov.ng/wp-content/uploads/2026/07/2026_Q1-Report.pdf",
      },
      retrieved: RETRIEVED,
    },
    {
      fact: "africa-clean-investment-share-vs-population",
      numeral: 2,
      suffix: "%",
      unit: "of investment",
      tag: "Gap",
      caption:
        "Africa’s share of global clean energy investment in 2025, against 20% of the world’s population (IEA estimate).",
      glyph: {
        kind: "compare",
        a: { value: 2, label: "Clean energy investment" },
        b: { value: 20, label: "Population" },
        mode: "gap",
      },
      source: {
        org: "International Energy Agency",
        title: "World Energy Investment 2025",
        url: "https://www.iea.org/reports/world-energy-investment-2025/executive-summary",
      },
      retrieved: RETRIEVED,
    },
    {
      fact: "nigeria-product-exports-sevenfold-2026",
      numeral: 7,
      suffix: "×",
      tag: "Opening",
      caption:
        "Nigeria’s petroleum product exports rose about sevenfold after the Dangote refinery opened: from 46,000 barrels a day in 2023 to 350,000 in the second quarter of 2026.",
      glyph: {
        kind: "compare",
        a: { value: 46, label: "2023" },
        b: { value: 350, label: "Q2 2026" },
        mode: "growth",
      },
      source: {
        org: "U.S. Energy Information Administration",
        title: "Today in Energy, 24 August 2026 (data: Vortexa)",
        url: "https://www.eia.gov/todayinenergy/detail.php?id=68004",
      },
      retrieved: RETRIEVED,
    },
  ],
  figure: {
    n: 1,
    title: "Share of people with electricity, 2000 to 2024",
    interpretation:
      "Nigeria has raised access from 43.2% to 62.5% since 2000, ahead of the sub-Saharan average of 55.1%. The world stands at 91.9%: a gap of 29.4 points still to bridge.",
    sources: [
      {
        org: "World Bank",
        title: "World Development Indicators",
        code: "EG.ELC.ACCS.ZS",
        licence: "CC BY 4.0",
        url: "https://data.worldbank.org/indicator/EG.ELC.ACCS.ZS",
      },
    ],
    retrieved: RETRIEVED,
    series: "electricity_access_pct",
    endLabels: {
      World: "World 91.9%",
      Nigeria: "Nigeria 62.5%",
      "Sub-Saharan Africa": "Sub-Saharan Africa 55.1%",
    },
    gap: { upper: "World", lower: "Nigeria" },
    gapPill: "29.4-point gap in 2024",
    readout: "{year}: Nigeria {a}%, sub-Saharan Africa {b}%, world {c}%",
  },
};

export const HOME_SERVICES: {
  eyebrow: string;
  title: string;
  lede: string;
  linkLabel: string;
  /** Accessible name of each card's link. */
  linkAriaLabel: (title: string) => string;
  allCta: Cta;
} = {
  eyebrow: "What we do",
  title: "Six services, one energy future.",
  lede: "From policy advisory and ESG strategy to market intelligence and capacity building, we help governments, businesses, investors and development partners make informed decisions that shape a cleaner, more resilient energy future.",
  linkLabel: "Explore",
  linkAriaLabel: (title) => `Explore ${title}`,
  allCta: { label: "All services", href: "/what-we-do" },
};

export type FounderCounter = {
  key: "articles" | "citations" | "opeds";
  /** Fixed value; when absent the counter reads Counts[key]. */
  value?: string;
  label: string;
  source: (c: Counts) => string;
};

export const HOME_FOUNDER: {
  eyebrow: string;
  name: string;
  role: string;
  /** Set large, with the middle dots in lime. */
  credentials: string;
  /** Visually hidden expansion of `credentials`. */
  credentialsLong: string;
  lede: string;
  counters: readonly FounderCounter[];
  cta: Cta;
} = {
  eyebrow: "Our founder",
  name: "Dr Olugbenga Olaoye",
  role: "Founder/CEO, Olivia Energy · Energy economist",
  credentials: "PhD · MPS · MBA · PMP · CSM",
  credentialsLong:
    "PhD in Economics, Master of Public Service, Executive MBA, Project Management Professional and Certified ScrumMaster.",
  lede: "An energy economist who bridges industry, academia and public policy. He holds a PhD in Economics from Covenant University, a Master of Public Service from the Clinton School of Public Service and an executive MBA from Lagos Business School, and he writes on energy security, the Dangote refinery and the energy transition for BusinessDay.",
  counters: [
    {
      key: "articles",
      value: "9",
      label: "journal articles since 2022",
      source: () => "ORCID 0000-0003-2658-916X",
    },
    {
      key: "citations",
      value: "200+",
      label: "citations",
      source: () => "Google Scholar, retrieved 2 October 2026",
    },
    {
      key: "opeds",
      label: "op-eds in BusinessDay",
      source: (c) =>
        `BusinessDay, ${monthYear(c.firstOpEd)} to ${monthYear(c.lastOpEd)}`,
    },
  ],
  cta: { label: "About our founder", href: "/about#founder" },
};

export const HOME_COMMENTARY: {
  eyebrow: string;
  title: string;
  lede: (c: Counts) => string;
  countLine: (c: Counts) => string;
  allLink: Cta;
  /**
   * The op-ed whose pull quote fills the quotation panel. If it is absent
   * the panel uses the newest op-ed with a pull quote.
   */
  quoteSlug: string;
  quoteAttribution: (
    oped: Pick<OpEd, "title" | "outlet" | "publishedOn">,
  ) => string;
  insightsLine: string;
  /** The chips under the Insights line: the eight format names. */
  formatChips: readonly string[];
  insightsCta: Cta;
} = {
  eyebrow: "Commentary",
  title: "On the record, in BusinessDay.",
  lede: (c) =>
    `Dr Olaoye writes on energy security, the Dangote refinery and the energy transition: ${countWords(c.opeds)} op-eds since ${monthYear(c.firstOpEd)}, and quoted as an energy economist in ${countWords(c.mentions)} BusinessDay reports.`,
  countLine: COVER_COPY.countLine,
  allLink: { label: "All commentary", href: "/insights#businessday" },
  quoteSlug: "nigerias-unexpected-shield-in-a-time-of-global-energy-turbulence",
  quoteAttribution: COVER_COPY.attribution,
  insightsLine: "Olivia Energy Insights is building a library of:",
  formatChips: FORMATS.items.map((item) => item.name),
  insightsCta: { label: "Visit Insights", href: "/insights" },
};

/**
 * The settings default for `stats`, read by src/lib/supabase/types.ts. No
 * page shows a stats band (decision 12); this only fills the admin form.
 */
export const STATS: readonly {
  value: number;
  suffix?: string;
  label: string;
  description: string;
}[] = [
  { value: 2, label: "Markets", description: "United States and Nigeria" },
  {
    value: 2,
    label: "Retail outlets",
    description: "Opened in Southwest Nigeria in 2020",
  },
  {
    value: 9,
    label: "Journal articles",
    description: "By the founder and co-authors, 2022 to 2025",
  },
  {
    value: 130,
    suffix: "+",
    label: "Citations",
    description: "Of the founder’s published papers",
  },
];
