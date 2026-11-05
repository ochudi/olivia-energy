import { describe, expect, it, vi } from "vitest";

vi.mock("./urls", () => ({
  absoluteUrl: (path: string) => `https://example.com${path}`,
}));

import { parseSettings } from "@/lib/supabase/types";
import type { PostSummary, Publication } from "@/lib/supabase/types";
import type { OpEd } from "@/types/contracts";
import { FOUNDER, ORIGIN } from "@/content/about";
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

const oped = {
  slug: "gas-and-growth",
  title: "Gas and growth",
  outlet: "BusinessDay",
  url: "https://businessday.ng/opinion/article/gas-and-growth/",
  publishedOn: "2026-09-10",
  topics: ["Economy"],
  summary: "Argues  that gas\n can carry growth.",
} as OpEd;

describe("llmsText", () => {
  const text = llmsText({
    settings: parseSettings([]),
    posts: [post],
    publications: [paper],
    opEds: [oped],
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

  it("lists the op-eds under their own heading, before the journal articles", () => {
    expect(text).toContain(`## Op-eds by ${FOUNDER.name}`);
    expect(text).toContain(
      "- [Gas and growth](https://businessday.ng/opinion/article/gas-and-growth/): Argues that gas can carry growth. (BusinessDay, 10 September 2026)",
    );
    expect(text.indexOf("## Op-eds")).toBeLessThan(
      text.indexOf("## Research by"),
    );
  });

  it("links Research, not Publications, and takes the founder and origin lines from the content", () => {
    expect(text).toContain("- [Research](https://example.com/research): ");
    expect(text).not.toContain("/publications");
    expect(text).toContain(
      `- Founded by ${FOUNDER.name}, its Founder/CEO, an energy economist based in Fort Worth, Texas.`,
    );
    expect(text).toContain(
      "- Legal name: Olivia Energy and Power Company Limited, RC 1662525, registered in Nigeria.",
    );
    expect(text).toContain(
      "- United States entity: Olivia Group LLC, Registration ID 805857089, formed 14 January 2025.",
    );
    expect(text).toContain("- NIPEX Vendor ID S77939994. Categories: ");
    expect(text).toContain(`- ${ORIGIN.paragraph}`);
    expect(text).not.toContain("chief executive");
    // The client's instruction of 3 October 2026: the Nigerian location is
    // the region only, so no line reads "<town>, <state>, Nigeria".
    expect(text).toContain("Southwest Nigeria");
    expect(text).not.toMatch(/\w+, \w+ State/);
  });

  it("leaves out the article, op-ed and research sections while there is nothing to list", () => {
    const empty = llmsText({
      settings: parseSettings([]),
      posts: [],
      publications: [],
    });
    expect(empty).not.toContain("## Insights");
    expect(empty).not.toContain("## Op-eds");
    expect(empty).not.toContain("## Research");
    expect(empty).toContain("## Services");
  });
});
