import type { Publication } from "@/lib/supabase/types";

export type YearGroup = { year: number | null; items: Publication[] };

/**
 * Groups publications by year, newest year first and undated last. Order
 * inside a group is the order given (featured first, then the admin's sort).
 */
export function groupByYear(publications: readonly Publication[]): YearGroup[] {
  const map = new Map<number | null, Publication[]>();
  for (const publication of publications) {
    const list = map.get(publication.year) ?? [];
    list.push(publication);
    map.set(publication.year, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : b - a))
    .map(([year, items]) => ({ year, items }));
}
