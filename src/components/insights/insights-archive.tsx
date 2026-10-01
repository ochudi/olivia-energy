import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { INSIGHTS } from "@/content/insights";
import type { PostCategory, PostSummary } from "@/lib/supabase/types";
import { CategoryFilter } from "./category-filter";
import { FeaturedPost } from "./featured-post";
import { PostCard } from "./post-card";

export type InsightsArchiveProps = {
  /** Published posts, newest first: the same cached list every route reads. */
  posts: PostSummary[];
  /** null on /insights; a category on /insights/category/[category]. */
  active: PostCategory | null;
};

/**
 * Body shared by the Insights index and its category archives: heading,
 * the latest post set large, then the category-filtered grid. The featured
 * post is always the newest post overall — on a category page it can also
 * reappear in the grid below when it belongs to that category, exactly as
 * the old `?category=` filter behaved.
 */
export function InsightsArchive({ posts, active }: InsightsArchiveProps) {
  const featured = posts[0] ?? null;
  const counts: Partial<Record<PostCategory, number>> = {};
  for (const post of posts)
    counts[post.category] = (counts[post.category] ?? 0) + 1;
  const list: PostSummary[] = posts.filter((post) =>
    active ? post.category === active : post.slug !== featured?.slug,
  );

  return (
    <>
      <section id="overview" className="border-line border-b">
        <Container className="py-section">
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow={INSIGHTS.eyebrow}
            title={INSIGHTS.title}
            lede={INSIGHTS.lede}
          />
        </Container>
      </section>
      {featured ? <FeaturedPost post={featured} /> : null}
      <section
        id="articles"
        aria-label="Articles"
        className="scroll-mt-header py-section-sm"
      >
        <Container>
          <CategoryFilter
            active={active}
            counts={counts}
            total={posts.length}
          />
          {list.length ? (
            <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
              {list.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} headingLevel="h2" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted border-line mt-10 border-t pt-6 text-base">
              {!posts.length
                ? "No articles have been published yet."
                : active
                  ? INSIGHTS.empty
                  : INSIGHTS.onlyOne}
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
