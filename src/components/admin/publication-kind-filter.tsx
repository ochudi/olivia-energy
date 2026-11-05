import Link from "next/link";
import { LIST_FILTERS, type ListFilter } from "@/lib/admin/publication-fields";
import { cn } from "@/lib/utils/cn";

/** Filter links for the publications list, with the number of rows behind each. */
export function PublicationKindFilter({
  active,
  counts,
}: {
  active: ListFilter;
  counts: Record<ListFilter, number>;
}) {
  return (
    <nav aria-label="Filter by kind" className="mb-4">
      <ul className="flex gap-1 overflow-x-auto">
        {LIST_FILTERS.filter((f) => f.id === "all" || counts[f.id] > 0).map(
          (f) => {
            const current = f.id === active;
            return (
              <li key={f.id}>
                <Link
                  href={
                    f.id === "all"
                      ? "/admin/publications"
                      : `/admin/publications?kind=${f.id}`
                  }
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "duration-instant ease-standard focus-visible:ring-focus focus-visible:ring-offset-canvas flex h-9 items-center gap-2 rounded-xs px-3 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    current
                      ? "bg-surface-muted text-ink shadow-[inset_0_-2px_0_var(--color-primary)]"
                      : "text-ink-muted hover:text-ink hover:bg-surface-muted/60",
                  )}
                >
                  {f.label}
                  <span className="text-ink-subtle font-mono text-[0.6875rem] tabular-nums">
                    {counts[f.id]}
                  </span>
                </Link>
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}
