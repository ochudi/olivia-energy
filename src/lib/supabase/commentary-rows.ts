import { MENTIONS, OPEDS, OPED_TOPICS } from "@/content/commentary";
import type {
  Counts,
  InsightFormat,
  Mention,
  OpEd,
  OpEdTopic,
} from "@/types/contracts";
import { isPostFormat, type Publication } from "./types";

/**
 * Pure mapping from `publications` and `posts` rows to the commentary
 * shapes in src/types/contracts.ts. No database access and no Next imports,
 * so it is tested without either (commentary-rows.test.ts). queries.ts does
 * the reading and the fallback; this file decides what a row means.
 *
 * A row that cannot be shown (no URL, no valid date, no title) is dropped
 * rather than rendered half-empty; when nothing usable is left, the caller
 * falls back to the static data in src/content/commentary.ts.
 */

/**
 * Journal articles on the site before the database answers: the nine in
 * supabase/seeds/publications.sql (2022 to 2025). Used for the count only,
 * and only when the database returned no publication rows at all.
 */
export const JOURNAL_COUNT_FALLBACK = 9;

type RowKind = Pick<Publication, "kind">;

/** A row with no `kind` (a database that has not run the migration) is a journal. */
export function isJournal(row: RowKind): boolean {
  return (row.kind ?? "journal") === "journal";
}

/** The last segment of the URL path, as a lower-case slug. "" for a URL with no path. */
export function slugFromUrl(url: string): string {
  let segments: string[];
  try {
    segments = new URL(url).pathname.split("/").filter(Boolean);
  } catch {
    return "";
  }
  let last = segments.at(-1) ?? "";
  try {
    last = decodeURIComponent(last);
  } catch {
    // keep the raw segment
  }
  return last
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Dated = { publishedOn: string; title: string; syndication?: boolean };

/** Newest first; on the same day, originals before syndicated copies, then by title. */
export function byNewest(a: Dated, b: Dated): number {
  return (
    b.publishedOn.localeCompare(a.publishedOn) ||
    Number(a.syndication ?? false) - Number(b.syndication ?? false) ||
    a.title.localeCompare(b.title)
  );
}

function usable(row: Publication): row is Publication & {
  url: string;
  published_on: string;
} {
  return (
    Boolean(row.title?.trim()) &&
    Boolean(row.url) &&
    typeof row.published_on === "string" &&
    ISO_DATE.test(row.published_on)
  );
}

const KNOWN_TOPICS: ReadonlySet<string> = new Set(OPED_TOPICS);

function topicsOf(row: Publication): OpEdTopic[] {
  return (row.topics ?? []).filter((t): t is OpEdTopic => KNOWN_TOPICS.has(t));
}

/** Op-eds from `kind = 'op-ed'` rows, newest first, slugs unique. */
export function opedsFromRows(rows: readonly Publication[]): OpEd[] {
  const seen = new Set<string>();
  const opeds: OpEd[] = [];
  for (const row of rows) {
    if (row.kind !== "op-ed" || !usable(row)) continue;
    const base = slugFromUrl(row.url);
    if (!base) continue;
    let slug = base;
    for (let n = 2; seen.has(slug); n += 1) slug = `${base}-${n}`;
    seen.add(slug);
    const pullQuote = row.pull_quote?.trim();
    opeds.push({
      slug,
      title: row.title,
      outlet: row.venue?.trim() || "BusinessDay",
      url: row.url,
      publishedOn: row.published_on,
      topics: topicsOf(row),
      summary: row.summary ?? "",
      ...(pullQuote ? { pullQuote } : {}),
    });
  }
  return opeds.sort(byNewest);
}

/** Mentions from `kind = 'mention'` rows, newest first. */
export function mentionsFromRows(rows: readonly Publication[]): Mention[] {
  const mentions: Mention[] = [];
  for (const row of rows) {
    if (row.kind !== "mention" || !usable(row)) continue;
    mentions.push({
      title: row.title,
      outlet: row.venue?.trim() || "",
      url: row.url,
      publishedOn: row.published_on,
      syndication: row.syndication === true,
    });
  }
  return mentions.sort(byNewest);
}

/** True for a BusinessDay report that is not a syndicated copy. */
function countsAsBusinessDayReport(mention: Mention): boolean {
  return !mention.syndication && /^businessday\b/i.test(mention.outlet.trim());
}

/** The counts the pages quote. `articles` is the number of journal articles. */
export function countCommentary(
  opeds: readonly OpEd[],
  mentions: readonly Mention[],
  articles: number,
): Counts {
  const dates = opeds.map((o) => o.publishedOn).sort();
  return {
    opeds: opeds.length,
    mentions: mentions.filter(countsAsBusinessDayReport).length,
    articles,
    firstOpEd: dates[0] ?? "",
    lastOpEd: dates.at(-1) ?? "",
  };
}

/** The counts of the static data: what the site says when the database cannot. */
export function staticCounts(): Counts {
  return countCommentary(OPEDS, MENTIONS, JOURNAL_COUNT_FALLBACK);
}

/** Published posts per format. Rows with no format, or an unknown one, are not counted. */
export function formatCountsFromRows(
  rows: readonly { format?: unknown }[],
): Partial<Record<InsightFormat, number>> {
  const counts: Partial<Record<InsightFormat, number>> = {};
  for (const { format } of rows) {
    if (!isPostFormat(format)) continue;
    counts[format] = (counts[format] ?? 0) + 1;
  }
  return counts;
}
