import { InsightsArchive } from "@/components/insights";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublishedPosts } from "@/lib/supabase/queries";

export const generateMetadata = pageMetadata({
  ...SEO.insights,
  path: "/insights",
});

/**
 * Insights index: the latest article set large, the rest below. Fully
 * static — the category filter is a set of static routes of its own
 * (/insights/category/[category]), so this page reads no searchParams and
 * needs no per-request render.
 */
export default async function Page() {
  const posts = await getPublishedPosts();
  return <InsightsArchive posts={posts} active={null} />;
}
