import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { InsightsArchive } from "@/components/insights";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORY_TOPICS, INSIGHTS } from "@/content/insights";
import { SITE } from "@/content/site";
import { breadcrumbList } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublishedPosts } from "@/lib/supabase/queries";
import {
  isPostCategory,
  POST_CATEGORIES,
  postCategoryLabel,
} from "@/lib/supabase/types";

type Params = Promise<{ category: string }>;

/** One static route per Insights category (POST_CATEGORY_LABELS). */
export async function generateStaticParams() {
  return POST_CATEGORIES.map((category) => ({ category }));
}
// The categories are a fixed list, so anything else is the site's ordinary
// 404 page rather than a render on demand.
export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { category } = await params;
  if (!isPostCategory(category)) return {};
  const label = postCategoryLabel(category);
  const topics = CATEGORY_TOPICS[category];
  const metadata = await pageMetadata({
    title: `${label} | Insights | ${SITE.name}`,
    description: `${topics.charAt(0).toUpperCase()}${topics.slice(1)}. Analysis from Olivia Insights.`,
    path: `/insights/category/${category}`,
  })(undefined, parent);
  // A category with nothing in it yet stays out of search results.
  const posts = await getPublishedPosts();
  return posts.some((post) => post.category === category)
    ? metadata
    : { ...metadata, robots: { index: false, follow: true } };
}

/**
 * One Insights category: the same cached, tagged post list /insights reads,
 * scoped to this category (heading, featured post and grid). The category
 * is a fixed enum, so a segment outside it 404s rather than rendering an
 * empty page.
 */
export default async function Page({ params }: { params: Params }) {
  const { category } = await params;
  if (!isPostCategory(category)) notFound();

  const posts = await getPublishedPosts();
  return (
    <>
      <InsightsArchive posts={posts} active={category} />
      <JsonLd
        data={breadcrumbList([
          { name: INSIGHTS.eyebrow, path: "/insights" },
          {
            name: postCategoryLabel(category),
            path: `/insights/category/${category}`,
          },
        ])}
      />
    </>
  );
}
