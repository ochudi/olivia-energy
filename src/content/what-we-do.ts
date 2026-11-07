/**
 * What we do page copy (creative brief 4.2): the hero with Fig. 1, the
 * chapter bar, six service chapters (Fig. 2 inside chapter 02), what makes
 * us different, the four pillars, who we serve and the close. Service
 * titles, numbers and slugs come from ./site and are joined here by slug;
 * the pillars, differentiators and audiences live in ./brand.
 *
 * Every numeral is a verified figure named by its fact or series id.
 */
import type {
  FactId,
  FactTag,
  GlyphSpec,
  PhotoKey,
  SeriesId,
  ServiceSlug,
  SourceRef,
  Surface,
} from "@/types/contracts";
import { POSITIONING } from "./brand";
import { RETRIEVED, type FigureCopy } from "./home";

export const WWD_HERO: {
  title: string;
  /** The lede: the first sentence of the positioning statement. */
  lede: string;
  /**
   * The second sentence, shown from 768px. On phones the first screen is
   * the headline, one sentence and the figure rather than twelve lines of
   * text on green; the sentence restates the positioning the lede holds.
   */
  ledeMore: string;
  figure: FigureCopy & { labels: { start: string; end: string }; pill: string };
} = {
  title: "Research, strategic advice and practical solutions.",
  /**
   * A light reframe of the positioning statement that opens the client's
   * guideline document (his instruction of 3 October 2026): same meaning,
   * no new claims. The home hero carries the shorter reframe (POSITIONING).
   */
  lede: "Olivia Energy is a strategic energy advisory, research and sustainability consultancy, committed to accelerating the move to a cleaner, more secure and more inclusive energy future.",
  ledeMore:
    "We partner with governments, businesses, investors and development organisations on evidence-based solutions in energy transition, climate policy, ESG, sustainable infrastructure and the transformation of energy markets.",
  figure: {
    n: 1,
    title: "The price of solar modules, 1975 to 2024",
    subtitle: "US dollars per watt, constant 2025 prices, log scale",
    interpretation:
      "Solar modules now cost a fraction of what they did. Africa holds 60% of the world’s best solar resources, yet had less than 1% of the world’s installed solar capacity at the end of 2025.",
    sources: [
      {
        org: "Our World in Data",
        title: "from IRENA (2025), Nemet (2009), and Farmer and Lafond (2016)",
        licence: "CC BY 4.0",
        url: "https://ourworldindata.org/grapher/solar-pv-prices",
      },
      {
        org: "International Energy Agency",
        title: "Africa Energy Outlook 2022",
        url: "https://www.iea.org/reports/africa-energy-outlook-2022/key-findings",
      },
      {
        org: "IRENA",
        title: "Renewable Capacity Statistics 2026",
        url: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2026/Mar/IRENA_DAT_RE_capacity_statistics_2026.pdf",
      },
    ],
    retrieved: RETRIEVED,
    series: "solar_pv_module_price",
    /** The start and end values are labelled through `labels`. */
    endLabels: {},
    labels: { start: "$132.38 in 1975", end: "$0.27 in 2024" },
    /** Lime pill, ink text. */
    pill: "99.8% cheaper",
  },
};

/**
 * Accessible name of the sticky chapter navigation (`<nav aria-label>`). The
 * brief gives no wording; approved in the Q2 copy audit (3 Oct 2026).
 */
export const CHAPTER_BAR_LABEL: string = "Services on this page";

export type NumeralCard = {
  fact?: FactId;
  series?: SeriesId;
  numeral: number;
  decimals?: number;
  suffix?: string;
  unit?: string;
  tag: FactTag;
  caption: string;
  glyph?: GlyphSpec;
  source: SourceRef;
  retrieved: string;
};

export type ServiceLine = {
  slug: ServiceSlug;
  /** Chapter lede, set in Newsreader roman. */
  lede: string;
  body: string;
  /** The five services of the line, from the guideline. */
  bullets: readonly [string, string, string, string, string];
  surface: Surface;
  /** Side of the photograph at 1440. */
  photoSide: "left" | "right";
  card?: NumeralCard;
  figure?: "installed-not-delivered";
};

