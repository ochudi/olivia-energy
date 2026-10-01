import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "./env";
import { raise } from "./errors";
import { getPublicSupabase } from "./public";
import { CACHE_TAGS, REVALIDATE_SECONDS } from "./tags";
import {
  parseSettings,
  type Post,
  type PostCategory,
  type PostSummary,
  type Publication,
  type Setting,
  type SiteSettings,
} from "./types";

/**
 * Public read layer. Every function runs through `unstable_cache` with the
 * tags in tags.ts, so pages that call them are statically rendered and
 * refreshed on demand (revalidate.ts) or after REVALIDATE_SECONDS.
 *
 * Reads use the anonymous client: RLS already limits posts to
 * status = published and published_at <= now(), so nothing unpublished can
 * leak even if a filter here is forgotten.
 *
 * Without NEXT_PUBLIC_SUPABASE_URL the functions return empty results (with
 * one warning) so the site still builds for design work; a configured but
 * unreachable database throws, which fails the build loudly.
 */

let warned = false;
function unconfigured(): boolean {
  if (isSupabaseConfigured()) return false;
  if (!warned) {
    warned = true;
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL is not set: content queries return nothing.",
    );
  }
  return true;
}

/**
 * Awaits a Supabase call and funnels both failure shapes through `raise`:
 * a returned `{ error }` (the common case) and a thrown network error, e.g.
 * `TypeError: fetch failed` when the database is unreachable. Every read
 * below goes through this rather than an inline `if (error) throw error`.
 */
async function safeAwait<T>(run: () => PromiseLike<T> | T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    return raise(error);
  }
}

const POST_SUMMARY_COLUMNS =
  "id, slug, title, excerpt, cover_path, category, tags, status, published_at, author_id, seo_title, seo_description, word_count, created_at, updated_at";

export type PublishedPostsOptions = {
  limit?: number;
  category?: PostCategory;
  tag?: string;
};

/** Published posts, newest first, without bodies. Tag: posts. */
export const getPublishedPosts = unstable_cache(
  async (options: PublishedPostsOptions = {}): Promise<PostSummary[]> => {
    if (unconfigured()) return [];
    let query = getPublicSupabase()
      .from("posts")
      .select(POST_SUMMARY_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (options.category) query = query.eq("category", options.category);
    if (options.tag) query = query.contains("tags", [options.tag]);
    if (options.limit) query = query.limit(options.limit);
    const { data, error } = await safeAwait(() => query);
    if (error) raise(error);
    return data;
  },
  ["posts"],
  { tags: [CACHE_TAGS.posts], revalidate: REVALIDATE_SECONDS },
);

export type Author = { id: string; name: string | null };
/** A post with its body and byline. */
export type Article = Post & { author: Author | null };

/** One published post with body and byline, or null. Tags: posts, post:[slug]. */
export function getPostBySlug(slug: string): Promise<Article | null> {
  return unstable_cache(
    async (): Promise<Article | null> => {
      if (unconfigured()) return null;
      const supabase = getPublicSupabase();
      const { data, error } = await safeAwait(() =>
        supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle(),
      );
      if (error) raise(error);
      if (!data) return null;
      let author: Author | null = null;
      if (data.author_id) {
        const authorId = data.author_id;
        const { data: row, error: authorError } = await safeAwait(() =>
          supabase
            .from("authors")
            .select("id, full_name")
            .eq("id", authorId)
            .maybeSingle(),
        );
        if (authorError) raise(authorError);
        if (row?.id) author = { id: row.id, name: row.full_name };
      }
      return { ...data, author };
    },
    ["post", slug],
    {
      tags: [CACHE_TAGS.posts, CACHE_TAGS.post(slug)],
      revalidate: REVALIDATE_SECONDS,
    },
  )();
}

/** Slugs of every published post (for generateStaticParams / sitemap). */
export const getPublishedPostSlugs = unstable_cache(
  async (): Promise<string[]> => {
    if (unconfigured()) return [];
    const { data, error } = await safeAwait(() =>
      getPublicSupabase()
        .from("posts")
        .select("slug")
        .eq("status", "published"),
    );
    if (error) raise(error);
    return data.map((row) => row.slug);
  },
  ["post-slugs"],
  { tags: [CACHE_TAGS.posts], revalidate: REVALIDATE_SECONDS },
);

/**
 * Up to `limit` other published posts for "More from Insights": the same
 * category first, then the newest of the rest. Derived from the cached
 * list, so it adds no request of its own.
 */
export async function getRelatedPosts(
  post: Pick<PostSummary, "slug" | "category">,
  limit = 3,
): Promise<PostSummary[]> {
  const all = (await getPublishedPosts()).filter((p) => p.slug !== post.slug);
  const same = all.filter((p) => p.category === post.category);
  const rest = all.filter((p) => p.category !== post.category);
  return [...same, ...rest].slice(0, limit);
}

/** All publications: featured first, then sort, then newest year. */
export const getPublications = unstable_cache(
  async (): Promise<Publication[]> => {
    if (unconfigured()) return [];
    const { data, error } = await safeAwait(() =>
      getPublicSupabase()
        .from("publications")
        .select("*")
        .order("featured", { ascending: false })
        .order("sort", { ascending: true })
        .order("year", { ascending: false, nullsFirst: false }),
    );
    if (error) raise(error);
    return data;
  },
  ["publications"],
  { tags: [CACHE_TAGS.publications], revalidate: REVALIDATE_SECONDS },
);

/** Raw settings rows. Tag: settings. */
const getSettingsRows = unstable_cache(
  async (): Promise<Pick<Setting, "key" | "value">[]> => {
    const { data, error } = await safeAwait(() =>
      getPublicSupabase().from("settings").select("key, value"),
    );
    if (error) raise(error);
    return data;
  },
  ["settings-rows"],
  { tags: [CACHE_TAGS.settings], revalidate: REVALIDATE_SECONDS },
);

/**
 * Site settings as one validated object with defaults. The rows are what
 * is cached; validation runs on every read, so a key added to the schema
 * gets its default even while the data cache still holds the old rows.
 */
export async function getSettings(): Promise<SiteSettings> {
  if (unconfigured()) return parseSettings([]);
  return parseSettings(await getSettingsRows());
}

/**
 * URL for a stored image. Accepts an object path inside the media bucket,
 * an absolute http(s) URL, or a site-relative path, and returns it ready
 * for <Image>.
 */
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  if (unconfigured()) return null;
  return getPublicSupabase().storage.from("media").getPublicUrl(path).data
    .publicUrl;
}
