import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/seo/urls", () => ({
  absoluteUrl: (path: string) => `https://example.com${path}`,
}));
vi.mock("@/lib/supabase/queries", () => ({
  getPublishedPosts: async () => [
    {
      slug: "gas-to-power",
      category: "power",
      updated_at: "2026-09-08T11:00:00Z",
    },
  ],
}));

import sitemap from "./sitemap";

describe("sitemap", async () => {
  const urls = (await sitemap()).map((entry) => entry.url);

  it("lists Research and Credits and no longer Publications", () => {
    expect(urls).toContain("https://example.com/research");
    expect(urls).toContain("https://example.com/credits");
    expect(urls.some((url) => url.includes("/publications"))).toBe(false);
  });

  it("lists every article and every category that has one", () => {
    expect(urls).toContain("https://example.com/insights/gas-to-power");
    expect(urls).toContain("https://example.com/insights/category/power");
    expect(urls.some((url) => url.includes("/category/policy"))).toBe(false);
  });
});
