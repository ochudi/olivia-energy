/**
 * Home page copy. Section order: hero → services index → heritage (with
 * the chapter photograph) → stats (hidden until an admin switches the band
 * on) → latest insights → closing CTA. Service names and summaries live in
 * ./site (shared with the footer and What We Do).
 *
 * Dated facts (incorporation, the two retail outlets) are sourced from the
 * company's CAC record and Brand Spur's reports of June and November 2020.
 */

export const HERO = {
  eyebrow: "Independent energy advisory",
  /** Nine words, one claim, and the whole positioning in it. */
  title: "Advice from people who have run an energy business.",
  lede: "Advisory and research for energy markets in the United\u00a0States and Nigeria.",
  primary: { label: "What we do", href: "/what-we-do" },
  secondary: { label: "Read the research", href: "/publications" },
  /**
   * The foot of the hero: three sourced facts (company record, the
   * founder's BusinessDay biography, the LinkedIn headquarters), set as a
   * list above a hairline. Claims from the brief that are not yet
   * confirmed (the United States entity, NIPEX) stay out of it.
   */
  credentials: [
    "Incorporated in Nigeria in 2020",
    "Led by Dr Olugbenga Olaoye, energy economist",
    "Fort Worth, Texas · Otta, Ogun State",
  ],
} as const;

export const SERVICES_INDEX = {
  eyebrow: "Services",
  title: "From the forecourt to the boardroom.",
} as const;

export const HERITAGE = {
  eyebrow: "Heritage",
  title: "From Nigeria’s downstream to the energy transition.",
  paragraphs: [
    "Olivia Energy began in fuel retail. It was incorporated in Nigeria in February 2020, opened its first service station at Sango Ota, Ogun State, that June, and a second outlet at Oju Ore, Otta, in November.",
    "Today Olivia Energy is an independent energy consultancy. Its advisory and research practice grew from that operating base and from its founder’s research in energy and environmental economics, published since 2022.",
  ],
  timeline: [
    {
      period: "February 2020",
      label: "Incorporated in Nigeria",
      detail: "Olivia Energy and Power Company Limited, a fuel retailer.",
    },
    {
      period: "June 2020",
      label: "First service station",
      detail:
        "Sango Ota, Ogun State, designed to serve more than 1,000 customers a day.",
    },
    {
      period: "November 2020",
      label: "Second retail outlet",
      detail: "Oju Ore, Otta, with a supermart, restaurant and bakery on site.",
    },
    {
      period: "Today",
      label: "Advisory and research practice",
      detail: "Serving the United States and Nigeria.",
      current: true,
    },
  ],
  link: { label: "Our story", href: "/about" },
} as const;

/**
 * Default figures for the stats band (the live values are in Admin →
 * Settings → Homepage stats). Sources: the two retail outlets, Brand Spur
 * (June and November 2020); journal articles, the founder's OpenAlex and
 * ORCID records (nine distinct articles, 2022 to 2025); citations, OpenAlex
 * (140) and Google Scholar (about 131) in September 2026, so "130+" holds
 * under either count.
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
    description: "Opened in Ogun State in 2020",
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

export const LATEST_INSIGHTS = {
  eyebrow: "Latest insights",
  title: "Recent analysis from Olivia Insights.",
  link: { label: "All insights", href: "/insights" },
} as const;

/** Closing call to action, shared by Home and What We Do. */
export const CTA = {
  title: "Tell us what you are weighing.",
  body: "We will say plainly whether we can help, and how.",
  button: { label: "Write to us", href: "/contact" },
} as const;
