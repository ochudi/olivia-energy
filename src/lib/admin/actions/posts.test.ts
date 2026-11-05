import { beforeEach, describe, expect, it, vi } from "vitest";

type Result = {
  data?: unknown;
  error: { code?: string; message: string } | null;
};

const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  revalidatePosts: vi.fn(),
  revalidatePath: vi.fn(),
  updates: [] as unknown[],
  results: [] as unknown[],
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/admin/auth", () => ({ assertAdmin: mocks.assertAdmin }));
vi.mock("@/lib/supabase/revalidate", () => ({
  revalidatePosts: mocks.revalidatePosts,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { slug: "an-article", status: "published" },
          }),
        }),
      }),
      update: (row: unknown) => {
        mocks.updates.push(row);
        return {
          eq: () => ({
            select: () => ({
              single: async () => mocks.results.shift() as Result,
            }),
          }),
        };
      },
    }),
  }),
}));

import { savePost, type PostInput } from "./posts";

const SAVED = {
  data: {
    slug: "an-article",
    status: "published",
    published_at: "2026-10-01T00:00:00Z",
  },
  error: null,
};

const INPUT: PostInput = {
  title: "An article",
  slug: "an-article",
  excerpt: "",
  category: "research-notes",
  tags: [],
  cover_path: null,
  seo_title: "",
  seo_description: "",
  body: { type: "doc", content: [] },
};

beforeEach(() => {
  mocks.updates.length = 0;
  mocks.results.length = 0;
  mocks.assertAdmin.mockResolvedValue({ userId: "me" });
});

describe("savePost: format", () => {
  it("saves a known format", async () => {
    mocks.results.push(SAVED);
    const result = await savePost(
      "id",
      { ...INPUT, format: "policy-brief" },
      "save",
    );
    expect(result).toMatchObject({ ok: true, message: "Saved." });
    expect(mocks.updates[0]).toMatchObject({ format: "policy-brief" });
    expect(mocks.revalidatePosts).toHaveBeenCalledWith("an-article");
  });

  it("saves null for none", async () => {
    mocks.results.push(SAVED);
    await savePost("id", { ...INPUT, format: "" }, "save");
    expect(mocks.updates[0]).toHaveProperty("format", null);
  });

  it("leaves the stored format alone when the caller sends none", async () => {
    mocks.results.push(SAVED);
    await savePost("id", INPUT, "save");
    expect(mocks.updates[0]).not.toHaveProperty("format");
  });

  it("rejects a format that is not one of the eight", async () => {
    const result = await savePost(
      "id",
      { ...INPUT, format: "newsletter" },
      "save",
    );
    expect(result).toMatchObject({
      ok: false,
      errors: { format: "Choose one of the listed formats." },
    });
    expect(mocks.updates).toHaveLength(0);
  });

  it("retries once without the format when the column is missing", async () => {
    mocks.results.push(
      {
        error: {
          code: "PGRST204",
          message: "Could not find the 'format' column",
        },
      },
      SAVED,
    );
    const result = await savePost(
      "id",
      { ...INPUT, format: "esg-insight" },
      "publish",
    );
    expect(result).toMatchObject({
      ok: true,
      degraded: true,
      status: "published",
      message:
        "Saved without the new fields. Paste the October database update first.",
    });
    expect(mocks.updates).toHaveLength(2);
    expect(mocks.updates[0]).toHaveProperty("format", "esg-insight");
    expect(mocks.updates[1]).not.toHaveProperty("format");
    expect(mocks.updates[1]).toMatchObject({ status: "published" });
  });

  it("does not retry other errors, and still reports a taken slug", async () => {
    mocks.results.push({ error: { code: "23505", message: "duplicate" } });
    const result = await savePost(
      "id",
      { ...INPUT, format: "esg-insight" },
      "save",
    );
    expect(result).toMatchObject({
      ok: false,
      errors: { slug: "Already in use." },
    });
    expect(mocks.updates).toHaveLength(1);
  });

  it("does not retry when no format was sent", async () => {
    mocks.results.push({ error: { code: "42703", message: "other column" } });
    const result = await savePost("id", INPUT, "save");
    expect(result).toMatchObject({ ok: false, message: "other column" });
    expect(mocks.updates).toHaveLength(1);
  });
});