const CHAPTERS = [
  {
    slug: "energy-transition-advisory",
    lede: "Innovation accelerates progress.",
    body: "We help organisations set net-zero strategies and turn them into decarbonisation roadmaps and transition plans that integrate renewables and build climate resilience.",
    bullets: [
      "Net-zero strategies",
      "Decarbonisation roadmaps",
      "Renewable integration",
      "Transition planning",
      "Climate resilience",
    ],
    surface: "paper",
    photoSide: "left",
    card: {
      fact: "nigeria-power-2060-277gw",
      numeral: 277,
      unit: "GW",
      tag: "Target",
      caption:
        "of installed power capacity by 2060 is the target in Nigeria’s updated Energy Transition Plan, with electricity generation rising 6.5 times from 2020.",
      source: {
        org: "Nigeria Energy Transition Plan",
        title: "2024 update, hosted by Sustainable Energy for All",
        url: "https://www.seforall.org/system/files/2025-05/Nigeria-ETIP-u.pdf",
      },
      retrieved: RETRIEVED,
    },
  },
  {
    slug: "energy-economics-policy",
    lede: "Policy shapes markets.",
    body: "We analyse energy markets, advise on regulation and tariffs, and measure the economic impact of policy, so that decisions rest on evidence.",
    bullets: [
      "Energy market analysis",
      "Regulatory advisory",
      "Economic impact studies",
      "Tariff analysis",
      "Policy development",
    ],
    // The deep field, not night: the chapter carries a lede, a list and
    // three step paragraphs, and prose never sits on night (DESIGN.md,
    // Colors). Fig. 2's plate is the night object on it.
    surface: "paper-deep",
    photoSide: "left",
    figure: "installed-not-delivered",
  },
  {
    slug: "esg-sustainability",
    lede: "Growth, environmental protection and social impact, in balance.",
    body: "We help organisations set an ESG strategy, report against it with confidence and manage their carbon.",
    bullets: [
      "ESG strategy",
      "ESG reporting",
      "Materiality assessments",
      "Sustainability reporting",
      "Carbon management",
    ],
    surface: "paper",
    photoSide: "right",
    card: {
      fact: "nigeria-flaring-rank-2025",
      numeral: 83,
      suffix: "%",
      tag: "Gap",
      caption:
        "of global gas flaring in 2025 came from nine countries, Nigeria among them, which together produced 46% of the world’s oil.",
      glyph: {
        kind: "compare",
        a: { value: 83, label: "Gas flaring" },
        b: { value: 46, label: "Oil production" },
        mode: "gap",
      },
      source: {
        org: "World Bank",
        title: "Global Gas Flaring Tracker Report, June 2026",
        url: "https://documents1.worldbank.org/curated/en/099071626222036730/pdf/P507104-60bded2c-d259-4881-a42f-d24e983b3eca.pdf",
      },
      retrieved: RETRIEVED,
    },
  },
  {
    slug: "research-analytics",
    lede: "Knowledge drives transformation.",
    body: "We turn data into decisions: market intelligence, industry reports, feasibility studies and scenario models built for the question at hand.",
    bullets: [
      "Market intelligence",
      "Industry reports",
      "Feasibility studies",
      "Data analytics",
      "Scenario modelling",
    ],
    surface: "paper-deep",
    photoSide: "left",
    card: {
      series: "electricity_per_person",
      numeral: 175,
      unit: "kWh",
      tag: "Gap",
      caption:
        "of electricity was generated per person in Nigeria in 2025, against a world average of 3,860 kWh.",
      glyph: {
        kind: "compare",
        a: { value: 175, label: "Nigeria" },
        b: { value: 3860, label: "World" },
        mode: "gap",
      },
      source: {
        org: "Our World in Data",
        title: "from Ember (2026)",
        licence: "CC BY 4.0",
        url: "https://ourworldindata.org/grapher/per-capita-electricity-generation",
      },
      retrieved: RETRIEVED,
    },
  },
  {
    slug: "capacity-development",
    lede: "Training that bridges industry, academia and public policy.",
    body: "We design executive training, workshops and seminars that build the skills the energy transition needs, for leaders in government and industry.",
    bullets: [
      "Executive training",
      "Energy transition workshops",
      "ESG education",
      "Leadership development",
      "Public policy seminars",
    ],
    surface: "paper",
    photoSide: "right",
    card: {
      fact: "ssa-population-growth-2054",
      numeral: 2.2,
      decimals: 1,
      unit: "billion",
      tag: "Context",
      caption:
        "people will live in sub-Saharan Africa by 2054, after 79% growth in thirty years, on United Nations projections.",
      source: {
        org: "United Nations",
        title: "World Population Prospects 2024",
        url: "https://population.un.org/wpp/assets/Files/WPP2024_Summary-of-Results.pdf",
      },
      retrieved: RETRIEVED,
    },
  },
  {
    slug: "project-advisory",
    lede: "Disciplined execution, from first plan to final evaluation.",
    body: "We bring project and programme management discipline to energy projects, with stakeholder engagement, risk management, and monitoring and evaluation.",
    bullets: [
      "Project management",
      "Programme management",
      "Stakeholder engagement",
      "Risk management",
      "Monitoring and evaluation",
    ],
    surface: "paper-deep",
    photoSide: "left",
    card: {
      fact: "africa-energy-investment-fall-debt",
      numeral: 85,
      suffix: "%+",
      tag: "Gap",
      caption:
        "Debt service costs equalled more than 85% of Africa’s total energy investment in 2025, and that investment was a third lower than in 2015 (IEA estimates).",
      /**
       * The 85% share is the hatched part. The brief names one label; the
       * second is left empty for the bar's remainder.
       */
      glyph: {
        kind: "share",
        value: 85,
        total: 100,
        labels: ["Debt service as a share of energy investment", ""],
      },
      source: {
        org: "International Energy Agency",
        title: "World Energy Investment 2025",
        url: "https://www.iea.org/reports/world-energy-investment-2025/executive-summary",
      },
      retrieved: RETRIEVED,
    },
  },
] as const satisfies readonly ServiceLine[];

