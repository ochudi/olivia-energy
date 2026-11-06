/**
 * The client's brand guideline blocks, in their final wording (creative
 * brief, section 4). Page files import from here so a line that appears on
 * two pages (the philosophy lines, the vision, the audiences) is written
 * once. Every string is entered exactly as the brief gives it.
 */
import type {
  Counts,
  Cta,
  GlyphName,
  InsightFormat,
  OpEd,
  Surface,
} from "@/types/contracts";
import { formatDateLong, formatDateShort } from "@/lib/content/format";

/** Tagline 1, as one thought in two lines (decision 1). */
export const TAGLINE: { line1: string; line2: string } = {
  line1: "Powering the transition.",
  line2: "Inspiring sustainable futures.",
};

/** The positioning statement: the home hero lede. */
export const POSITIONING: string =
  "Olivia Energy is a strategic energy advisory, research and sustainability consultancy, committed to a cleaner, more secure and more inclusive energy future. We bring evidence-based solutions to governments, businesses, investors and development organisations.";

/** "Why Olivia?", verbatim lines (home section 2). */
export const WHY_OLIVIA: {
  heading: string;
  lines: readonly string[];
  closing: string;
} = {
  heading: "Why Olivia?",
  lines: [
    "Energy is changing.",
    "Policies are evolving.",
    "Markets are transforming.",
    "Climate risks are increasing.",
    "Businesses must adapt.",
    "Governments need evidence.",
    "Investors require clarity.",
    "Communities deserve sustainable solutions.",
  ],
  closing: "We exist to bridge these gaps.",
};

/** Our Philosophy (the home close band, "We believe"). */
export const PHILOSOPHY: {
  /** The small heading over the four lines. */
  heading: string;
  lines: readonly string[];
  /** Set as one statement, roman: italic belongs to the tagline alone (DESIGN.md, Typography). */
  statement: string;
} = {
  heading: "We believe",
  lines: [
    "Energy changes lives.",
    "Policy shapes markets.",
    "Innovation accelerates progress.",
    "Knowledge drives transformation.",
  ],
  statement: "Sustainability is not a choice. It is a responsibility.",
};

export const VISION: { heading: string; text: string } = {
  heading: "Our vision",
  text: "To be Africa’s leading energy transition, sustainability and policy advisory firm, shaping resilient energy systems that drive economic prosperity, environmental stewardship and inclusive development.",
};

export const MISSION: { heading: string; text: string } = {
  heading: "Our mission",
  text: "To provide innovative research, strategic advice and practical solutions that help governments, businesses and institutions navigate a changing energy landscape while advancing sustainability, energy security and economic growth.",
};

export type BrandValue = { name: string; glyph: GlyphName; text: string };

/** Core Values, five, in the guideline order (About section 5). */
export const VALUES_LIST: readonly BrandValue[] = [
  {
    name: "Excellence",
    glyph: "excellence",
    text: "We pursue the highest standards in research, consulting and client service.",
  },
  {
    name: "Integrity",
    glyph: "integrity",
    text: "We act ethically, transparently and professionally in every engagement.",
  },
  {
    name: "Innovation",
    glyph: "innovation",
    text: "We embrace new ideas, technologies and approaches to solve complex energy challenges.",
  },
  {
    name: "Sustainability",
    glyph: "sustainability",
    text: "We promote responsible energy solutions that balance economic growth, environmental protection and social impact.",
  },
  {
    name: "Collaboration",
    glyph: "collaboration",
    text: "We build strong partnerships that create lasting value for clients and communities.",
  },
];

export type Pillar = {
  name: string;
  glyph: GlyphName;
  text: string;
  surface: Surface;
};

/** Four Pillars (What we do section 10). */
export const PILLARS: {
  title: string;
  items: readonly Pillar[];
} = {
  title: "Four pillars.",
  items: [
    {
      name: "Research",
      glyph: "research",
      text: "Independent research that informs decisions.",
      surface: "green",
    },
    {
      name: "Advisory",
      glyph: "advisory",
      text: "Strategic advice for governments and businesses.",
      surface: "night",
    },
    {
      name: "Innovation",
      glyph: "innovation",
      text: "Helping organisations navigate energy transformation.",
      surface: "lime",
    },
    {
      name: "Impact",
      glyph: "impact",
      text: "Creating measurable social, economic and environmental value.",
      surface: "red",
    },
  ],
};

