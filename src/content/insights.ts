/**
 * Insights page copy. Articles themselves come from the database
 * (src/lib/supabase/queries.ts); this file holds only the page furniture.
 */
export const INSIGHTS = {
  /** The section's name, used in "More from Olivia Insights" and metadata. */
  name: "Olivia Insights",
  eyebrow: "Insights",
  title: "Notes from the research desk.",
  lede: "Short analysis of what is moving in Nigerian and US energy markets, and what the evidence says.",
  filterLabel: "Filter by category",
  allLabel: "All",
  empty: "Nothing published in this category yet.",
  onlyOne: "The latest article is above. More will follow.",
  more: "More from Olivia Insights",
} as const;