/** The six chapters, in the order of SERVICES in ./site. */
export const SERVICE_LINES: readonly ServiceLine[] = CHAPTERS;

/** Fig. 2 in chapter 02 (facts nigeria-grid-installed-vs-available-q1-2026, nigeria-grid-delivered-q1-2026). */
export const INSTALLED_FIGURE: {
  n: number;
  title: string;
  legend: { unit: string; hatched: string; outline: string };
  note: string;
  steps: readonly { label: string; heading: string; body: string }[];
  photo: PhotoKey;
  photoCaption: string;
  sources: SourceRef[];
  retrieved: string;
  /** 17 x 8 squares of 100 MW; state 2 lights `available`, state 3 keeps `generated` lit and hatches the rest. */
  squares: { total: number; available: number; generated: number };
} = {
  n: 2,
  title: "Installed is not delivered: Nigeria’s grid, first quarter of 2026",
  legend: {
    unit: "Each square is 100 MW",
    hatched: "Available, not generated",
    outline: "Unavailable",
  },
  note: "Squares are rounded to the nearest 100 MW.",
  steps: [
    {
      label: "Step 1",
      heading: "Installed: 13,625 MW",
      body: "Nigeria’s 28 grid-connected power plants have 13,625 MW of installed capacity. Each square is 100 MW.",
    },
    {
      label: "Step 2",
      heading: "Available: 4,458 MW",
      body: "On average in the quarter, less than a third of it could run: a plant availability factor of 32.7%.",
    },
    {
      label: "Step 3",
      heading: "Delivered: 4,113 MWh an hour",
      body: "That is what the grid actually generated, on average, each hour of the quarter: 8,883 GWh in total. The red squares were available but not generated.",
    },
  ],
  photo: "lagos-lekki-night",
  photoCaption:
    "Lekki-Ikoyi Link Bridge, Lagos. Photo: Opeyemi Adisa, Unsplash",
  sources: [
    {
      org: "Nigerian Electricity Regulatory Commission",
      title: "Quarterly Report, first quarter 2026",
      url: "https://nerc.gov.ng/wp-content/uploads/2026/07/2026_Q1-Report.pdf",
    },
  ],
  retrieved: RETRIEVED,
  squares: { total: 136, available: 45, generated: 41 },
};

/** Read by llms.txt: `INTRO.positioning` is its summary line. */
export const INTRO = {
  positioning: POSITIONING,
} as const;
