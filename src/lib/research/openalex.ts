import "server-only";
import { doiOf } from "./doi";

/**
 * Citation data from OpenAlex (https://openalex.org), an open index of
 * scholarly works. It is the one public, keyless source of per-paper
 * citation counts; Google Scholar has no API. Both reads are cached for a
 * day through the Data Cache and fail soft: a network problem hides the
 * numbers rather than the page.
 */
const BASE = "https://api.openalex.org";
const DAY = 60 * 60 * 24;

export type AuthorMetrics = {
  worksCount: number;
  citedByCount: number;
  hIndex: number;
  i10Index: number;
};

async function openalex<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { accept: "application/json" },
      next: { revalidate: DAY },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Works, citations, h-index and i10-index for an OpenAlex author id (A…). */
export async function getAuthorMetrics(
  authorId: string,
): Promise<AuthorMetrics | null> {
  if (!/^A\d+$/.test(authorId)) return null;
  const data = await openalex<{
    works_count?: number;
    cited_by_count?: number;
    summary_stats?: { h_index?: number; i10_index?: number };
  }>(`/authors/${authorId}?select=works_count,cited_by_count,summary_stats`);
  if (!data || typeof data.cited_by_count !== "number") return null;
  return {
    worksCount: data.works_count ?? 0,
    citedByCount: data.cited_by_count,
    hIndex: data.summary_stats?.h_index ?? 0,
    i10Index: data.summary_stats?.i10_index ?? 0,
  };
}

/** Citation count per DOI (lower-cased) for up to fifty DOIs. */
export async function getCitationCounts(
  dois: readonly string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const unique = [...new Set(dois.filter(Boolean))].slice(0, 50);
  if (!unique.length) return counts;
  const filter = unique.map((doi) => `https://doi.org/${doi}`).join("|");
  const data = await openalex<{
    results?: { doi?: string | null; cited_by_count?: number }[];
  }>(
    `/works?filter=doi:${encodeURIComponent(filter)}&per-page=50&select=doi,cited_by_count`,
  );
  for (const work of data?.results ?? []) {
    const doi = doiOf(work.doi);
    if (doi && typeof work.cited_by_count === "number")
      counts.set(doi, work.cited_by_count);
  }
  return counts;
}
