import { describe, expect, it } from "vitest";
import {
  capitalise,
  countWords,
  formatDateLong,
  formatDateShort,
  monthYear,
} from "./format";

describe("countWords", () => {
  it("writes one to twenty as words", () => {
    expect(countWords(1)).toBe("one");
    expect(countWords(9)).toBe("nine");
    expect(countWords(11)).toBe("eleven");
    expect(countWords(12)).toBe("twelve");
    expect(countWords(20)).toBe("twenty");
  });

  it("uses en-GB numerals outside one to twenty", () => {
    expect(countWords(21)).toBe("21");
    expect(countWords(0)).toBe("0");
    expect(countWords(1500)).toBe("1,500");
    expect(countWords(2.5)).toBe("2.5");
  });
});

describe("capitalise", () => {
  it("upper-cases the first letter only", () => {
    expect(capitalise("twelve BusinessDay reports")).toBe(
      "Twelve BusinessDay reports",
    );
    expect(capitalise("")).toBe("");
  });
});

describe("dates", () => {
  it("formats the long form", () => {
    expect(formatDateLong("2026-09-10")).toBe("10 September 2026");
    expect(formatDateLong("2026-03-24")).toBe("24 March 2026");
  });

  it("formats the short form with three-letter months", () => {
    expect(formatDateShort("2026-09-10")).toBe("10 Sep 2026");
    expect(formatDateShort("2025-06-23")).toBe("23 Jun 2025");
  });

  it("gives month and year", () => {
    expect(monthYear("2025-06-23")).toBe("June 2025");
    expect(monthYear("2026-09-10")).toBe("September 2026");
  });

  it("reads the calendar date of a timestamp without shifting the day", () => {
    expect(formatDateLong("2026-09-10T23:30:00-05:00")).toBe(
      "10 September 2026",
    );
    expect(formatDateShort("2026-01-01T00:00:00Z")).toBe("1 Jan 2026");
  });

  it("rejects strings that are not ISO dates", () => {
    expect(() => formatDateLong("10/09/2026")).toThrow(RangeError);
    expect(() => monthYear("2026-13-01")).toThrow(RangeError);
  });
});
