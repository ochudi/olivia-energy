import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { INSIGHTS_PAGE } from "@/content/insights";
import type { PostSummary } from "@/lib/supabase/types";
import { PostCard } from "./post-card";
import { POST_GRID_CLASS, postGridCell } from "./post-grid";
import { cn } from "@/lib/utils/cn";

const STAGGER = 90;

/**
 * "More insights" (creative brief 4.5): three more articles, same category
 * first, then the newest, as the Insights grid's cards on paper deep.
 */
export function MoreFromInsights({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;
  return (
    <Section surface="paper-deep" id="more" aria-labelledby="more-title">
      <Container>
        <Display as="h2" size="lg" reveal="mask" id="more-title">
          {INSIGHTS_PAGE.article.more}
        </Display>
        <ul className={cn(POST_GRID_CLASS, "mt-10 lg:mt-12")}>
          {posts.map((post, i) => {
            const cell = postGridCell(i, posts.length);
            return (
              <Reveal
                key={post.slug}
                as="li"
                delay={(i % 3) * STAGGER}
                className={cell.className}
              >
                <PostCard post={post} lead={cell.lead} sizes={cell.sizes} />
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
