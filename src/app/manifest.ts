import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

/**
 * Web app manifest. Icons are generated from src/lib/brand/mark.ts by
 * scripts/brand-assets.mjs. Theme is the inverse green (green-950), the
 * background the page canvas (neutral-50). display "browser": a content
 * site, so no install prompt; "Add to Home Screen" still uses these icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "browser",
    theme_color: "#002210",
    background_color: "#faf7f3",
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
