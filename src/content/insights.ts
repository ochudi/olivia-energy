import type { PostCategory } from "@/lib/supabase/types";

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

/**
 * What each category covers, as a phrase. A category page uses it,
 * capitalised, as its lede and to open its search description
 * ("Fuel pricing, supply, … Analysis from Olivia Insights.").
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
