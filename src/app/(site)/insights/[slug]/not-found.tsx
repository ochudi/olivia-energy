import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/insights";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ARTICLE_NOT_FOUND } from "@/content/errors";
import { getPublishedPosts } from "@/lib/supabase/queries";

/**
 * Article-specific 404: called when a slug under /insights/[slug] does not
 * resolve to a published post. Surfaces up to three latest articles instead
 * of leaving the reader at a dead end.
 */
export default async function NotFound() {
  const posts = await getPublishedPosts({ limit: 3 });

  return (
    <>
      <section className="border-line border-b">
        <Container className="py-section-lg">
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow={ARTICLE_NOT_FOUND.eyebrow}
            title={ARTICLE_NOT_FOUND.title}
            lede={ARTICLE_NOT_FOUND.lede}
          />
          <Button
            href="/insights"
            variant="ghost"
            icon={<ArrowRight />}
            className="mt-8"
          >
            {ARTICLE_NOT_FOUND.action}
          </Button>
        </Container>
      </section>

      {posts.length ? (
        <section
          aria-label={ARTICLE_NOT_FOUND.latest}
          className="py-section-sm"
        >
          <Container>
            <h2 className="font-display text-display-sm font-normal tracking-tight">
              {ARTICLE_NOT_FOUND.latest}
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostCard
                    post={post}
                    headingLevel="h2"
                    sizes="(min-width: 76rem) 357px, (min-width: 48rem) 30vw, calc(100vw - 40px)"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
