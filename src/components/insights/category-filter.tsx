import Link from "next/link";
import { INSIGHTS_PAGE } from "@/content/insights";
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
  className?: string;
};

/**
 * The topic filter as a row of chips: "All
 * topics" and each category that has articles. Each chip is a static
 * route (/insights or /insights/category/[category]), so a change is a
 * server-rendered navigation with nothing fetched on the client. A small
 * client child (ChipPendingMarker) flags the chip that is navigating so the
 * row can dim itself while the next page loads. On phones the row scrolls
 * sideways inside the gutter rather than wrapping into a block.
 */
export function CategoryFilter({
  active,
  counts,
  total,
  className,
}: CategoryFilterProps) {
  const copy = INSIGHTS_PAGE.articles;
  const first = {
    href: "/insights#articles",
    label: copy.allTopics,
    on: active === null,
    count: total,
  };
  // Every category with articles, and the one being viewed even when it
  // has none; the one being viewed comes straight after "All topics", so it
  // is in view on a phone without scrolling the row.
  const categories = POST_CATEGORIES.map((category) => ({
    href: `/insights/category/${category}`,
    label: postCategoryLabel(category),
    on: active === category,
    count: counts[category] ?? 0,
  })).filter((item) => item.on || item.count > 0);
  const items = [
    first,
    ...categories.filter((item) => item.on),
    ...categories.filter((item) => !item.on),
  ];

  return (
    <nav
      aria-label={copy.filterLabel}
      className={cn(
        // Phones: the rail scrolls sideways, so its right edge fades out
        // as a cue that more chips follow.
        "after:-right-gutter after:from-canvas relative after:pointer-events-none after:absolute after:inset-y-0 after:w-6 after:bg-linear-to-l after:to-transparent md:after:hidden",
        className,
      )}
    >
      <ul className="-mx-gutter px-gutter duration-fast flex [scrollbar-width:none] flex-nowrap gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,#000_calc(100%-4.5rem),transparent)] pr-12 transition-opacity has-data-[pending=true]:opacity-60 md:mx-0 md:flex-wrap md:overflow-visible md:[mask-image:none] md:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.on ? "page" : undefined}
              className={cn(
                "rounded-pill tap duration-fast ease-standard focus-visible:ring-focus focus-visible:ring-offset-canvas inline-flex h-10 items-center gap-2 border px-4 font-sans text-xs font-medium whitespace-nowrap transition-[border-color,background-color,color] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                item.on
                  ? "bg-ink text-canvas border-transparent"
                  : "border-line-strong text-ink hover:border-ink hover:bg-ink/[0.06]",
              )}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={cn(
                  "numerals font-normal tracking-normal",
                  item.on ? "text-canvas/70" : "text-ink-muted",
                )}
              >
                {item.count}
              </span>
              <span className="sr-only">
                {`, ${item.count} ${item.count === 1 ? "article" : "articles"}`}
              </span>
              <ChipPendingMarker />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
