import { describe, expect, it } from "vitest";
import {
  MENTIONS,
  OPEDS,
  OPED_TOPICS,
  isEnergyOpEd,
} from "@/content/commentary";
import {
  byNewest,
  countCommentary,
  formatCountsFromRows,
  isJournal,
  mentionsFromRows,
  opedsFromRows,
  slugFromUrl,
  staticCounts,
} from "./commentary-rows";
import type { Publication } from "./types";

function row(overrides: Partial<Publication>): Publication {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    title: "Title",
    authors: [],
    venue: "BusinessDay",
    year: 2026,
    url: "https://businessday.ng/opinion/article/a-title/",
    summary: null,
    featured: false,
    sort: 0,
    created_at: "2026-10-03T00:00:00Z",
    updated_at: "2026-10-03T00:00:00Z",
    ...overrides,
  };
}

describe("slugFromUrl", () => {
  it("takes the last path segment", () => {
    expect(
      slugFromUrl(
        "https://businessday.ng/pro/article/divided-by-barrels-united-by-football/",
      ),
    ).toBe("divided-by-barrels-united-by-football");
  });
  it("lower-cases, drops query strings and strange characters", () => {
    expect(slugFromUrl("https://example.com/a/Some_Title%21?x=1")).toBe(
      "some-title",
    );
  });
  it("is empty for a URL with no path or no URL", () => {
    expect(slugFromUrl("https://example.com/")).toBe("");
    expect(slugFromUrl("not a url")).toBe("");
  });
});

describe("row mapping", () => {
  it("maps an op-ed row to an OpEd", () => {
    const [oped] = opedsFromRows([
      row({
        kind: "op-ed",
        title: "Power to prosper",
        url: "https://businessday.ng/opinion/article/power-to-prosper/",
        published_on: "2025-06-27",
        topics: ["Energy transition", "Power"],
        summary: "A summary.",
        pull_quote: "A quote.",
      }),
    ]);
    expect(oped).toEqual({
      slug: "power-to-prosper",
      title: "Power to prosper",
      outlet: "BusinessDay",
      url: "https://businessday.ng/opinion/article/power-to-prosper/",
      publishedOn: "2025-06-27",
      topics: ["Energy transition", "Power"],
      summary: "A summary.",
      pullQuote: "A quote.",
    });
  });

  it("omits an empty pull quote and ignores unknown topics", () => {
    const [oped] = opedsFromRows([
      row({
        kind: "op-ed",
        published_on: "2026-01-01",
        topics: ["Power", "Cricket"],
        pull_quote: "  ",
      }),
    ]);
    expect(oped).not.toHaveProperty("pullQuote");
    expect(oped?.topics).toEqual(["Power"]);
  });

  it("drops rows it cannot show and rows of other kinds", () => {
    const opeds = opedsFromRows([
      row({ kind: "op-ed", published_on: null }),
      row({ kind: "op-ed", published_on: "26 Jan 2026" }),
      row({ kind: "op-ed", published_on: "2026-01-01", url: null }),
      row({ kind: "journal", published_on: "2026-01-01" }),
      row({ kind: "mention", published_on: "2026-01-01" }),
      row({ published_on: "2026-01-01" }),
    ]);
    expect(opeds).toEqual([]);
  });

  it("orders newest first and keeps slugs unique", () => {
    const url = "https://businessday.ng/opinion/article/same/";
    const opeds = opedsFromRows([
      row({ kind: "op-ed", published_on: "2025-01-01", url }),
      row({ kind: "op-ed", published_on: "2026-01-01", url: `${url}?b` }),
    ]);
    expect(opeds.map((o) => o.publishedOn)).toEqual([
      "2026-01-01",
      "2025-01-01",
    ]);
    expect(new Set(opeds.map((o) => o.slug)).size).toBe(2);
  });

  it("maps mentions and their syndication flag", () => {
    const mentions = mentionsFromRows([
      row({ kind: "mention", title: "A", published_on: "2026-03-27" }),
      row({
        kind: "mention",
        title: "A",
        venue: "Parrot Nigeria",
        url: "https://parrotnigeria.com/a/",
        published_on: "2026-03-27",
        syndication: true,
      }),
      row({ kind: "op-ed", published_on: "2026-03-27" }),
    ]);
    expect(mentions.map((m) => [m.outlet, m.syndication])).toEqual([
      ["BusinessDay", false],
      ["Parrot Nigeria", true],
    ]);
  });
});

