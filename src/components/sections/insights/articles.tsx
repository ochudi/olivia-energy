import { CategoryFilter } from "@/components/insights/category-filter";
import { PostCard } from "@/components/insights/post-card";
import { POST_GRID_CLASS, postGridCell } from "@/components/insights/post-grid";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { capitalise } from "@/lib/content/format";
import { cn } from "@/lib/utils/cn";
import { CATEGORY_TOPICS, INSIGHTS_PAGE } from "@/content/insights";
import {
  postCategoryLabel,
  type PostCategory,
  type PostSummary,
} from "@/lib/supabase/types";

export type ArticlesProps = {
  /** Published posts, newest first: the same cached list every route reads. */
  posts: PostSummary[];
  /** null on /insights; the category on /insights/category/[category]. */
  active: PostCategory | null;
};

/**
 * Articles, on the deep field: the heading,
 * the topic filter and a three-column grid of post cards. On /insights it
 * is the third section (H2 "Articles"). A category page opens with it as
 * its hero: the category label as the H1 and what the category covers as
 * the lede. Static.
 */
export function Articles({ posts, active }: ArticlesProps) {
  const copy = INSIGHTS_PAGE.articles;
  const counts: Partial<Record<PostCategory, number>> = {};
  for (const post of posts) {
    counts[post.category] = (counts[post.category] ?? 0) + 1;
  }
  const scoped = active
    ? posts.filter((post) => post.category === active)
    : posts;
  const isPage = active !== null;
  const headingId = isPage ? "category-title" : "articles-title";

  return (
    <Section
      surface="paper-deep"
      hero={isPage ? "light" : undefined}
      id="articles"
      aria-labelledby={headingId}
      className="scroll-mt-header"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-8">
            {isPage ? (
              <Display as="h1" size="xl" headline id={headingId}>
                {postCategoryLabel(active)}
              </Display>
            ) : (
              <Display as="h2" size="lg" id={headingId}>
                {copy.title}
              </Display>
            )}
            {isPage ? (
              <Lede className="mt-6">{`${capitalise(CATEGORY_TOPICS[active])}.`}</Lede>
            ) : null}
          </div>
        </div>
        <CategoryFilter
          active={active}
          counts={counts}
          total={posts.length}
          className="mt-10 lg:mt-12"
        />

        {scoped.length ? (
          <ul className={cn(POST_GRID_CLASS, "mt-10 lg:mt-12")}>
            {scoped.map((post, i) => {
              const cell = postGridCell(i, scoped.length);
              return (
                <li key={post.slug} className={cell.className}>
                  <PostCard
                    post={post}
                    headingLevel={isPage ? "h2" : "h3"}
                    lead={cell.lead}
                    sizes={cell.sizes}
                    showCategory={!isPage}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-ink-muted border-line mt-12 max-w-[42ch] border-t pt-6 text-lg">
            {copy.empty}
          </p>
        )}
      </Container>
    </Section>
  );
}
