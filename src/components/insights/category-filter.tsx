import Link from "next/link";
import { INSIGHTS } from "@/content/insights";
import {
  POST_CATEGORIES,
  postCategoryLabel,
  type PostCategory,
} from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { ChipPendingMarker } from "./category-filter-pending";

export type CategoryFilterProps = {
  active: PostCategory | null;
  counts: Partial<Record<PostCategory, number>>;
  total: number;
};

/**
 * Category filter as plain links: each chip is a static route
 * (/insights or /insights/category/[category]), so a filter change is a
 * server-rendered navigation with nothing fetched on the client. A small
 * client child (ChipPendingMarker) reports whichever chip is currently
 * navigating so the list can dim itself while the next page loads.
 */
export function CategoryFilter({ active, counts, total }: CategoryFilterProps) {
  const items = [
    {
      href: "/insights",
      label: INSIGHTS.allLabel,
      on: active === null,
      count: total,
    },
    ...POST_CATEGORIES.map((category) => ({
      href: `/insights/category/${category}`,
      label: postCategoryLabel(category),
      on: active === category,
      count: counts[category] ?? 0,
    })),
    // "All" always shows; every other chip hides once its count is zero.
  ].filter((item) => item.href === "/insights" || item.count > 0);

  return (
    <nav aria-label={INSIGHTS.filterLabel}>
      <ul
        key={active ?? "all"}
        className="animate-page-enter -mx-gutter px-gutter duration-fast flex [scrollbar-width:none] flex-nowrap gap-2 overflow-x-auto transition-opacity has-data-[pending=true]:opacity-60 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              scroll={false}
              aria-current={item.on ? "true" : undefined}
              className={cn(
                "duration-fast ease-standard active:duration-instant focus-visible:ring-focus focus-visible:ring-offset-canvas inline-flex h-8 items-center gap-2 rounded-xs border px-3 font-sans text-xs font-medium tracking-[0.1em] whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                item.on
                  ? "border-ink bg-ink text-canvas"
                  : "border-line-strong text-ink-muted hover:border-ink hover:text-ink active:bg-ink/[0.06]",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "font-mono tracking-normal tabular-nums",
                  item.on ? "text-canvas/70" : "text-ink-subtle",
                )}
              >
                {item.count}
              </span>
              <ChipPendingMarker />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
