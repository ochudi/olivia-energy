import { describe, expect, it, vi } from "vitest";

vi.mock("./urls", () => ({
  absoluteUrl: (path: string) => `https://example.com${path}`,
}));

import { parseSettings } from "@/lib/supabase/types";
import type { PostSummary, Publication } from "@/lib/supabase/types";
import { llmsText } from "./llms";

const post = {
  slug: "gas-to-power",
  title: "Gas to power:\n what lenders ask",
  excerpt: "A  short excerpt.",
  category: "power",
  published_at: "2026-09-08T11:00:00Z",
} as PostSummary;

const paper = {
  title: "Energy use and pollution",
  authors: ["A. Author", "B. Author"],
  venue: "Journal of Examples",
  year: 2024,
  url: "https://doi.org/10.1/x",
} as Publication;

describe("llmsText", () => {
  const text = llmsText({
    settings: parseSettings([]),
    posts: [post],
    publications: [paper],
  });

  it("opens with the name and a one-paragraph summary, as llmstxt.org asks", () => {
    const [title, blank, summary] = text.split("\n");
    expect(title).toBe("# Olivia Energy");
    expect(blank).toBe("");
    expect(summary.startsWith("> ")).toBe(true);
  });

  it("links every page, article and paper with absolute URLs on one line each", () => {
    expect(text).toContain("](https://example.com/what-we-do)");
    expect(text).toContain(
      "- [Gas to power: what lenders ask](https://example.com/insights/gas-to-power): A short excerpt. (Power, 8 September 2026)",
    );
    expect(text).toContain(
      "- [Energy use and pollution](https://doi.org/10.1/x): A. Author, B. Author. Journal of Examples. 2024.",
    );
  });

  it("leaves out the article and research sections while there is nothing to list", () => {
    const empty = llmsText({
      settings: parseSettings([]),
      posts: [],
      publications: [],
    });
    expect(empty).not.toContain("## Insights");
    expect(empty).not.toContain("## Research");
    expect(empty).toContain("## Services");
  });
});
