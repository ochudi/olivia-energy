/**
 * Copy for every error and loading surface: the public 404s, the article
 * "not here" variant, the route/admin/global error boundaries, and the
 * shared loading label. Kept here — not in the components — so no page or
 * boundary holds its own prose. House voice: plain, short, institutional.
 * No "Oops", no jokes, no emoji, no exclamation marks.
 */
import { CONTACT } from "@/content/site";

export const NOT_FOUND = {
  eyebrow: "404",
  title: "That page is not here.",
  lede: "It may have moved, or the address may be wrong. Check the address, or start from one of the pages below.",
  actions: {
    home: "Back to the home page",
    insights: "Read Insights",
  },
  whereNext: {
    heading: "Where to next",
  },
} as const;

/**
 * One line per main page, shown in the 404 "Where to next" list. Kept here
 * rather than on NAV (src/content/site.ts) since NAV has no descriptions of
 * its own and nothing else on the site needs them.
 */
export const NOT_FOUND_LINKS: ReadonlyArray<{
  href: string;
  description: string;
}> = [
  {
    href: "/what-we-do",
    description: "Advisory across the energy value chain.",
  },
  {
    href: "/about",
    description:
      "An operating record in Nigeria’s downstream, and the practice today.",
  },
  {
    href: "/insights",
    description: "Analysis and briefings from the research desk.",
  },
  {
    href: "/publications",
    description: "Papers and published research.",
  },
  {
    href: "/contact",
    description: "Start a conversation about the decision in front of you.",
  },
];

export const ARTICLE_NOT_FOUND = {
  eyebrow: "Insights",
  title: "That article is not here.",
  lede: "It may be unpublished or have moved. Browse Insights for current analysis and briefings.",
  action: "All Insights",
  latest: "Latest from Insights",
} as const;

export const ROUTE_ERROR = {
  eyebrow: "Error",
  title: "Something went wrong on our side.",
  lede: `Try again. If the problem continues, write to us at ${CONTACT.email}.`,
  actions: {
    retry: "Try again",
    home: "Go to the home page",
  },
  reference: "Reference",
} as const;

export const ADMIN_ERROR = {
  title: "Something went wrong",
  lede: `The page failed to load. Try again, or return to the overview. If the problem continues, write to us at ${CONTACT.email}.`,
  actions: {
    retry: "Try again",
    home: "Back to overview",
  },
  reference: "Reference",
} as const;

export const GLOBAL_ERROR = {
  eyebrow: "Error",
  title: "Something went wrong on our side.",
  lede: `Reload the page, or try again. If the problem continues, write to us at ${CONTACT.email}.`,
  actions: {
    retry: "Try again",
    home: "Home",
  },
  reference: "Reference",
} as const;

export const LOADING = {
  label: "Loading…",
} as const;
