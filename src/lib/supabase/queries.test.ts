import { beforeEach, describe, expect, it, vi } from "vitest";
import { MENTIONS, OPEDS } from "@/content/commentary";

/**
 * The commentary reads and the journal filter, against a stand-in for the
 * Supabase client. What matters here is the fallback: every kind of failure
 * and an empty answer must give the static data, never an exception.
 */

type Result = {
  data: unknown;
  error: { message: string; code?: string } | null;
};
type Responder = () => Result | Promise<Result>;

const state = vi.hoisted(() => ({
  configured: true,
  responders: {} as Record<string, Responder[]>,
}));

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));
vi.mock("./env", () => ({
  isSupabaseConfigured: () => state.configured,
  getPublicSupabaseEnv: () => ({ url: "http://127.0.0.1:54321", anonKey: "x" }),
}));
vi.mock("./public", () => ({
  getPublicSupabase: () => ({
    from: (table: string) => {
      const queue = state.responders[table] ?? [];
      const respond = queue.length > 1 ? queue.shift()! : queue[0];
      const builder: object = new Proxy(
        {},
        {
          get(_target, prop) {
            if (prop === "then") {
              return (
                resolve: (value: Result) => unknown,
                reject: (reason: unknown) => unknown,
              ) =>
                Promise.resolve()
                  .then(() => respond?.() ?? { data: [], error: null })
                  .then(resolve, reject);
            }
            return () => builder;
          },
        },
      );
      return builder;
    },
  }),
}));

import {
  getCommentaryCounts,
  getFormatCounts,
  getJournalArticles,
  getLatestOpEd,
  getMentions,
  getOpEds,
  getPublications,
  getPublishedPosts,
} from "./queries";

function respondWith(table: string, ...responders: Responder[]) {
  state.responders[table] = responders;
}
const rows =
  (data: unknown[]): Responder =>
  () => ({ data, error: null });
const failing =
  (message: string, code?: string): Responder =>
  () => ({
    data: null,
    error: { message, code },
  });

function pub(overrides: Record<string, unknown>) {
  return {
    id: "1",
    title: "A piece",
    authors: [],
    venue: "BusinessDay",
    year: 2026,
    url: "https://businessday.ng/opinion/article/a-piece/",
    summary: "Summary.",
    featured: false,
    sort: 0,
    created_at: "2026-10-03T00:00:00Z",
    updated_at: "2026-10-03T00:00:00Z",
    kind: "journal",
    published_on: null,
    topics: [],
    pull_quote: null,
    syndication: false,
    ...overrides,
  };
}

const dbOpEd = pub({
  id: "oped",
  kind: "op-ed",
  title: "From the database",
  url: "https://businessday.ng/opinion/article/from-the-database/",
  published_on: "2026-09-30",
  topics: ["Power"],
  pull_quote: "A line.",
});
const dbMention = pub({
  id: "mention",
  kind: "mention",
  title: "Quoted",
  url: "https://businessday.ng/business-economy/article/quoted/",
  published_on: "2026-09-01",
});
const dbSyndicated = pub({
  id: "copy",
  kind: "mention",
  title: "Quoted",
  venue: "Parrot Nigeria",
  url: "https://parrotnigeria.com/quoted/",
  published_on: "2026-09-01",
  syndication: true,
});
const dbJournal = pub({
  id: "journal",
  title: "A paper",
  url: "https://doi.org/x",
});

