import { describe, expect, it } from "vitest";
import type { Publication } from "@/lib/supabase/types";
import {
  fieldsFor,
  isCommentaryKind,
  isMissingColumnError,
  kindOf,
  listCounts,
  listRows,
  parseListFilter,
} from "./publication-fields";

function row(over: Partial<Publication>): Publication {
  return {
    id: "x",
    title: "T",
    authors: [],
    venue: null,
    year: null,
    url: null,
    summary: null,
    featured: false,
    sort: 0,
    created_at: "",
    updated_at: "",
    ...over,
  };
}

describe("isMissingColumnError", () => {
  it("recognises Postgres 42703 and PostgREST PGRST204", () => {
    expect(isMissingColumnError({ code: "42703" })).toBe(true);
    expect(isMissingColumnError({ code: "PGRST204" })).toBe(true);
  });
  it("ignores other errors", () => {
    expect(isMissingColumnError({ code: "23505" })).toBe(false);
    expect(isMissingColumnError({ code: null })).toBe(false);
    expect(isMissingColumnError(null)).toBe(false);
  });
});

describe("fieldsFor", () => {
  it("makes the date and link required for op-eds and mentions only", () => {
    for (const kind of ["op-ed", "mention"] as const) {
      expect(isCommentaryKind(kind)).toBe(true);
      expect(fieldsFor(kind).date.required).toBe(true);
      expect(fieldsFor(kind).link.required).toBe(true);
      expect(fieldsFor(kind).year).toBe(false);
      expect(fieldsFor(kind).featured).toBe(false);
    }
    for (const kind of ["journal", "report", "talk"] as const) {
      expect(isCommentaryKind(kind)).toBe(false);
      expect(fieldsFor(kind).date.required).toBe(false);
      expect(fieldsFor(kind).link.required).toBe(false);
      expect(fieldsFor(kind).year).toBe(true);
      expect(fieldsFor(kind).topics).toBe(false);
    }
  });
  it("shows the syndication box for mentions only", () => {
    expect(fieldsFor("mention").syndication).toBe(true);
    expect(fieldsFor("op-ed").syndication).toBe(false);
    expect(fieldsFor("journal").syndication).toBe(false);
  });
  it("calls the DOI field a link for journals and the article link for op-eds", () => {
    expect(fieldsFor("journal").link.hint).toMatch(/DOI/);
    expect(fieldsFor("op-ed").link.hint).not.toMatch(/DOI/);
  });
});

describe("kindOf", () => {
  it("treats a row without the column as a journal", () => {
    expect(kindOf(row({}))).toBe("journal");
    expect(kindOf(row({ kind: "nonsense" }))).toBe("journal");
    expect(kindOf(row({ kind: "op-ed" }))).toBe("op-ed");
  });
});

describe("listRows and listCounts", () => {
  const rows = [
    row({ id: "j1", title: "J1", kind: "journal", sort: 0 }),
    row({ id: "o1", title: "Old", kind: "op-ed", published_on: "2025-06-23" }),
    row({ id: "j2", title: "J2" }),
    row({ id: "o2", title: "New", kind: "op-ed", published_on: "2026-09-10" }),
    row({ id: "m1", title: "M", kind: "mention", published_on: "2026-01-01" }),
    row({ id: "o3", title: "Undated", kind: "op-ed" }),
    row({ id: "t1", title: "Talk", kind: "talk" }),
  ];
  it("keeps journals in the editor's order and sorts the rest newest first", () => {
    expect(listRows(rows, "all").map((r) => r.id)).toEqual([
      "j1",
      "j2",
      "o2",
      "o1",
      "o3",
      "m1",
      "t1",
    ]);
    expect(listRows(rows, "op-ed").map((r) => r.id)).toEqual([
      "o2",
      "o1",
      "o3",
    ]);
    expect(listRows(rows, "journal").map((r) => r.id)).toEqual(["j1", "j2"]);
    expect(listRows(rows, "other").map((r) => r.id)).toEqual(["t1"]);
  });
  it("counts each filter", () => {
    expect(listCounts(rows)).toEqual({
      all: 7,
      journal: 2,
      "op-ed": 3,
      mention: 1,
      other: 1,
    });
  });
  it("falls back to all for an unknown filter", () => {
    expect(parseListFilter("op-ed")).toBe("op-ed");
    expect(parseListFilter("bogus")).toBe("all");
    expect(parseListFilter(undefined)).toBe("all");
  });
});
