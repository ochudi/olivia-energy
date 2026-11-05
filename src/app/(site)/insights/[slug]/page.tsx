import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleByline } from "@/components/insights/byline";
import { CloseBand } from "@/components/blocks";
import { RelatedOpEds } from "@/components/sections/insights";
import {
  ArticleBody,
  ArticleFooter,
  ArticleHeader,
  ArticleJsonLd,
  AuthorCard,
  MoreFromInsights,
} from "@/components/insights";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import { articleTitle, feedAlternate } from "@/lib/seo/metadata";
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
    alternates: { canonical: `/insights/${slug}`, types: feedAlternate },
    openGraph: {
      type: "article",
      siteName: SITE.name,
      locale: "en_GB",
      title,
      description,
      url: `/insights/${slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [articleByline(post)],
      section: postCategoryLabel(post.category),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      site: SEO.twitterSite,
      title,
      description,
    },
  };
}

/**
 * Article page (creative brief 4.5). Rendered from the cached read layer
 * (tags posts and post:[slug]); the body is Tiptap JSON rendered on the
 * server. The header and cover run the page container's width; from 1024 px
 * the body, its footer and the author card sit in columns 4 to 11, so the
 * reading measure hangs off the cover's grid. Then "More insights", the
 * founder's op-eds on the article's topic (RelatedOpEds) and the red close.
 */
export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post);
  const url = absoluteUrl(`/insights/${slug}`);

  return (
    <>
      <Section surface="paper" hero="light" spacing="sm">
        <Container as="article">
          <ArticleHeader post={post} />
          <div className="mt-12 grid grid-cols-1 lg:mt-16 lg:grid-cols-12 lg:gap-x-6">
            <div className="lg:col-span-8 lg:col-start-4">
              <ArticleBody doc={postBody(post)} />
              <ArticleFooter post={post} url={url} className="mt-14" />
              <AuthorCard className="max-w-text mt-10" />
            </div>
          </div>
          <ArticleJsonLd post={post} url={url} />
        </Container>
      </Section>
      <MoreFromInsights posts={related} />
      <RelatedOpEds category={post.category} />
      <CloseBand variant="insights" />
    </>
  );
}
