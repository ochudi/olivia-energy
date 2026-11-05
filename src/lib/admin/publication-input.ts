import { OPED_TOPICS } from "@/content/commentary";
import { isPublicationKind } from "@/lib/supabase/types";
import type { PublicationKind } from "@/types/contracts";
import { fieldsFor } from "./publication-fields";

/**
 * Reads and validates the publication form. Server side only (it knows the
 * topic list). Returns the row to write, split into the columns that have
 * always existed (`base`) and the ones the October update added (`extra`),
 * so the action can retry with `base` alone on an older database.
 */

export type PublicationBase = {
  title: string;
  authors: string[];
  venue: string | null;
  year: number | null;
  url: string | null;
  summary: string | null;
  featured: boolean;
};

export type PublicationExtra = {
  kind: PublicationKind;
  published_on: string | null;
  topics: string[];
  pull_quote: string | null;
  syndication: boolean;
};

export type ParsedPublication =
  | { ok: true; base: PublicationBase; extra: PublicationExtra }
  | { ok: false; errors: Record<string, string> };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The year of a real calendar date written YYYY-MM-DD, within the schema's 1900 to 2100. */
export function yearOfDate(value: string): number | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [year, month, day] = [match[1], match[2], match[3]].map(Number) as [
    number,
    number,
    number,
  ];
  const date = new Date(Date.UTC(year, month - 1, day));
  const real =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return real && year >= 1900 && year <= 2100 ? year : null;
}

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** The outlet an empty Outlet field implies, from the article's address. */
function outletFromUrl(url: string): string {
  try {
    return /(^|\.)businessday\.ng$/i.test(new URL(url).hostname)
      ? "BusinessDay"
      : "";
  } catch {
    return "";
  }
}

const TEXT_FIELDS = [
  "kind",
  "title",
  "authors",
  "venue",
  "year",
  "url",
  "summary",
  "published_on",
  "pull_quote",
] as const;

/**
 * The submitted values as strings, handed back so the form can show them
 * again after React resets it. Topics are joined with "|"; a ticked box is "on".
 */
export function formValues(data: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const key of TEXT_FIELDS) values[key] = text(data, key);
  values.topics = data
    .getAll("topics")
    .filter((t): t is string => typeof t === "string")
    .join("|");
  values.featured = data.get("featured") === "on" ? "on" : "";
  values.syndication = data.get("syndication") === "on" ? "on" : "";
  return values;
}

/** Validates the form's fields for the kind chosen. */
export function parsePublication(data: FormData): ParsedPublication {
  const errors: Record<string, string> = {};
  const rawKind = text(data, "kind") || "journal";
  if (!isPublicationKind(rawKind)) {
    return { ok: false, errors: { kind: "Choose one of the listed kinds." } };
  }
  const kind = rawKind;
  const shows = fieldsFor(kind);

  const title = text(data, "title");
  if (!title) errors.title = "Add a title.";
  else if (title.length > 300)
    errors.title = "Keep the title under 300 characters.";

  const authors = text(data, "authors")
    .split(/[;,]/)
    .map((a) => a.trim())
    .filter(Boolean);

  const venue = text(data, "venue");
  if (venue.length > 200) errors.venue = "Keep this under 200 characters.";

  const url = text(data, "url");
  if (url && !/^https?:\/\/.+/i.test(url))
    errors.url = "Must start with https://";
  else if (!url && shows.link.required) {
    errors.url = `Add the ${shows.link.label.toLowerCase()}.`;
  }

  const summary = text(data, "summary");
  if (summary.length > 1000)
    errors.summary = "Keep the summary under 1000 characters.";

  const publishedOn = text(data, "published_on");
  let dateYear: number | null = null;
  if (publishedOn) {
    dateYear = yearOfDate(publishedOn);
    if (dateYear === null)
      errors.published_on = "Use a real date, between 1900 and 2100.";
  } else if (shows.date.required) {
    errors.published_on = "Add the publication date.";
  }

  let year: number | null = null;
  if (shows.year) {
    const typed = text(data, "year");
    if (typed && !/^\d{4}$/.test(typed)) errors.year = "Four-digit year.";
    else if (typed) year = Number(typed);
  }
  // Commentary has no year field: the year is the date's. Others fall back to it when blank.
  if (year === null) year = dateYear;
  if (year !== null && (year < 1900 || year > 2100))
    errors.year = "Use a year between 1900 and 2100.";

  let topics: string[] = [];
  if (shows.topics) {
    const picked = data
      .getAll("topics")
      .filter((t): t is string => typeof t === "string");
    const known: readonly string[] = OPED_TOPICS;
    if (picked.some((t) => !known.includes(t)))
      errors.topics = "Pick topics from the list.";
    topics = OPED_TOPICS.filter((t) => picked.includes(t));
  }

  let pullQuote: string | null = null;
  if (shows.pullQuote) {
    const quote = text(data, "pull_quote");
    if (quote.length > 600)
      errors.pull_quote = "Keep the pull quote under 600 characters.";
    pullQuote = quote || null;
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    base: {
      title,
      authors,
      venue: venue || (kind === "op-ed" ? outletFromUrl(url) : "") || null,
      year,
      url: url || null,
      summary: summary || null,
      featured: shows.featured && data.get("featured") === "on",
    },
    extra: {
      kind,
      published_on: publishedOn || null,
      topics,
      pull_quote: pullQuote,
      syndication: shows.syndication && data.get("syndication") === "on",
    },
  };
}
