import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { CloseBand } from "@/components/blocks";
import { Articles, RelatedOpEds } from "@/components/sections/insights";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORY_TOPICS, INSIGHTS, INSIGHTS_PAGE } from "@/content/insights";
import { capitalise } from "@/lib/content/format";
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
    description: `${capitalise(topics)}. Analysis from ${INSIGHTS.name}.`,
    path: `/insights/category/${category}`,
  })(undefined, parent);
  // A category with nothing in it yet stays out of search results.
  const posts = await getPublishedPosts();
  return posts.some((post) => post.category === category)
    ? metadata
    : { ...metadata, robots: { index: false, follow: true } };
}

/**
 * One Insights category: the Articles
 * section as the page's hero, headed by the category label, over the same
 * cached, tagged post list /insights reads; then the founder's op-eds on
 * the category's topics (RelatedOpEds) and the red close. The
 * category is a fixed enum, so a segment outside it 404s rather than
 * rendering an empty page.
 */
export default async function Page({ params }: { params: Params }) {
  const { category } = await params;
  if (!isPostCategory(category)) notFound();

  const posts = await getPublishedPosts();
  return (
    <>
      <Articles posts={posts} active={category} />
      <RelatedOpEds category={category} />
      <CloseBand variant="insights" />
      <JsonLd
        data={breadcrumbList([
          { name: INSIGHTS_PAGE.article.breadcrumb, path: "/insights" },
          {
            name: postCategoryLabel(category),
            path: `/insights/category/${category}`,
          },
        ])}
      />
    </>
  );
}