describe("journal filter", () => {
  it("treats a row with no kind as a journal", () => {
    expect(isJournal({})).toBe(true);
    expect(isJournal({ kind: "journal" })).toBe(true);
  });
  it("excludes every other kind", () => {
    for (const kind of ["op-ed", "mention", "report", "talk"]) {
      expect(isJournal({ kind })).toBe(false);
    }
  });
});

describe("counts", () => {
  it("counts BusinessDay reports and leaves syndications out", () => {
    const counts = countCommentary(
      OPEDS.slice(0, 2),
      [
        ...MENTIONS,
        {
          title: "Another copy",
          outlet: "BusinessDay",
          url: "https://example.com/copy",
          publishedOn: "2026-03-27",
          syndication: true,
        },
      ],
      9,
    );
    expect(counts.mentions).toBe(12);
    expect(counts.opeds).toBe(2);
    expect(counts.articles).toBe(9);
  });

  it("reports the first and last op-ed dates", () => {
    const counts = countCommentary(OPEDS, MENTIONS, 9);
    expect(counts.firstOpEd).toBe("2025-06-23");
    expect(counts.lastOpEd).toBe("2026-09-10");
  });

  it("counts published posts per known format only", () => {
    expect(
      formatCountsFromRows([
        { format: "policy-brief" },
        { format: "policy-brief" },
        { format: "esg-insight" },
        { format: null },
        { format: "podcast" },
        {},
      ]),
    ).toEqual({ "policy-brief": 2, "esg-insight": 1 });
    expect(formatCountsFromRows([])).toEqual({});
  });
});

describe("static commentary", () => {
  it("has 11 op-eds and 13 mentions, newest first", () => {
    expect(OPEDS).toHaveLength(11);
    expect(MENTIONS).toHaveLength(13);
    expect([...OPEDS].sort(byNewest)).toEqual(OPEDS);
    expect([...MENTIONS].sort(byNewest)).toEqual(MENTIONS);
  });

  it("flags only the Parrot Nigeria row as a syndication", () => {
    const syndicated = MENTIONS.filter((m) => m.syndication);
    expect(syndicated).toHaveLength(1);
    expect(syndicated[0]?.outlet).toBe("Parrot Nigeria");
    expect(
      MENTIONS.filter((m) => !m.syndication).every(
        (m) => m.outlet === "BusinessDay",
      ),
    ).toBe(true);
  });

  it("excludes the Clinton School and Conquest Magazine rows", () => {
    const urls = [...OPEDS, ...MENTIONS].map((r) => r.url).join(" ");
    expect(urls).not.toMatch(/clintonschool|conquestmagazine/);
  });

  it("has unique slugs that equal the URL path, valid ISO dates and known topics", () => {
    expect(new Set(OPEDS.map((o) => o.slug)).size).toBe(OPEDS.length);
    for (const oped of OPEDS) {
      expect(oped.slug).toBe(slugFromUrl(oped.url));
      expect(oped.publishedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(oped.summary.length).toBeGreaterThan(0);
      expect(oped.pullQuote?.length ?? 0).toBeGreaterThan(0);
      for (const topic of oped.topics) expect(OPED_TOPICS).toContain(topic);
    }
    for (const mention of MENTIONS) {
      expect(mention.publishedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("matches the counts the pages quote", () => {
    expect(staticCounts()).toEqual({
      opeds: 11,
      mentions: 12,
      articles: 9,
      firstOpEd: "2025-06-23",
      lastOpEd: "2026-09-10",
    });
  });

  it("isEnergyOpEd is false when every topic is Policy or Economy", () => {
    const base = OPEDS[0]!;
    expect(isEnergyOpEd({ ...base, topics: ["Policy", "Economy"] })).toBe(
      false,
    );
    expect(isEnergyOpEd({ ...base, topics: ["Policy"] })).toBe(false);
    expect(isEnergyOpEd({ ...base, topics: ["Policy", "Power"] })).toBe(true);
    expect(isEnergyOpEd({ ...base, topics: ["Dangote Refinery"] })).toBe(true);
    expect(OPEDS.filter((o) => !isEnergyOpEd(o))).toHaveLength(3);
  });
});
