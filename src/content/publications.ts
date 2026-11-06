import type { Counts, Cta, SourceRef } from "@/types/contracts";
import { capitalise, countWords, monthYear } from "@/lib/content/format";
import { RETRIEVED } from "./home";

/**
 * Research page copy (/research, creative brief 4.6). Journal articles come
 * from the database (getJournalArticles), op-eds from getOpEds, counts from
 * getCommentaryCounts.
 */
export const RESEARCH_PAGE: {
  hero: {
    /** The collection's name in structured data. */
    name: string;
    title: string;
    lede: string;
    counters: readonly {
      key: "articles" | "citations";
      value: string;
      label: string;
    }[];
    figure: {
      n: number;
      title: string;
      legend: { article: string; oped: string };
      interpretation: (c: Counts) => string;
      sources: SourceRef[];
      retrieved: string;
    };
  };
  articles: {
    title: string;
    linkLabel: string;
    /** Accessible name of the DOI link. */
    linkAriaLabel: (title: string) => string;
  };
  commentary: {
    title: string;
    lede: (c: Counts) => string;
    link: Cta;
  };
  profiles: {
    title: string;
    sentence: string;
    /** Pill labels; URLs from FOUNDER.links and settings (scholar_url). */
    pills: readonly ["ORCID", "Google Scholar"];
    membership: string;
  };
} = {
  hero: {
    name: "Research",
    title: "Independent research that informs decisions.",
    lede: "Peer-reviewed research and published commentary by our founder, Dr Olugbenga Olaoye, on energy economics, environmental quality and policy.",
    counters: [
      { key: "articles", value: "9", label: "journal articles since 2022" },
      {
        key: "citations",
        value: "200+",
        label: "citations, Google Scholar, 2 October 2026",
      },
    ],
    figure: {
      n: 1,
      title: "In print, 2022 to 2026",
      legend: { article: "Journal article", oped: "BusinessDay op-ed" },
      interpretation: (c) =>
        `${capitalise(countWords(c.articles))} journal articles since 2022 and ${countWords(c.opeds)} op-eds in BusinessDay since ${monthYear(c.firstOpEd)}.`,
      sources: [
        {
          org: "ORCID record 0000-0003-2658-916X",
          url: "https://orcid.org/0000-0003-2658-916X",
        },
        {
          org: "BusinessDay",
          url: "https://businessday.ng/author/olugbenga-olaoye/",
        },
      ],
      retrieved: RETRIEVED,
    },
  },
  articles: {
    title: "Journal articles",
    linkLabel: "Read the article",
    /** Contains the visible label, so the accessible name matches it. */
    linkAriaLabel: (title) =>
      `Read the article: “${title}”, opens in a new tab`,
  },
  commentary: {
    title: "In BusinessDay",
    lede: (c) =>
      `${capitalise(countWords(c.opeds))} op-eds by Dr Olaoye, newest first.`,
    link: {
      label: "See the covers on Insights",
      href: "/insights#businessday",
    },
  },
  profiles: {
    title: "Find the record",
    sentence: "His publications are listed on ORCID and Google Scholar.",
    pills: ["ORCID", "Google Scholar"],
    membership: "Member, United States Association for Energy Economics",
  },
};