/** What makes us different (What we do section 9). */
export const DIFFERENTIATORS_BLOCK: {
  title: string;
  items: readonly string[];
} = {
  title: "Practical advice, informed by real operations.",
  items: [
    "Deep industry expertise across conventional and renewable energy.",
    "Evidence-based research and economic analysis.",
    "Practical policy advice informed by real-world operations.",
    "Experience across government, industry, academia and the non-profit sector.",
    "A global perspective with a strong understanding of African energy markets.",
    "A commitment to sustainable development and energy equity.",
  ],
};

export type Audience = {
  name: string;
  surface: Surface;
  items: readonly string[];
};

/**
 * Who We Serve: institution types only, never named organisations
 * (decision 11). Shared by the home compact block and the What we do full
 * block.
 */
export const AUDIENCES: {
  title: string;
  lede: string;
  items: readonly Audience[];
} = {
  title: "For the institutions that shape energy systems.",
  lede: "Our advice is built for four kinds of institution, from energy ministries and regulators to investors, development partners and research institutes.",
  items: [
    {
      name: "Governments",
      surface: "green",
      items: ["Energy ministries", "Regulators", "State agencies"],
    },
    {
      name: "Private sector",
      surface: "night",
      items: [
        "Oil and gas",
        "Utilities",
        "Renewable energy developers",
        "Manufacturing",
        "Financial institutions",
      ],
    },
    {
      name: "Development partners",
      surface: "lime",
      items: [
        "Multilateral development banks",
        "Bilateral agencies",
        "UN agencies",
        "Foundations and non-governmental organisations",
      ],
    },
    {
      name: "Academia",
      surface: "red",
      items: ["Research institutes", "Universities"],
    },
  ],
};

export type FormatItem = {
  id: InsightFormat;
  name: string;
  description: string;
  /** Shown while the format has nothing published. */
  emptyLabel: string;
};

/**
 * The eight Insights formats (decision 10). No cadence words. The home
 * chips use `name`. Status labels: `status.published(n)` when a format has
 * posts; Executive commentaries and Research papers always show their
 * counts from the publication data.
 */
export const FORMATS: {
  title: string;
  lede: string;
  items: readonly FormatItem[];
  status: {
    published: (n: number) => string;
    commentary: (opeds: number) => string;
    papers: (articles: number) => string;
  };
} = {
  title: "Eight formats, one standard of evidence.",
  lede: "Olivia Energy Insights is building a library for decision makers. Two formats are already in print. The others are in preparation, and each will appear here with its first issue.",
  items: [
    {
      id: "energy-transition-briefing",
      name: "Energy transition briefings",
      description:
        "Short, sourced reads on what changed in the transition and why it matters.",
      emptyLabel: "First issue coming",
    },
    {
      id: "downstream-market-outlook",
      name: "Downstream market outlooks",
      description:
        "Fuel supply, pricing and refining, including the Dangote refinery.",
      emptyLabel: "First issue coming",
    },
    {
      id: "african-energy-outlook",
      name: "African Energy Outlook",
      description:
        "A continental view of energy access, investment and supply.",
      emptyLabel: "First issue coming",
    },
    {
      id: "esg-insight",
      name: "ESG insights",
      description:
        "Practical notes on ESG strategy, reporting and carbon management.",
      emptyLabel: "First issue coming",
    },
    {
      id: "policy-brief",
      name: "Policy briefs",
      description: "Evidence for ministries, regulators and state agencies.",
      emptyLabel: "First issue coming",
    },
    {
      id: "executive-commentary",
      name: "Executive commentaries",
      description: "Op-eds and commentary by Dr Olugbenga Olaoye.",
      emptyLabel: "First issue coming",
    },
    {
      id: "research-paper",
      name: "Research papers",
      description: "Peer-reviewed research by our founder.",
      emptyLabel: "First issue coming",
    },
    {
      id: "webinar-podcast",
      name: "Webinars and podcasts",
      description: "Conversations on energy policy and markets.",
      emptyLabel: "First episode coming",
    },
  ],
  status: {
    published: (n) => `${n} published`,
    /** Links to #businessday. */
    commentary: (opeds) => `${opeds} published in BusinessDay`,
    /** Links to /research. */
    papers: (articles) => `${articles} journal articles`,
  },
};