beforeEach(() => {
  state.configured = true;
  state.responders = {};
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("getOpEds", () => {
  it("returns the op-ed rows, newest first, mapped to OpEd", async () => {
    respondWith("publications", rows([dbJournal, dbMention, dbOpEd]));
    expect(await getOpEds()).toEqual([
      {
        slug: "from-the-database",
        title: "From the database",
        outlet: "BusinessDay",
        url: "https://businessday.ng/opinion/article/from-the-database/",
        publishedOn: "2026-09-30",
        topics: ["Power"],
        summary: "Summary.",
        pullQuote: "A line.",
      },
    ]);
    expect((await getLatestOpEd()).slug).toBe("from-the-database");
  });

  it("falls back to the static op-eds on a query error", async () => {
    respondWith(
      "publications",
      failing("column publications.kind does not exist", "42703"),
    );
    expect(await getOpEds()).toEqual(OPEDS);
    expect(await getLatestOpEd()).toEqual(OPEDS[0]);
  });

  it("falls back on a PostgREST schema cache error", async () => {
    respondWith(
      "publications",
      failing(
        "Could not find the 'kind' column of 'publications' in the schema cache",
        "PGRST204",
      ),
    );
    expect(await getOpEds()).toEqual(OPEDS);
  });

  it("falls back when the network fails", async () => {
    respondWith("publications", () => {
      throw new TypeError("fetch failed");
    });
    expect(await getOpEds()).toEqual(OPEDS);
    expect(await getMentions()).toEqual(MENTIONS);
    expect(await getCommentaryCounts()).toMatchObject({
      opeds: 11,
      mentions: 12,
      articles: 9,
    });
  });

  it("falls back on zero rows", async () => {
    respondWith("publications", rows([]));
    expect(await getOpEds()).toEqual(OPEDS);
  });

  it("falls back when the table has journals only (before the seed)", async () => {
    respondWith("publications", rows([dbJournal]));
    expect(await getOpEds()).toEqual(OPEDS);
    expect(await getMentions()).toEqual(MENTIONS);
  });

  it("falls back when Supabase is not configured", async () => {
    state.configured = false;
    expect(await getOpEds()).toEqual(OPEDS);
    expect(await getMentions()).toEqual(MENTIONS);
    expect(await getFormatCounts()).toEqual({});
    expect(await getJournalArticles()).toEqual([]);
  });
});

describe("getMentions", () => {
  it("returns mention rows with their syndication flag", async () => {
    respondWith("publications", rows([dbSyndicated, dbMention, dbOpEd]));
    const mentions = await getMentions();
    expect(mentions.map((m) => [m.outlet, m.syndication])).toEqual([
      ["BusinessDay", false],
      ["Parrot Nigeria", true],
    ]);
  });
});

describe("journal filter", () => {
  it("getPublications keeps journals and drops op-eds and mentions", async () => {
    respondWith("publications", rows([dbOpEd, dbJournal, dbMention]));
    expect((await getPublications()).map((p) => p.id)).toEqual(["journal"]);
    expect((await getJournalArticles()).map((p) => p.id)).toEqual(["journal"]);
  });

  it("treats rows without a kind column as journals (before the migration)", async () => {
    const old: Record<string, unknown> = { ...dbJournal };
    for (const column of [
      "kind",
      "published_on",
      "topics",
      "pull_quote",
      "syndication",
    ]) {
      delete old[column];
    }
    respondWith("publications", rows([old, { ...old, id: "second" }]));
    expect((await getPublications()).map((p) => p.id)).toEqual([
      "journal",
      "second",
    ]);
    expect(await getOpEds()).toEqual(OPEDS);
  });

  it("getPublications still throws on a query error, getJournalArticles does not", async () => {
    respondWith("publications", failing("boom"));
    await expect(getPublications()).rejects.toThrow("boom");
    expect(await getJournalArticles()).toEqual([]);
  });
});

describe("getCommentaryCounts", () => {
  it("counts BusinessDay reports and leaves the syndicated copy out", async () => {
    respondWith(
      "publications",
      rows([
        dbOpEd,
        dbMention,
        dbSyndicated,
        dbJournal,
        { ...dbJournal, id: "j2" },
      ]),
    );
    expect(await getCommentaryCounts()).toEqual({
      opeds: 1,
      mentions: 1,
      articles: 2,
      firstOpEd: "2026-09-30",
      lastOpEd: "2026-09-30",
    });
  });

  it("uses the static counts when there are no rows at all", async () => {
    respondWith("publications", rows([]));
    expect(await getCommentaryCounts()).toEqual({
      opeds: 11,
      mentions: 12,
      articles: 9,
      firstOpEd: "2025-06-23",
      lastOpEd: "2026-09-10",
    });
  });
});

describe("getFormatCounts", () => {
  it("counts published posts per format", async () => {
    respondWith(
      "posts",
      rows([
        { format: "policy-brief" },
        { format: "policy-brief" },
        { format: null },
      ]),
    );
    expect(await getFormatCounts()).toEqual({ "policy-brief": 2 });
  });

  it("is {} when the column is missing", async () => {
    respondWith(
      "posts",
      failing("column posts.format does not exist", "42703"),
    );
    expect(await getFormatCounts()).toEqual({});
  });
});

describe("getPublishedPosts", () => {
  const post = {
    id: "p",
    slug: "a-post",
    title: "A post",
    excerpt: null,
    cover_path: null,
    category: "power",
    tags: [],
    status: "published",
    published_at: "2026-09-01T00:00:00Z",
    author_id: null,
    seo_title: null,
    seo_description: null,
    word_count: 100,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  };

  it("carries a known format and nulls an unknown one", async () => {
    respondWith(
      "posts",
      rows([
        { ...post, format: "esg-insight" },
        { ...post, slug: "b", format: "zzz" },
      ]),
    );
    const posts = await getPublishedPosts();
    expect(posts.map((p) => p.format)).toEqual(["esg-insight", null]);
  });

  it("asks again without format when the column is missing", async () => {
    respondWith(
      "posts",
      failing("column posts.format does not exist", "42703"),
      rows([post]),
    );
    const posts = await getPublishedPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0]).not.toHaveProperty("format");
  });

  it("still throws on any other error", async () => {
    respondWith("posts", failing("permission denied"));
    await expect(getPublishedPosts()).rejects.toThrow("permission denied");
  });
});
