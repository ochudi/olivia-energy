import { beforeEach, describe, expect, it, vi } from "vitest";

type Result = {
  data?: unknown;
  error: { code?: string; message: string } | null;
};

const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  revalidatePublications: vi.fn(),
  revalidatePath: vi.fn(),
  writes: [] as { op: string; row: unknown; id?: string }[],
  results: [] as unknown[],
  lastSort: 4 as number | null,
}));

class Redirect extends Error {
  constructor(public to: string) {
    super(`redirect:${to}`);
  }
}

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Redirect(to);
  },
}));
vi.mock("@/lib/admin/auth", () => ({ assertAdmin: mocks.assertAdmin }));
vi.mock("@/lib/supabase/revalidate", () => ({
  revalidatePublications: mocks.revalidatePublications,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => ({
            maybeSingle: async () => ({ data: { sort: mocks.lastSort } }),
          }),
        }),
      }),
      insert: (row: unknown) => {
        mocks.writes.push({ op: "insert", row });
        return {
          select: () => ({
            single: async () => mocks.results.shift() as Result,
          }),
        };
      },
      update: (row: unknown) => ({
        eq: async (_column: string, id: string) => {
          mocks.writes.push({ op: "update", row, id });
          return mocks.results.shift() as Result;
        },
      }),
    }),
  }),
}));

import { savePublication } from "./publications";

const ID = "6f1c1d2e-3a4b-4c5d-8e9f-0a1b2c3d4e5f";
const MISSING = {
  code: "PGRST204",
  message: "Could not find the 'kind' column",
};

function form(fields: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      data.append(key, item);
    }
  }
  return data;
}

const OPED = {
  kind: "op-ed",
  title: "Divided by barrels, united by football",
  url: "https://businessday.ng/pro/article/divided-by-barrels-united-by-football/",
  published_on: "2026-06-08",
  topics: ["Policy", "Economy"],
};

beforeEach(() => {
  mocks.writes.length = 0;
  mocks.results.length = 0;
  mocks.lastSort = 4;
  mocks.assertAdmin.mockResolvedValue({ userId: "me" });
});

async function run(
  id: string | null,
  data: FormData,
): Promise<{ state: unknown; redirectedTo: string | null }> {
  try {
    return { state: await savePublication(id, null, data), redirectedTo: null };
  } catch (error) {
    if (error instanceof Redirect)
      return { state: null, redirectedTo: error.to };
    throw error;
  }
}

describe("savePublication", () => {
  it("creates an op-ed with the new fields, sorted last, and revalidates", async () => {
    mocks.results.push({ data: { id: ID }, error: null });
    const { redirectedTo } = await run(null, form(OPED));
    expect(redirectedTo).toBe("/admin/publications?saved=1");
    expect(mocks.writes).toHaveLength(1);
    expect(mocks.writes[0]).toMatchObject({
      op: "insert",
      row: {
        kind: "op-ed",
        published_on: "2026-06-08",
        topics: ["Policy", "Economy"],
        year: 2026,
        venue: "BusinessDay",
        sort: 5,
      },
    });
    expect(mocks.revalidatePublications).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/publications");
  });

  it("edits a row in place", async () => {
    mocks.results.push({ error: null });
    const { redirectedTo } = await run(
      ID,
      form({ ...OPED, title: "New title" }),
    );
    expect(redirectedTo).toBe("/admin/publications?saved=1");
    expect(mocks.writes[0]).toMatchObject({
      op: "update",
      id: ID,
      row: { title: "New title", kind: "op-ed" },
    });
  });

  it("returns the field errors without writing", async () => {
    const { state } = await run(null, form({ ...OPED, published_on: "" }));
    expect(state).toMatchObject({
      ok: false,
      message: "Fix the highlighted fields.",
      errors: { published_on: "Add the publication date." },
      values: { title: OPED.title },
    });
    expect(mocks.writes).toHaveLength(0);
  });

  it("retries once without the new fields when the database lacks the columns", async () => {
    mocks.results.push({ error: MISSING }, { data: { id: ID }, error: null });
    const { state, redirectedTo } = await run(null, form(OPED));
    expect(redirectedTo).toBeNull();
    expect(state).toMatchObject({
      ok: true,
      message:
        "Saved without the new fields. Paste the October database update first.",
      values: { id: ID, title: OPED.title },
    });
    expect(mocks.writes).toHaveLength(2);
    const retry = mocks.writes[1]!.row as Record<string, unknown>;
    expect(retry).toMatchObject({ title: OPED.title, year: 2026 });
    for (const column of [
      "kind",
      "published_on",
      "topics",
      "pull_quote",
      "syndication",
    ]) {
      expect(retry).not.toHaveProperty(column);
    }
    expect(mocks.revalidatePublications).toHaveBeenCalledTimes(1);
  });

  it("retries an edit on Postgres 42703 too", async () => {
    mocks.results.push(
      { error: { code: "42703", message: "column does not exist" } },
      { error: null },
    );
    const { state } = await run(ID, form(OPED));
    expect(state).toMatchObject({ ok: true });
    expect(mocks.writes.map((w) => w.op)).toEqual(["update", "update"]);
  });

  it("updates the row it created when saved again without the new fields", async () => {
    mocks.results.push({ error: null });
    const { redirectedTo } = await run(null, form({ ...OPED, created_id: ID }));
    expect(redirectedTo).toBe("/admin/publications?saved=1");
    expect(mocks.writes[0]).toMatchObject({ op: "update", id: ID });
  });

  it("ignores a created_id that is not a uuid", async () => {
    mocks.results.push({ data: { id: ID }, error: null });
    await run(null, form({ ...OPED, created_id: "1; drop table" }));
    expect(mocks.writes[0]!.op).toBe("insert");
  });

  it("reports the second error and does not retry again", async () => {
    mocks.results.push(
      { error: MISSING },
      {
        error: { code: "23514", message: "check failed" },
      },
    );
    const { state } = await run(null, form(OPED));
    expect(state).toMatchObject({ ok: false, message: "check failed" });
    expect(mocks.writes).toHaveLength(2);
    expect(mocks.revalidatePublications).not.toHaveBeenCalled();
  });

  it("does not retry other errors", async () => {
    mocks.results.push({
      error: { code: "42501", message: "permission denied" },
    });
    const { state } = await run(null, form(OPED));
    expect(state).toMatchObject({ ok: false, message: "permission denied" });
    expect(mocks.writes).toHaveLength(1);
  });

  it("refuses a caller who is not an admin", async () => {
    mocks.assertAdmin.mockRejectedValue(new Error("Not authorised"));
    await expect(run(null, form(OPED))).rejects.toThrow("Not authorised");
    expect(mocks.writes).toHaveLength(0);
  });
});
