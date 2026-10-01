import type { Graph, ScholarlyArticle } from "schema-dts";
import { JsonLd } from "@/components/seo/json-ld";
import { PUBLICATIONS } from "@/content/publications";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import { isFounderName, schemaIds } from "@/lib/seo/json-ld";
import type { Publication } from "@/lib/supabase/types";

export type PublicationsJsonLdProps = {
  publications: readonly Publication[];
  /** Absolute URL of the page. */
  url: string;
};

/**
 * schema.org for the page: a CollectionPage about the founder (whose Person
 * node, with his scholarly profiles as sameAs, is in the site-wide graph)
 * and one ScholarlyArticle per paper. A paper's @id is its DOI URL where it
 * has one (the identifier Crossref and OpenAlex use), and the founder's byline on it points at his Person node, so the
 * papers attach to him rather than to a name.
 */
export function PublicationsJsonLd({
  publications,
  url,
}: PublicationsJsonLdProps) {
  const ids = schemaIds();
  const articles: ScholarlyArticle[] = publications.map((p) => {
    const doi = p.url?.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/)?.[1];
    return {
      "@type": "ScholarlyArticle",
      "@id": doi ? `https://doi.org/${doi}` : `${url}#publication-${p.id}`,
      headline: p.title,
      name: p.title,
      ...(p.authors.length
        ? {
            author: p.authors.map((name) => ({
              "@type": "Person" as const,
              ...(isFounderName(name) ? { "@id": ids.founder } : {}),
              name,
            })),
          }
        : {}),
      ...(doi
        ? {
            identifier: {
              "@type": "PropertyValue" as const,
              propertyID: "DOI",
              value: doi,
            },
          }
        : {}),
      ...(p.year ? { datePublished: String(p.year) } : {}),
      ...(p.venue
        ? { isPartOf: { "@type": "Periodical", name: p.venue } }
        : {}),
      ...(p.url ? { url: p.url } : {}),
      ...(p.summary ? { description: p.summary } : {}),
      inLanguage: "en",
    };
  });
  const data: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: `${PUBLICATIONS.eyebrow} · ${SITE.name}`,
        description: SEO.publications.description,
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
