import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { INSIGHTS } from "@/content/insights";
import type { PostSummary } from "@/lib/supabase/types";
import { PostCard } from "./post-card";

/** Three columns inside the page container: (1136 − 2 × 32) / 3 ≈ 357px. */
const CARD_SIZES =
  "(min-width: 76rem) 357px, (min-width: 48rem) 30vw, calc(100vw - 40px)";

/** Three more articles: same category first, then the newest. */
export function MoreFromInsights({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;
  return (
    <section
      id="more"
      aria-label={INSIGHTS.more}
      className="border-line py-section border-t"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <Reveal>
            <SectionHeading
              eyebrow={INSIGHTS.more}
              title="Keep reading."
              size="sm"
            />
          </Reveal>
          <Button variant="ghost" href="/insights" icon={<ArrowRight />}>
            All insights
          </Button>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} sizes={CARD_SIZES} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
