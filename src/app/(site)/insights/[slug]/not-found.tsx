import { PostCard } from "@/components/insights";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { ARTICLE_NOT_FOUND } from "@/content/errors";
import { getPublishedPosts } from "@/lib/supabase/queries";

/**
 * Article-specific 404: called when a slug under /insights/[slug] does not
 * resolve to a published post. A paper hero in the Insights type, then up
 * to three of the latest articles on paper deep, so the reader is never at
 * a dead end.
 */
export default async function NotFound() {
  const posts = await getPublishedPosts({ limit: 3 });

  return (
    <>
      <Section surface="paper" hero="light" aria-labelledby="missing-title">
        <Container>
          <Eyebrow>{ARTICLE_NOT_FOUND.eyebrow}</Eyebrow>
          <Display as="h1" size="xl" id="missing-title" className="mt-6">
            {ARTICLE_NOT_FOUND.title}
          </Display>
          <Lede className="mt-6">{ARTICLE_NOT_FOUND.lede}</Lede>
          <Button href="/insights" arrow className="mt-10">
            {ARTICLE_NOT_FOUND.action}
          </Button>
        </Container>
      </Section>

      {posts.length ? (
        <Section surface="paper-deep" aria-labelledby="latest-title">
          <Container>
            <Display as="h2" size="lg" id="latest-title">
              {ARTICLE_NOT_FOUND.latest}
            </Display>
            <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
