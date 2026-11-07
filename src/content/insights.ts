import type { Counts, Cta, OpEdTopic } from "@/types/contracts";
import type { PostCategory } from "@/lib/supabase/types";
import { capitalise, countWords, formatDateLong } from "@/lib/content/format";
import { RETRIEVED, type FigureCopy } from "./home";

/**
 * Insights copy Articles come from the
 * database (src/lib/supabase/queries.ts), op-eds and mentions from the
 * commentary reads; the eight formats are FORMATS in ./brand.
 */
export const INSIGHTS_PAGE: {
  hero: {
    title: string;
    lede: string;
    figure: FigureCopy & { hatchArea: string };
  };
  articles: {
    title: string;
    /** Visually hidden. */
    filterLabel: string;
    allTopics: string;
    empty: string;
  };
  businessday: { title: string; lede: string };
  quoted: {
    title: string;
    lede: (c: Counts) => string;
    footnote: string;
    /** The words in `footnote` that link the syndicated copy. */
    footnoteLink: string;
    /** Chip on rows the outlet labels BusinessDay Pro. */
    proChip: string;
  };
  article: {
    /** "Insights / {Category label}". */
    breadcrumb: string;
    meta: (p: {
      author: string;
      publishedAt: string;
      minutes: number;
    }) => string;
    authorCard: string;
    authorLink: Cta;
    more: string;
  };
} = {
  hero: {
    title: "Knowledge drives transformation.",
    lede: "Analysis, commentary and data on energy security, downstream markets and the energy transition in Africa.",
    figure: {
      n: 1,
      dateChip: "Figure, October 2026",
      title: "People without electricity, 2000 to 2024",
      interpretation:
        "Since 2000 the number of people without electricity has more than halved worldwide, from 1.34 billion to 657 million. In sub-Saharan Africa it rose, from 506 million to 579 million, so the region is now home to most of the people still without power.",
      sources: [
        {
          org: "Our World in Data",
          title: "from World Bank",
          licence: "CC BY 4.0",
          url: "https://ourworldindata.org/grapher/people-without-electricity-country",
        },
      ],
      retrieved: RETRIEVED,
      series: "people_without_electricity",
      endLabels: {
        World: "World 657 million",
        "Sub-Saharan Africa": "Sub-Saharan Africa 579 million",
      },
      /** The series whose area is hatched. */
      hatchArea: "Sub-Saharan Africa",
    },
  },
  articles: {
    title: "Articles",
    filterLabel: "Filter by topic",
    allTopics: "All topics",
    empty: "The first articles are in preparation.",
  },
  businessday: {
    title: "On the record.",
    lede: "Op-eds by Dr Olugbenga Olaoye, newest first. BusinessDay publishes them on its opinion pages under its house byline; each closes with his author note.",
  },
  quoted: {
    title: "Quoted in BusinessDay",
    lede: (c) =>
      `${capitalise(countWords(c.mentions))} BusinessDay reports have quoted Dr Olaoye as an energy economist.`,
    footnote: "One of these reports was also syndicated by Parrot Nigeria.",
    footnoteLink: "Parrot Nigeria",
    proChip: "BusinessDay Pro",
  },
  article: {
    breadcrumb: "Insights",
    meta: ({ author, publishedAt, minutes }) =>
      `By ${author}, ${formatDateLong(publishedAt)}, ${minutes} min read`,
    authorCard:
      "Dr Olugbenga Olaoye is the founder of Olivia Energy and an energy economist. He writes for BusinessDay.",
    authorLink: { label: "About our founder", href: "/about#founder" },
    more: "More insights",
  },
};

/** The section's name, read by the feed, the article JSON-LD and the social card. */
export const INSIGHTS = {
  name: "Olivia Energy Insights",
} as const;

/**
 * What each category covers, as a phrase. A category page uses it,
 * capitalised, as its lede and to open its search description.
 */
export const CATEGORY_TOPICS: Record<PostCategory, string> = {
  "market-analysis":
    "prices, supply and demand in Nigerian and US energy markets",
  "policy-regulation":
    "how energy rules, tariffs and reforms in Nigeria and the United States land in the market",
  "energy-transition":
    "solar, gas-to-power and the economics of decarbonisation in Nigeria and the United States",
  "downstream-gas":
    "fuel pricing, supply, storage and retail in Nigeria’s deregulated market",
  power: "demand, generation and tariffs in Nigeria and across Africa",
  "finance-investment":
    "ESG reporting, the cost of capital and investment cases for energy firms",
  "research-notes":
    "short evidence summaries on energy economics in Africa and the United States",
};

/**
 * The op-ed topics that belong with each Insights category. A category
 * page and an article close on the founder's newest matching op-eds
 * Only energy op-eds are shown (isEnergyOpEd).
 */
export const CATEGORY_OPED_TOPICS: Record<PostCategory, readonly OpEdTopic[]> =
  {
    "market-analysis": ["Oil and gas", "Energy security"],
    "policy-regulation": ["Policy"],
    "energy-transition": ["Energy transition", "Climate and ESG"],
    "downstream-gas": ["Downstream", "Dangote Refinery", "Oil and gas"],
    power: ["Power"],
    "finance-investment": ["Economy"],
    "research-notes": [],
  };
