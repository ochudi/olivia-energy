/**
 * Cache tags for the public read layer. Pages read through `unstable_cache`
 * with these tags (queries.ts); writers call the helpers in revalidate.ts.
 */
export const CACHE_TAGS = {
  posts: "posts",
  post: (slug: string) => `post:${slug}` as const,
  publications: "publications",
  settings: "settings",
} as const;

/** Time-based fallback so scheduled posts surface even without a tag purge. */
export const REVALIDATE_SECONDS = 3600;
