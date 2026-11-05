import { describe, expect, it } from "vitest";
import { formValues, parsePublication, yearOfDate } from "./publication-input";

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
  title: "Turning Nigerians from consumers into owners",
  venue: "BusinessDay",
  url: "https://businessday.ng/opinion/article/x/",
  published_on: "2026-09-10",
  topics: ["Economy", "Dangote Refinery"],
  pull_quote: "A line.",
};

describe("yearOfDate", () => {
  it("accepts real dates only", () => {
    expect(yearOfDate("2026-09-10")).toBe(2026);
    expect(yearOfDate("2026-02-30")).toBeNull();
    expect(yearOfDate("26-09-10")).toBeNull();
    expect(yearOfDate("1899-12-31")).toBeNull();
    expect(yearOfDate("2101-01-01")).toBeNull();
  });
});

describe("parsePublication: op-ed", () => {
  it("derives the year from the date and keeps topics in list order", () => {
    const result = parsePublication(form(OPED));
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.base.year).toBe(2026);
    expect(result.base.venue).toBe("BusinessDay");
    expect(result.base.featured).toBe(false);
    expect(result.extra).toEqual({
      kind: "op-ed",
      published_on: "2026-09-10",
      topics: ["Dangote Refinery", "Economy"],
      pull_quote: "A line.",
      syndication: false,
    });
  });
  it("derives BusinessDay as the outlet from the address when it is empty", () => {
    const result = parsePublication(form({ ...OPED, venue: "" }));
    expect(result.ok && result.base.venue).toBe("BusinessDay");
    const other = parsePublication(
      form({ ...OPED, venue: "", url: "https://example.com/a" }),
    );
    expect(other.ok && other.base.venue).toBeNull();
  });
  it("requires the date and the link", () => {
    const result = parsePublication(
      form({ ...OPED, published_on: "", url: "" }),
    );
    expect(result).toMatchObject({
      ok: false,
      errors: {
        published_on: "Add the publication date.",
        url: "Add the article link.",
      },
    });
  });
  it("rejects an impossible date, an unknown topic and a long quote", () => {
    const result = parsePublication(
      form({
        ...OPED,
        published_on: "2026-02-30",
        topics: ["Cryptocurrency"],
        pull_quote: "x".repeat(601),
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual([
      "published_on",
      "pull_quote",
      "topics",
    ]);
  });
  it("ignores a typed year, as the year comes from the date", () => {
    const result = parsePublication(form({ ...OPED, year: "1999" }));
    expect(result.ok && result.base.year).toBe(2026);
  });
});

describe("parsePublication: mention", () => {
  it("keeps the syndication flag and the reporter", () => {
    const result = parsePublication(
      form({
        kind: "mention",
        title: "A report",
        authors: "Jane Doe",
        venue: "Parrot Nigeria",
        url: "https://parrotnigeria.com/a",
        published_on: "2026-01-02",
        syndication: "on",
        featured: "on",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.extra.syndication).toBe(true);
    expect(result.base.authors).toEqual(["Jane Doe"]);
    expect(result.base.featured).toBe(false);
  });
});

describe("parsePublication: journal and other kinds", () => {
  it("needs only a title, as before", () => {
    const result = parsePublication(form({ title: "A paper" }));
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.extra.kind).toBe("journal");
    expect(result.base).toMatchObject({
      year: null,
      url: null,
      venue: null,
      featured: false,
    });
  });
  it("does not need a DOI or a date", () => {
    const result = parsePublication(
      form({ kind: "report", title: "R", year: "2024", featured: "on" }),
    );
    expect(result.ok && result.base.year).toBe(2024);
    expect(result.ok && result.base.featured).toBe(true);
  });
  it("falls back to the date's year when the year is empty", () => {
    const result = parsePublication(
      form({ kind: "talk", title: "T", published_on: "2025-03-04" }),
    );
    expect(result.ok && result.base.year).toBe(2025);
  });
  it("clears fields the kind does not use", () => {
    const result = parsePublication(
      form({
        kind: "journal",
        title: "P",
        topics: ["Economy"],
        pull_quote: "q",
        syndication: "on",
      }),
    );
    expect(result.ok && result.extra).toMatchObject({
      topics: [],
      pull_quote: null,
      syndication: false,
    });
  });
  it("keeps the existing checks on the year, link and title", () => {
    const result = parsePublication(
      form({ title: "", year: "20x4", url: "ftp://a" }),
    );
    expect(result).toMatchObject({
      ok: false,
      errors: {
        title: "Add a title.",
        year: "Four-digit year.",
        url: "Must start with https://",
      },
    });
  });
  it("rejects an unknown kind", () => {
    expect(parsePublication(form({ kind: "poem", title: "x" }))).toMatchObject({
      ok: false,
      errors: { kind: expect.any(String) },
    });
  });
});

describe("formValues", () => {
  it("hands the submission back as strings", () => {
    expect(formValues(form({ ...OPED, syndication: "on" }))).toMatchObject({
      title: OPED.title,
      topics: "Economy|Dangote Refinery",
      syndication: "on",
      featured: "",
    });
  });
});
