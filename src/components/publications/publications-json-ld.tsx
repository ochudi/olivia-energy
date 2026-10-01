import type { Graph, ScholarlyArticle } from "schema-dts";
import { JsonLd } from "@/components/seo/json-ld";
import { PUBLICATIONS } from "@/content/publications";
import { SITE } from "@/content/site";
import { schemaIds } from "@/lib/seo/json-ld";
import type { Publication } from "@/lib/supabase/types";

export type PublicationsJsonLdProps = {
  publications: readonly Publication[];
  /** Absolute URL of the page. */
  url: string;
};

/**
 * schema.org for the page: a CollectionPage about the founder (whose Person
 * node, with the Scholar profile as sameAs, is in the site-wide graph) and
 * one ScholarlyArticle per paper.
 */
export function PublicationsJsonLd({
  publications,
  url,
}: PublicationsJsonLdProps) {
  const ids = schemaIds();
  const articles: ScholarlyArticle[] = publications.map((p) => ({
    "@type": "ScholarlyArticle",
    "@id": `${url}#publication-${p.id}`,
    headline: p.title,
    name: p.title,
    ...(p.authors.length
      ? { author: p.authors.map((name) => ({ "@type": "Person", name })) }
      : {}),
    ...(p.year ? { datePublished: String(p.year) } : {}),
    ...(p.venue ? { isPartOf: { "@type": "Periodical", name: p.venue } } : {}),
    ...(p.url ? { url: p.url } : {}),
    ...(p.summary ? { description: p.summary } : {}),
    inLanguage: "en",
  }));
  const data: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: `${PUBLICATIONS.eyebrow} · ${SITE.name}`,
        description: PUBLICATIONS.description,
        about: { "@id": ids.founder },
        isPartOf: { "@id": ids.website },
        publisher: { "@id": ids.organization },
        hasPart: articles.map((a) => ({ "@id": a["@id"] as string })),
      },
      ...articles,
    ],
  };
  return <JsonLd data={data} />;
}
