import { FOUNDER } from "@/content/about";
import type { Article } from "@/lib/supabase/queries";

/**
 * The name an article is credited to: the author's profile name, or the
 * founder while the profile has none (every article so far is his).
 */
export function articleByline(post: Pick<Article, "author">): string {
  return post.author?.name?.trim() || FOUNDER.name;
}
