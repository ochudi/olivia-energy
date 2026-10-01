/**
 * Canonical public origin, without a trailing slash. Read from
 * NEXT_PUBLIC_SITE_URL; on Vercel the project's production URL is the
 * fallback, and a production build without either fails rather than
 * baking localhost into canonicals, the sitemap and email links.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. Set it to the public origin (for example https://oliviaenergyandpower.com) before building for production.",
    );
  }
  return "http://localhost:3000";
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
