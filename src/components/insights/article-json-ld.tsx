import type { Article as ArticleSchema, WithContext } from "schema-dts";
import { JsonLd } from "@/components/seo/json-ld";
import { INSIGHTS } from "@/content/insights";
import { authorNode, breadcrumbList, schemaIds } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/urls";
import { getMediaUrl, type Article } from "@/lib/supabase/queries";
import { postCategoryLabel } from "@/lib/supabase/types";
import { articleByline } from "./byline";

/**
 * schema.org Article, pointing at the site's Organization and founder, and
 * the page's breadcrumb trail: Insights, the category, the article.
 */
export function ArticleJsonLd({ post, url }: { post: Article; url: string }) {
  const ids = schemaIds();
  const cover = getMediaUrl(post.cover_path);
  const data: WithContext<ArticleSchema> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    ...((post.seo_description ?? post.excerpt)
      ? { description: (post.seo_description ?? post.excerpt) as string }
      : {}),
    ...(cover
      ? { image: [cover.startsWith("http") ? cover : absoluteUrl(cover)] }
      : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    dateModified: post.updated_at,
    author: authorNode(articleByline(post)),
    publisher: { "@id": ids.organization },
    isPartOf: { "@id": ids.website },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    articleSection: postCategoryLabel(post.category),
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
    wordCount: post.word_count,
    inLanguage: "en-GB",
  };
  const trail = breadcrumbList([
    { name: INSIGHTS.eyebrow, path: "/insights" },
    {
      name: postCategoryLabel(post.category),
      path: `/insights/category/${post.category}`,
    },
    { name: post.title, path: `/insights/${post.slug}` },
  ]);
  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={trail} />
    </>
  );
}