/** The Brand Story: About hero (headline, lede) and story band. */
export const BRAND_STORY: {
  headline: string;
  lede: string;
  /** The story band's heading. */
  storyHeading: string;
  paragraph: string;
  statement: string;
} = {
  headline:
    "Powering Africa’s energy future through knowledge, innovation and sustainable solutions.",
  lede: "The global energy landscape is going through its greatest transformation in history. As nations balance energy security, economic growth and environmental responsibility, the need for trusted advisers has never been greater.",
  storyHeading: "Our story",
  paragraph:
    "At Olivia Energy, we bridge the gap between policy, business, research and technology, helping governments, corporations, development institutions and investors navigate the complexities of the energy transition.",
  statement:
    "Our work is driven by evidence, shaped by experience and focused on sustainable solutions that create long-term value for society.",
};

/** A Refined Brand Narrative (About "Who we are"). */
export const NARRATIVE: {
  title: string;
  paragraphs: readonly [string, string];
} = {
  title: "One of the defining challenges of our time.",
  paragraphs: [
    "Olivia Energy is a strategic energy advisory, research and sustainability firm dedicated to helping organisations navigate the global energy transition. We combine deep industry experience with rigorous research and innovative thinking.",
    "We deliver practical solutions that strengthen energy security, accelerate decarbonisation, improve environmental performance and create sustainable economic value. From policy advisory and ESG strategy to market intelligence and capacity building, we help governments, businesses, investors and development partners make informed decisions that shape a cleaner, more resilient energy future.",
  ],
};

/** "Start a conversation", the one call to action on every close band. */
export const CONVERSATION_CTA: Cta = {
  label: "Start a conversation",
  href: "/contact",
};

export type CloseCopy = {
  /** A small heading over the lines (the home band's "We believe"). */
  heading?: string;
  lines?: readonly string[];
  /** Set roman in full, at display-xl. */
  statement: string;
  cta: Cta;
};

/** The red close band on every page (creative brief 3.3). */
export const CLOSES: Record<
  "home" | "whatWeDo" | "about" | "insights" | "research",
  CloseCopy
> = {
  home: {
    heading: PHILOSOPHY.heading,
    lines: PHILOSOPHY.lines,
    statement: PHILOSOPHY.statement,
    cta: CONVERSATION_CTA,
  },
  whatWeDo: {
    statement: "Governments need evidence. Investors require clarity.",
    cta: CONVERSATION_CTA,
  },
  about: {
    statement: "We exist to bridge these gaps.",
    cta: CONVERSATION_CTA,
  },
  insights: {
    statement: "Communities deserve sustainable solutions.",
    cta: CONVERSATION_CTA,
  },
  research: {
    statement: "Our work is driven by evidence and shaped by experience.",
    cta: CONVERSATION_CTA,
  },
};

/**
 * Op-ed cover and quotation copy, shared by the home cover wall and the
 * Insights archive (creative brief 4.1 section 7).
 */
export const COVER_COPY: {
  label: (publishedOn: string) => string;
  leadLabel: (publishedOn: string) => string;
  /** Accessible name of the hero card's icon-only link. */
  linkLabel: (title: string) => string;
  /** Read after a cover's title by screen readers: where the link goes. */
  onOutlet: string;
  /** Under the large quotation. */
  attribution: (oped: Pick<OpEd, "title" | "outlet" | "publishedOn">) => string;
  /** Count line beside the wall's heading. */
  countLine: (c: Counts) => string;
} = {
  label: (publishedOn) => `BusinessDay, ${formatDateShort(publishedOn)}`,
  leadLabel: (publishedOn) =>
    `Latest, BusinessDay, ${formatDateShort(publishedOn)}`,
  linkLabel: (title) => `Read “${title}” on BusinessDay, opens in a new tab`,
  onOutlet: ", on BusinessDay, opens in a new tab",
  attribution: (oped) =>
    `Dr Olugbenga Olaoye, “${oped.title}”, ${oped.outlet}, ${formatDateLong(oped.publishedOn)}`,
  countLine: (c) =>
    `${c.opeds} op-eds, quoted in ${c.mentions} BusinessDay reports`,
};
