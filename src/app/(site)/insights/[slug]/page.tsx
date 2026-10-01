import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleByline } from "@/components/insights/byline";
import {
  ArticleFooter,
  ArticleHeader,
  ArticleJsonLd,
  MoreFromInsights,
  TiptapContent,
} from "@/components/insights";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { articleTitle } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/urls";
import {
  getPostBySlug,
  getPublishedPostSlugs,
  getRelatedPosts,
} from "@/lib/supabase/queries";
import { postBody, postCategoryLabel } from "@/lib/supabase/types";

type Params = Promise<{ slug: string }>;

/** Pre-render every published article; unknown slugs render on demand. */
export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post)
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? undefined;
  return {
    title: articleTitle(title),
    description,
    alternates: { canonical: `/insights/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/insights/${slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [articleByline(post)],
      section: postCategoryLabel(post.category),
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Article page. Rendered from the cached read layer (tags posts and
 * post:[slug]); the body is Tiptap JSON rendered on the server into <Prose>.
 * Header, body and footer share the narrow container, so they hang from one
 * left edge; the body keeps the reading measure (max-w-text) inside it.
 */
export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post);
  const url = absoluteUrl(`/insights/${slug}`);

  return (
    <>
      <article>
        <ArticleHeader post={post} />
        <Container size="narrow" className="py-section-sm">
          <Prose size="lg" className="max-w-text">
            <TiptapContent doc={postBody(post)} />
          </Prose>
        </Container>
        <ArticleFooter post={post} url={url} />
        <ArticleJsonLd post={post} url={url} />
      </article>
      <MoreFromInsights posts={related} />
    </>
  );
}
