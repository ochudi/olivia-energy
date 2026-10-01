import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/urls";

/**
 * One group for every crawler, AI crawlers included (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended and the rest): a firm that wants to be
 * quoted lets itself be read. Do not add a group for a named bot without
 * repeating the disallows in it; a named group replaces this one for that
 * bot. See also /llms.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/styleguide"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
