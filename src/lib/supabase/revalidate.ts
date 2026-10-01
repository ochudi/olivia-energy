import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./tags";

/**
 * Revalidation helpers for the public read layer. Call from a Server Action
 * or Route Handler after a write (the admin's save/publish actions, or a
 * database webhook). Each expires the matching `unstable_cache` tag at once
 * (`{ expire: 0 }`: no stale-while-revalidate window), so the next request
 * re-fetches. The site is edited rarely and correctness wins over the few
 * milliseconds a background refresh would save. See queries.ts for what
 * each tag covers.
 */

const NOW = { expire: 0 } as const;

/** All post lists, plus one article page when a slug is given. */
export function revalidatePosts(slug?: string): void {
  revalidateTag(CACHE_TAGS.posts, NOW);
  if (slug) revalidateTag(CACHE_TAGS.post(slug), NOW);
}

/** A single article page (use when only the body changed). */
export function revalidatePost(slug: string): void {
  revalidateTag(CACHE_TAGS.post(slug), NOW);
}

export function revalidatePublications(): void {
  revalidateTag(CACHE_TAGS.publications, NOW);
}

export function revalidateSettings(): void {
  revalidateTag(CACHE_TAGS.settings, NOW);
}

/** Everything the public site caches. */
export function revalidateAllContent(): void {
  revalidateTag(CACHE_TAGS.posts, NOW);
  revalidateTag(CACHE_TAGS.publications, NOW);
  revalidateTag(CACHE_TAGS.settings, NOW);
}
