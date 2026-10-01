import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CATEGORY_TOPICS, INSIGHTS } from "@/content/insights";
import {
  postCategoryLabel,
  type PostCategory,
  type PostSummary,
} from "@/lib/supabase/types";
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
 * the latest post set large, then the rest in a grid. A category page is
 * scoped throughout: it is headed by the category's name, features the
 * newest post in that category and lists only the others in it.
 */
export function InsightsArchive({ posts, active }: InsightsArchiveProps) {
  const counts: Partial<Record<PostCategory, number>> = {};
  for (const post of posts)
    counts[post.category] = (counts[post.category] ?? 0) + 1;
  const scoped = active
    ? posts.filter((post) => post.category === active)
    : posts;
  const featured = scoped[0] ?? null;
  const list = scoped.slice(1);
  const topics = active ? CATEGORY_TOPICS[active] : null;

  return (
    <>
      <section id="overview" className="border-line border-b">
        <Container className="py-section">
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow={INSIGHTS.eyebrow}
            title={active ? postCategoryLabel(active) : INSIGHTS.title}
            lede={
              topics
                ? `${topics.charAt(0).toUpperCase()}${topics.slice(1)}.`
                : INSIGHTS.lede
            }
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
                : !scoped.length
                  ? INSIGHTS.empty
                  : INSIGHTS.onlyOne}
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
