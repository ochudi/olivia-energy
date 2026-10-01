import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/insights/post-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { LATEST_INSIGHTS } from "@/content/home";
import { getPublishedPosts } from "@/lib/supabase/queries";

/** Three columns inside the page container: (1136 − 2 × 32) / 3 ≈ 357px. */
const CARD_SIZES =
  "(min-width: 76rem) 357px, (min-width: 48rem) 30vw, calc(100vw - 40px)";

/**
 * Latest insights — the three most recent published posts from the cached
 * read layer (tag: posts). Renders nothing until a post exists.
 */
export async function LatestInsights() {
  const posts = await getPublishedPosts({ limit: 3 });
  if (posts.length === 0) return null;
  return (
    <section id="insights" className="border-line py-section border-t">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <Reveal>
            <SectionHeading
              number="03"
              eyebrow={LATEST_INSIGHTS.eyebrow}
              title={LATEST_INSIGHTS.title}
            />
          </Reveal>
          <Button
            variant="ghost"
            href={LATEST_INSIGHTS.link.href}
            icon={<ArrowRight />}
          >
            {LATEST_INSIGHTS.link.label}
          </Button>
        </div>
        <ul className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-3">
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
