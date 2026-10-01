import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: null as { id: string; email?: string } | null,
  profile: null as { id: string; role: string } | null,
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: async () => ({
    auth: { getUser: async () => ({ data: { user: mocks.user } }) },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: mocks.profile }) }),
      }),
    }),
  }),
}));

import { assertAdmin, requireAdmin } from "./auth";

beforeEach(() => {
  mocks.user = null;
  mocks.profile = null;
});

describe("server-action guard (assertAdmin)", () => {
  it("throws without a session", async () => {
    await expect(assertAdmin()).rejects.toThrow("Not authorised");
  });

  it("throws for a signed-in editor", async () => {
    mocks.user = { id: "u1" };
    mocks.profile = { id: "u1", role: "editor" };
    await expect(assertAdmin()).rejects.toThrow("Not authorised");
  });

  it("returns the session for an admin", async () => {
    mocks.user = { id: "u1", email: "admin@example.com" };
    mocks.profile = { id: "u1", role: "admin" };
    await expect(assertAdmin()).resolves.toMatchObject({
      userId: "u1",
      email: "admin@example.com",
      isAdmin: true,
    });
  });
});

describe("page guard (requireAdmin)", () => {
  it("redirects to the login page without a session", async () => {
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("redirects an editor to the no-access screen", async () => {
    mocks.user = { id: "u1" };
    mocks.profile = { id: "u1", role: "editor" };
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/no-access");
  });
});
