import { FOUNDER } from "./about";

/**
 * Publications page copy. The papers themselves come from the database
 * (getPublications in src/lib/supabase/queries.ts; seeded from
 * supabase/seeds/publications.sql) and the founder's Google Scholar
 * profile from settings (scholar_url); this file holds only the page
 * furniture.
 */
export const PUBLICATIONS = {
  eyebrow: "Publications",
  title: "Papers and published research.",
  /** One sentence on the founder's research, matching the seeded list. */
  intro: `Journal articles by ${FOUNDER.name} and his co-authors, chiefly in energy and environmental economics with a focus on Africa, each linked to its published version.`,
  /** Metadata description. */
  description: `Journal articles by ${FOUNDER.name}, founder of Olivia Energy, chiefly in energy and environmental economics, each linked to its published version.`,
  scholarLabel: "Google Scholar profile",
  /**
   * Research profile panel. Metrics come from OpenAlex (src/lib/research/
   * openalex.ts) for the author id below; Google Scholar has no API, so the
   * profile link points there and the numbers come from OpenAlex.
   */
  profile: {
    heading: "Research profile",
    openalexAuthorId: "A5091615039",
    metrics: {
      articles: "Journal articles",
      citations: "Citations",
      hIndex: "h-index",
      i10Index: "i10-index",
    },
    note: "Citation counts from OpenAlex, refreshed daily. Google Scholar's figures may differ slightly.",
  },
  /** Per-paper citation label. */
  cited: (count: number) =>
    count === 1 ? "Cited once" : `Cited ${count.toLocaleString("en")} times`,
  featured: { heading: "Selected papers" },
  all: { heading: "All publications" },
  read: { scholar: "Read on Google Scholar", other: "Read the paper" },
  undated: "Undated",
  empty: {
    title: "No papers are listed at present.",
    body: "Insights carries the firm's shorter analysis of energy markets and policy.",
    link: { label: "Read Insights", href: "/insights" },
  },
} as const;
