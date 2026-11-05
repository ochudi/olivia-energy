import { llmsText } from "@/lib/seo/llms";
import {
  getOpEds,
  getPublications,
  getPublishedPosts,
  getSettings,
} from "@/lib/supabase/queries";

/**
 * /llms.txt, built at deploy time and refreshed with the same cache tags as
 * the pages (posts, publications, settings), so a newly published article
 * appears here as it does in the sitemap.
 */
export const dynamic = "force-static";

export async function GET() {
  const [settings, posts, publications, opEds] = await Promise.all([
    getSettings(),
    getPublishedPosts(),
    getPublications(),
    getOpEds(),
  ]);
  return new Response(llmsText({ settings, posts, publications, opEds }), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
