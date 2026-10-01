import type { Metadata, ResolvingMetadata } from "next";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";

export type PageMetadataInput = {
  /** Full title, under 60 characters; used as-is (no template suffix). */
  title: string;
  description: string;
  /** Site-relative path, the canonical URL of the page. */
  path: string;
};

type GenerateMetadata = (
  props: unknown,
  parent: ResolvingMetadata,
) => Promise<Metadata>;

/**
 * Builds a page's `generateMetadata`: title, description, canonical, Open
 * Graph and Twitter card. A page-level `openGraph` replaces the layout's
 * rather than merging with it, so the social images that the file
 * conventions (app/opengraph-image.tsx, twitter-image.tsx) attach to the
 * root layout are carried over from the resolved parent metadata.
 *
 *   export const generateMetadata = pageMetadata({ ...SEO.about, path: "/about" });
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): GenerateMetadata {
  return async (_props, parent) => {
    const resolved = await parent;
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: path },
      openGraph: {
        type: "website",
        siteName: SITE.name,
        locale: "en_US",
        title,
        description,
        url: path,
        images: resolved.openGraph?.images ?? [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: resolved.twitter?.images ?? [],
      },
    };
  };
}

/**
 * Article titles come from the editor. Keep the site suffix while the
 * whole line stays under 60 characters; otherwise use the title alone.
 */
export function articleTitle(title: string): Metadata["title"] {
  return title.length + SEO.suffix.length <= 60 ? title : { absolute: title };
}
