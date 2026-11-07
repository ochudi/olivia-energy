/**
 * Copy for every error and loading surface: the public 404s, the article
 * "not here" variant, the route/admin/global error boundaries, and the
 * shared loading label. Kept here, not in the components, so no page or
 * boundary holds its own prose. House voice: plain, short, institutional.
 * No "Oops", no jokes, no emoji, no exclamation marks.
 */
import type { Cta } from "@/types/contracts";
import { CONTACT } from "@/content/site";

/** The 404 page: a green flood with an open ring. */
export const NOT_FOUND: {
  /** The status, as a line of text above the title. */
  code: string;
  title: string;
  lede: string;
  /** Pills under the lede. */
  links: readonly Cta[];
} = {
  code: "Error 404",
  title: "Page not found.",
  lede: "This is one gap we can close. Try one of these instead.",
  links: [
    { label: "Home", href: "/" },
    { label: "What we do", href: "/what-we-do" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ],
};

export const ARTICLE_NOT_FOUND = {
  title: "That article is not here.",
  lede: "It may be unpublished or have moved. Browse Insights for current analysis and commentary.",
  action: "All Insights",
  latest: "Latest from Insights",
} as const;

export const ROUTE_ERROR = {
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
