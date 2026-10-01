import { INSIGHTS } from "@/content/insights";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import { absoluteUrl } from "@/lib/seo/urls";
import { getPublishedPosts } from "@/lib/supabase/queries";
import { postCategoryLabel } from "@/lib/supabase/types";

/**
 * RSS 2.0 feed of the published articles, for feed readers and aggregators.
 * Built at deploy time and refreshed with the `posts` cache tag, like the
 * Insights pages; advertised on every page (see feedAlternate in
 * src/lib/seo/metadata.ts).
 */
export const dynamic = "force-static";

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET() {
  const posts = await getPublishedPosts();
  const self = absoluteUrl(SEO.feed.path);
  const items = posts.map((post) => {
    const url = absoluteUrl(`/insights/${post.slug}`);
    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      ...(post.published_at
        ? [
            `      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>`,
          ]
        : []),
      `      <category>${escapeXml(postCategoryLabel(post.category))}</category>`,
      ...(post.excerpt
        ? [`      <description>${escapeXml(post.excerpt)}</description>`]
        : []),
      "    </item>",
    ].join("\n");
  });
  const newest = posts[0]?.published_at;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(INSIGHTS.name)}</title>`,
    `    <link>${absoluteUrl("/insights")}</link>`,
    `    <atom:link href="${self}" rel="self" type="application/rss+xml" />`,
    `    <description>${escapeXml(SEO.insights.description)}</description>`,
    "    <language>en-gb</language>",
    `    <copyright>${escapeXml(SITE.name)}</copyright>`,
    ...(newest
      ? [`    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>`]
      : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
