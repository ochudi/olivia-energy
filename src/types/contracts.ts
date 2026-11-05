/**
 * Shared contracts for the October 2026 rebuild ("Bridging Light").
 *
 * Frozen after stage 0 of the build: every package types against these names,
 * so a change here is a change for everyone. Values that come from research
 * (fact ids, series ids, photo keys) are literal unions so a typo fails the
 * typecheck rather than rendering an empty figure.
 */

/** The surface a section declares; it remaps the semantic colour tokens. */
export type Surface =
  "paper" | "paper-deep" | "night" | "green" | "lime" | "red" | "photo";

/** The fourteen line glyphs (six services, four pillars, four values). */
export type GlyphName =
  | "transition"
  | "economics-policy"
  | "esg"
  | "research-analytics"
  | "capacity"
  | "project"
  | "research"
  | "advisory"
  | "innovation"
  | "impact"
  | "excellence"
  | "integrity"
  | "sustainability"
  | "collaboration";

/** Service anchors on /what-we-do, in the guideline order. */
export type ServiceSlug =
  | "energy-transition-advisory"
  | "energy-economics-policy"
  | "esg-sustainability"
  | "research-analytics"
  | "capacity-development"
  | "project-advisory";

/** The eight Insights formats from the client guideline (posts.format). */
export type InsightFormat =
  | "energy-transition-briefing"
  | "downstream-market-outlook"
  | "african-energy-outlook"
  | "esg-insight"
  | "policy-brief"
  | "executive-commentary"
  | "research-paper"
  | "webinar-podcast";

/** publications.kind; "journal" is the default for existing rows. */
export type PublicationKind =
  "journal" | "op-ed" | "mention" | "report" | "talk";

/** Topic chips on op-eds, as verified by the research. */
export type OpEdTopic =
  | "Dangote Refinery"
  | "Energy security"
  | "Energy transition"
  | "Downstream"
  | "Oil and gas"
  | "Power"
  | "Climate and ESG"
  | "Policy"
  | "Economy";

export type CoverTone =
  "lime" | "red" | "green" | "night" | "paper" | "paper-deep";

/** Photographs added in this rebuild (src/content/images.ts). */
export type NewPhotoKey =
  | "lagos-third-mainland"
  | "tarfaya-wind"
  | "abuja-city-gate"
  | "bayelsa-flare"
  | "lagos-market"
  | "lecture-hall"
  | "ethiopia-lineman"
  | "lagos-lekki-night"
  | "abuja-lightpoles"
  | "bonny-night"
  | "noor-solar"
  | "nanyuki-pylon";

/** Photographs that already shipped (the starter articles use the covers). */
export type LegacyPhotoKey =
  "coverDownstream" | "coverSolar" | "coverPower" | "coverEsg";

export type PhotoKey = NewPhotoKey | LegacyPhotoKey;

/** Verified figures (research/facts.json, confirmed or corrected only). */
export type FactId =
  | "ssa-no-electricity-2024"
  | "world-no-electricity-2024"
  | "nigeria-no-electricity-2024"
  | "africa-no-clean-cooking-2024"
  | "clean-cooking-half-of-two-billion-in-africa"
  | "africa-clean-investment-share-vs-population"
  | "africa-energy-investment-fall-debt"
  | "africa-solar-resource-share"
  | "africa-solar-pv-installed-2025"
  | "nigeria-grid-installed-vs-available-q1-2026"
  | "nigeria-grid-delivered-q1-2026"
  | "nigeria-business-generators"
  | "nigeria-grid-unavailable-and-losses"
  | "nigeria-flaring-rank-2025"
  | "nigeria-flaring-rise-2025"
  | "global-flaring-2025"
  | "dangote-nameplate-2026"
  | "dangote-capacity-700k-eia-2026"
  | "nigeria-product-exports-sevenfold-2026"
  | "nigeria-net-zero-2060-etp-cost"
  | "nigeria-etp-original-410bn"
  | "nigeria-power-2060-277gw"
  | "clean-vs-fossil-investment-2026"
  | "solar-pv-cost-fall-since-2010"
  | "record-renewable-additions-2025-africa"
  | "global-temperature-2025"
  | "energy-co2-2025"
  | "ssa-population-growth-2054";

/** Verified data series (src/content/data/series/<id>.json). */
export type SeriesId =
  | "electricity_access_pct"
  | "people_without_electricity"
  | "solar_pv_capacity_gw"
  | "solar_pv_module_price"
  | "generation_by_source_nigeria"
  | "generation_by_source_africa"
  | "low_carbon_share_electricity"
  | "co2_per_capita"
  | "temperature_anomaly"
  | "brent_crude_annual"
  | "brent_crude_monthly"
  | "energy_per_person"
  | "electricity_per_person";

export type SourceRef = {
  org: string;
  title?: string;
  url?: string;
  /** Indicator or series code, e.g. "EG.ELC.ACCS.ZS". */
  code?: string;
  licence?: string;
};

export type Cta = { label: string; href: string; external?: boolean };

/** The small tag on a numeral card in place of a figure number. */
export type FactTag = "Gap" | "Opening" | "Target" | "Context";

/** The comparison glyph drawn beside a numeral. */
export type GlyphSpec =
  | { kind: "dots"; count: number }
  | {
      kind: "share";
      value: number;
      total: number;
      labels: readonly [string, string];
    }
  | {
      kind: "compare";
      a: { value: number; label: string };
      b: { value: number; label: string };
      mode: "gap" | "growth";
    };

export type OpEd = {
  slug: string;
  title: string;
  outlet: string;
  url: string;
  /** ISO date, YYYY-MM-DD. */
  publishedOn: string;
  topics: readonly OpEdTopic[];
  summary: string;
  pullQuote?: string;
};

export type Mention = {
  title: string;
  outlet: string;
  url: string;
  publishedOn: string;
  /** True for a copy of a BusinessDay report on another site. */
  syndication: boolean;
};

export type Counts = {
  opeds: number;
  /** BusinessDay reports quoting him, syndications excluded. */
  mentions: number;
  articles: number;
  firstOpEd: string;
  lastOpEd: string;
};
