import { unstable_cache } from "next/cache";
import { MENTIONS, OPEDS } from "@/content/commentary";
import { typeset } from "@/lib/insights/text";
import type { Counts, InsightFormat, Mention, OpEd } from "@/types/contracts";
import {
  countCommentary,
  formatCountsFromRows,
  isJournal,
  JOURNAL_COUNT_FALLBACK,
  mentionsFromRows,
  opedsFromRows,
  staticCounts,
} from "./commentary-rows";
import { isSupabaseConfigured } from "./env";
import { raise } from "./errors";
import { getPublicSupabase } from "./public";
import { MEDIA_BUCKET } from "./schema";
import { CACHE_TAGS, REVALIDATE_SECONDS } from "./tags";
import {
  isPostFormat,
  isPublicationKind,
  parseSettings,
  type Post,
  type PostCategory,
  type PostFormat,
  type PostSummary,
  type Publication,
  type Setting,
  type SiteSettings,
  type Tables,
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
 *
 * The commentary reads (getOpEds, getLatestOpEd, getMentions,
 * getJournalArticles, getCommentaryCounts, getFormatCounts) are the
 * exception: they never throw. A query error (a missing column, PostgREST's
 * schema cache, the network), zero rows and an unconfigured Supabase all
 * give the static data in src/content/commentary.ts instead, so a database
 * that has not run the 2026-10-03 migration, or is down, never breaks a
 * page. A failure is not cached: the next request asks the database again.
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

/**
 * Typographic quotation marks in the text an editor typed into single-line
 * fields. Done here, once, so the cards, the article header, the social
 * card, the metadata and the structured data all read the same.
 */
function typesetPost<
  T extends Pick<
    PostSummary,
    "title" | "excerpt" | "seo_title" | "seo_description"
  >,
>(post: T): T {
  return {
    ...post,
    title: typeset(post.title),
    excerpt: post.excerpt && typeset(post.excerpt),
    seo_title: post.seo_title && typeset(post.seo_title),
    seo_description: post.seo_description && typeset(post.seo_description),
  };
}

const POST_SUMMARY_COLUMNS =
  "id, slug, title, excerpt, cover_path, category, tags, status, published_at, author_id, seo_title, seo_description, word_count, created_at, updated_at";
/** The same plus `format`, which exists only after the 2026-10-03 migration. */
const POST_SUMMARY_COLUMNS_WITH_FORMAT =
  "id, slug, title, excerpt, cover_path, category, tags, status, published_at, author_id, seo_title, seo_description, word_count, created_at, updated_at, format";

/** Keeps `format` only when it is one of the eight known formats. */
function withFormat<T extends { format?: string | null }>(
  row: T,
): Omit<T, "format"> & { format?: PostFormat | null } {
  const { format, ...rest } = row;
  return format === undefined
    ? rest
    : { ...rest, format: isPostFormat(format) ? format : null };
}

export type PublishedPostsOptions = {
  limit?: number;
  category?: PostCategory;
  tag?: string;
};

/** Published posts, newest first, without bodies. Tag: posts. */
export const getPublishedPosts = unstable_cache(
  async (options: PublishedPostsOptions = {}): Promise<PostSummary[]> => {
    if (unconfigured()) return [];
    const supabase = getPublicSupabase();
    // `format` is read when the column exists. A database that has not run
    // the 2026-10-03 migration answers with a column error: ask again
    // without it, so Insights keeps working until the migration is pasted.
    let withColumn = supabase
      .from("posts")
      .select(POST_SUMMARY_COLUMNS_WITH_FORMAT)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (options.category)
      withColumn = withColumn.eq("category", options.category);
    if (options.tag) withColumn = withColumn.contains("tags", [options.tag]);
    if (options.limit) withColumn = withColumn.limit(options.limit);
    const first = await safeAwait(() => withColumn);
    if (!first.error) return first.data.map(withFormat).map(typesetPost);
    if (!/format/i.test(first.error.message)) raise(first.error);

    let query = supabase
      .from("posts")
      .select(POST_SUMMARY_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (options.category) query = query.eq("category", options.category);
    if (options.tag) query = query.contains("tags", [options.tag]);
    if (options.limit) query = query.limit(options.limit);
    const { data, error } = await safeAwait(() => query);
    if (error) raise(error);
    return data.map(typesetPost);
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
      return { ...withFormat(typesetPost(data)), author };
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

/**
 * Every publication row, as the admin lists them: featured first, then
 * sort, then newest year. Journals, op-eds and mentions share the table
 * (`kind`), so the reads below filter this one cached list rather than
 * asking the database once per kind. `select *` on purpose: a database that
 * has not run the 2026-10-03 migration simply returns rows without the new
 * columns, and a missing `kind` means "journal". Tag: publications.
 */
const getPublicationRows = unstable_cache(
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
    return data.map((row: Tables<"publications">): Publication => ({
      ...row,
      kind: isPublicationKind(row.kind) ? row.kind : "journal",
    }));
  },
  ["publications"],
  { tags: [CACHE_TAGS.publications], revalidate: REVALIDATE_SECONDS },
);

/**
 * Journal articles: featured first, then sort, then newest year. Rows of
 * any other kind (op-eds, mentions) are not papers and are left out. Like
 * the rest of this layer it throws when a configured database is
 * unreachable; getJournalArticles is the version that never does.
 */
export async function getPublications(): Promise<Publication[]> {
  return (await getPublicationRows()).filter(isJournal);
}

/** Warns, once per failure, and says what the caller does instead. */
function degraded(what: string, error: unknown): void {
  const message =
    error instanceof Error ? error.message : String(error ?? "unknown error");
  console.warn(`[supabase] ${what} unavailable, using static data: ${message}`);
}

/** The publication rows, or null when they cannot be read. Never throws. */
async function softPublicationRows(): Promise<Publication[] | null> {
  try {
    return await getPublicationRows();
  } catch (error) {
    degraded("publications", error);
    return null;
  }
}

/** Journal articles (`kind` journal, or no `kind`). Empty, not an error, when they cannot be read. */
export async function getJournalArticles(): Promise<Publication[]> {
  return ((await softPublicationRows()) ?? []).filter(isJournal);
}

/**
 * The founder's op-eds, newest first: `kind = 'op-ed'` rows, or the static
 * OPEDS when the database has none or cannot be read. Never throws.
 */
export async function getOpEds(): Promise<OpEd[]> {
  const opeds = opedsFromRows((await softPublicationRows()) ?? []);
  return opeds.length > 0 ? opeds : [...OPEDS];
}

/** The newest op-ed. Never throws. */
export async function getLatestOpEd(): Promise<OpEd> {
  const [latest] = await getOpEds();
  return latest ?? OPEDS[0];
}

/**
 * BusinessDay reports that quote him, and any syndicated copy (flagged
 * `syndication`), newest first: `kind = 'mention'` rows, or the static
 * MENTIONS. Never throws.
 */
export async function getMentions(): Promise<Mention[]> {
  const mentions = mentionsFromRows((await softPublicationRows()) ?? []);
  return mentions.length > 0 ? mentions : [...MENTIONS];
}

/**
 * The counts the pages quote. `mentions` counts BusinessDay reports that are
 * not syndications. Falls back to the counts of the static data (nine
 * journal articles) as a whole when the database returns no rows at all.
 * Never throws.
 */
export async function getCommentaryCounts(): Promise<Counts> {
  const rows = await softPublicationRows();
  if (!rows || rows.length === 0) return staticCounts();
  const opeds = opedsFromRows(rows);
  const mentions = mentionsFromRows(rows);
  return countCommentary(
    opeds.length > 0 ? opeds : OPEDS,
    mentions.length > 0 ? mentions : MENTIONS,
    rows.filter(isJournal).length || JOURNAL_COUNT_FALLBACK,
  );
}

/** The `format` of every published post. Throws on any error; not cached on failure. Tag: posts. */
const getPostFormats = unstable_cache(
  async (): Promise<{ format: string | null }[]> => {
    if (unconfigured()) return [];
    const { data, error } = await safeAwait(() =>
      getPublicSupabase()
        .from("posts")
        .select("format")
        .eq("status", "published"),
    );
    if (error) raise(error);
    return data;
  },
  ["post-formats"],
  { tags: [CACHE_TAGS.posts], revalidate: REVALIDATE_SECONDS },
);

/**
 * Published posts per Insights format. `{}` when the `format` column does
 * not exist yet, when no post has a format, or when the database cannot be
 * read. Never throws.
 */
export async function getFormatCounts(): Promise<
  Partial<Record<InsightFormat, number>>
> {
  try {
    return formatCountsFromRows(await getPostFormats());
  } catch (error) {
    degraded("post formats", error);
    return {};
  }
}

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
  return getPublicSupabase().storage.from(MEDIA_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
