import type { Publication } from "@/lib/supabase/types";
import type { PublicationKind } from "@/types/contracts";

/**
 * Pure helpers shared by the publication form (client) and the actions
 * (server): which fields a kind uses, how the fallback detects a database
 * that has not run the October update. No content imports, so the form can
 * use it without pulling the commentary data into the browser.
 */

/** Shown when the database lacks the columns added by the October update. */
export const FALLBACK_MESSAGE =
  "Saved without the new fields. Paste the October database update first.";

/** Postgres 42703 (undefined column) and PostgREST PGRST204 (column not in the schema cache). */
export function isMissingColumnError(
  error: { code?: string | null } | null | undefined,
): boolean {
  return error?.code === "42703" || error?.code === "PGRST204";
}

/** Op-eds and mentions are the commentary the site lists by date. */
export function isCommentaryKind(kind: PublicationKind): boolean {
  return kind === "op-ed" || kind === "mention";
}

export type KindFields = {
  /** Labels and hints that change with the kind. */
  authors: { label: string; hint: string };
  venue: { label: string; hint: string };
  link: { label: string; hint: string; placeholder: string; required: boolean };
  date: { label: string; required: boolean };
  /** Year is typed for journals, reports and talks, derived from the date for commentary. */
  year: boolean;
  topics: boolean;
  pullQuote: boolean;
  syndication: boolean;
  featured: boolean;
};

const DATED: Pick<KindFields, "year" | "featured"> = {
  year: true,
  featured: true,
};

/** What each kind shows. A hidden field is never submitted and is cleared on save. */
export function fieldsFor(kind: PublicationKind): KindFields {
  switch (kind) {
    case "op-ed":
      return {
        authors: {
          label: "Author",
          hint: "As named in the piece. Leave empty if it is the founder.",
        },
        venue: {
          label: "Outlet",
          hint: "The newspaper or site that printed it, for example BusinessDay.",
        },
        link: {
          label: "Article link",
          hint: "The page on the outlet's site. The op-ed's address on this site comes from it.",
          placeholder: "https://businessday.ng/…",
          required: true,
        },
        date: { label: "Publication date", required: true },
        year: false,
        topics: true,
        pullQuote: true,
        syndication: false,
        featured: false,
      };
    case "mention":
      return {
        authors: {
          label: "Reporter",
          hint: "The byline of the report that names him.",
        },
        venue: {
          label: "Outlet",
          hint: "The publication that ran the report.",
        },
        link: {
          label: "Report link",
          hint: "The page on the outlet's site.",
          placeholder: "https://businessday.ng/…",
          required: true,
        },
        date: { label: "Publication date", required: true },
        year: false,
        topics: true,
        pullQuote: true,
        syndication: true,
        featured: false,
      };
    case "report":
      return {
        authors: {
          label: "Authors",
          hint: "Comma-separated, in citation order.",
        },
        venue: { label: "Publisher", hint: "The organisation that issued it." },
        link: {
          label: "Link",
          hint: "The report's page or a DOI. Opens in a new tab on the site.",
          placeholder: "https://…",
          required: false,
        },
        date: { label: "Publication date", required: false },
        topics: false,
        pullQuote: false,
        syndication: false,
        ...DATED,
      };
    case "talk":
      return {
        authors: {
          label: "Speakers",
          hint: "Comma-separated.",
        },
        venue: {
          label: "Event",
          hint: "The conference, webinar or programme.",
        },
        link: {
          label: "Link",
          hint: "A recording or event page. Opens in a new tab on the site.",
          placeholder: "https://…",
          required: false,
        },
        date: { label: "Date of the talk", required: false },
        topics: false,
        pullQuote: false,
        syndication: false,
        ...DATED,
      };
    default:
      return {
        authors: {
          label: "Authors",
          hint: "Comma-separated, in citation order.",
        },
        venue: { label: "Venue", hint: "Journal, publisher or conference." },
        link: {
          label: "Link",
          hint: "Google Scholar or DOI. Opens in a new tab on the site.",
          placeholder: "https://doi.org/…",
          required: false,
        },
        date: { label: "Publication date", required: false },
        topics: false,
        pullQuote: false,
        syndication: false,
        ...DATED,
      };
  }
}

/** The list's filter: every row, one kind, or the kinds without a tab of their own. */
export const LIST_FILTERS = [
  { id: "all", label: "All" },
  { id: "journal", label: "Journal articles" },
  { id: "op-ed", label: "Op-eds" },
  { id: "mention", label: "Mentions" },
  { id: "other", label: "Reports and talks" },
] as const;

export type ListFilter = (typeof LIST_FILTERS)[number]["id"];

export function parseListFilter(value: string | undefined): ListFilter {
  return LIST_FILTERS.find((f) => f.id === value)?.id ?? "all";
}

/** A row's kind; a database without the column has only journals. */
export function kindOf(row: Pick<Publication, "kind">): PublicationKind {
  const kind = row.kind;
  return kind === "op-ed" ||
    kind === "mention" ||
    kind === "report" ||
    kind === "talk"
    ? kind
    : "journal";
}

function inFilter(kind: PublicationKind, filter: ListFilter): boolean {
  if (filter === "all") return true;
  if (filter === "other") return kind === "report" || kind === "talk";
  return kind === filter;
}

const KIND_ORDER: Record<PublicationKind, number> = {
  journal: 0,
  "op-ed": 1,
  mention: 2,
  report: 3,
  talk: 4,
};

/**
 * Rows for the admin list. Journals keep the order the editor set (sort,
 * then year, newest first); every other kind goes newest first by publication
 * date, undated rows last. Kinds are grouped when the filter is "all".
 */
export function listRows<T extends Publication>(
  rows: readonly T[],
  filter: ListFilter,
): T[] {
  const dated = (row: T) => row.published_on ?? "";
  return rows
    .map((row, index) => ({ row, index, kind: kindOf(row) }))
    .filter(({ kind }) => inFilter(kind, filter))
    .sort((a, b) => {
      if (a.kind !== b.kind) return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      if (a.kind === "journal") return a.index - b.index;
      return (
        dated(b.row).localeCompare(dated(a.row)) ||
        a.row.title.localeCompare(b.row.title)
      );
    })
    .map(({ row }) => row);
}

/** How many rows each filter shows. */
export function listCounts(
  rows: readonly Pick<Publication, "kind">[],
): Record<ListFilter, number> {
  const counts: Record<ListFilter, number> = {
    all: rows.length,
    journal: 0,
    "op-ed": 0,
    mention: 0,
    other: 0,
  };
  for (const row of rows) {
    const kind = kindOf(row);
    if (kind === "journal") counts.journal += 1;
    else if (kind === "op-ed") counts["op-ed"] += 1;
    else if (kind === "mention") counts.mention += 1;
    else counts.other += 1;
  }
  return counts;
}
