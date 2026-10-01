import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));

import {
  revalidateAllContent,
  revalidatePost,
  revalidatePosts,
  revalidatePublications,
  revalidateSettings,
} from "./revalidate";

const tags = () => mocks.revalidateTag.mock.calls.map((call) => call[0]);

describe("revalidation helpers", () => {
  it("purges the post list, and one article when a slug is given", () => {
    revalidatePosts();
    expect(tags()).toEqual(["posts"]);
    mocks.revalidateTag.mockClear();
    revalidatePosts("gas-to-power");
    expect(tags()).toEqual(["posts", "post:gas-to-power"]);
  });

  it("purges a single article without touching the lists", () => {
    revalidatePost("gas-to-power");
    expect(tags()).toEqual(["post:gas-to-power"]);
  });

  it("purges publications and settings by their own tags", () => {
    revalidatePublications();
    revalidateSettings();
    expect(tags()).toEqual(["publications", "settings"]);
  });

  it("purges everything the public site caches", () => {
    revalidateAllContent();
    expect(tags().sort()).toEqual(["posts", "publications", "settings"]);
  });
});
