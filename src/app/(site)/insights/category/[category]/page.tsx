import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { InsightsArchive } from "@/components/insights";
import { SITE } from "@/content/site";
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
export const dynamicParams = true;

export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { category } = await params;
  if (!isPostCategory(category)) return {};
  const label = postCategoryLabel(category);
  return pageMetadata({
    title: `${label} | Insights | ${SITE.name}`,
    description: `${label} articles from Olivia Insights: analysis and briefings on energy markets in the United States and Nigeria.`,
    path: `/insights/category/${category}`,
  })(undefined, parent);
}

/**
 * One Insights category: the same cached, tagged post list /insights reads,
 * filtered to this category. Layout and the featured-post treatment are
 * identical to the index — only the active chip and the grid below it
 * change. The category is a fixed enum, so a segment outside it 404s
 * rather than rendering an empty page.
 */
export default async function Page({ params }: { params: Params }) {
  const { category } = await params;
  if (!isPostCategory(category)) notFound();

  const posts = await getPublishedPosts();
  return <InsightsArchive posts={posts} active={category} />;
}
