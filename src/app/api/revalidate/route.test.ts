import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePosts: vi.fn(),
  revalidatePublications: vi.fn(),
  revalidateSettings: vi.fn(),
}));
vi.mock("@/lib/supabase/revalidate", () => mocks);

import { POST } from "./route";

const SECRET = "test-secret-0123456789";

function post(body: unknown, auth: string | null = `Bearer ${SECRET}`) {
  return POST(
    new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(auth ? { authorization: auth } : {}),
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  process.env.REVALIDATE_SECRET = SECRET;
});
afterEach(() => {
  delete process.env.REVALIDATE_SECRET;
});

describe("POST /api/revalidate", () => {
  it("refuses to run without a configured secret", async () => {
    delete process.env.REVALIDATE_SECRET;
    expect((await post({ table: "settings" })).status).toBe(503);
    expect(mocks.revalidateSettings).not.toHaveBeenCalled();
  });

  it("rejects a missing or wrong bearer token", async () => {
    expect((await post({ table: "settings" }, null)).status).toBe(401);
    expect((await post({ table: "settings" }, "Bearer nope")).status).toBe(401);
    expect(mocks.revalidateSettings).not.toHaveBeenCalled();
  });

  it("rejects bodies that are not JSON or name an unknown table", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({ table: "profiles" })).status).toBe(400);
  });

  it("refuses a webhook payload from another schema's table of the same name", async () => {
    const response = await post({
      type: "UPDATE",
      schema: "public",
      table: "posts",
      record: { slug: "someone-elses-post" },
    });
    expect(response.status).toBe(400);
    expect(mocks.revalidatePosts).not.toHaveBeenCalled();
  });

  it("purges the tags a Supabase webhook payload implies, including a renamed slug", async () => {
    const response = await post({
      type: "UPDATE",
      table: "posts",
      record: { slug: "new-slug" },
      old_record: { slug: "old-slug" },
    });
    expect(response.status).toBe(200);
    expect(mocks.revalidatePosts.mock.calls.map((c) => c[0])).toEqual([
      "new-slug",
      "old-slug",
    ]);
    await expect(response.json()).resolves.toMatchObject({
      revalidated: ["posts", "post:new-slug", "post:old-slug"],
    });
  });

  it("purges the whole post list when no slug is known", async () => {
    await post({ table: "posts" });
    expect(mocks.revalidatePosts).toHaveBeenCalledWith();
  });

  it("purges publications and settings on request", async () => {
    await post({ table: "publications" });
    await post({ table: "settings" });
    expect(mocks.revalidatePublications).toHaveBeenCalledTimes(1);
    expect(mocks.revalidateSettings).toHaveBeenCalledTimes(1);
  });
});
