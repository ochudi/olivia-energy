import { describe, expect, it } from "vitest";
import {
  autoDecimals,
  formatDateLong,
  formatNumber,
  formatTick,
  formatValue,
  formatYear,
} from "./format";

describe("formatValue", () => {
  it("prints percents with one decimal, dollars with two", () => {
    expect(formatValue(91.93, "percent")).toBe("91.9%");
    expect(formatValue(0.27, "usd")).toBe("$0.27");
    expect(formatValue(132.384, "usd")).toBe("$132.38");
  });

  it("prints people in millions and billions with en-GB grouping", () => {
    expect(formatValue(657_000_000, "millions")).toBe("657 million");
    expect(formatValue(1_340_000_000, "millions")).toBe("1.34 billion");
    expect(formatValue(13625, "number")).toBe("13,625");
  });

  it("chooses decimals by magnitude", () => {
    expect(autoDecimals(2.2)).toBe(2);
    expect(autoDecimals(32.7)).toBe(1);
    expect(autoDecimals(277)).toBe(0);
    expect(formatNumber(32.7)).toBe("32.7");
    expect(formatNumber(3860)).toBe("3,860");
  });
});

describe("formatTick", () => {
  it("keeps ticks short", () => {
    expect(formatTick(1.5e9, "millions")).toBe("1.5bn");
    expect(formatTick(5e8, "millions")).toBe("500m");
    expect(formatTick(0, "millions")).toBe("0");
    expect(formatTick(0.1, "usd")).toBe("$0.10");
    expect(formatTick(100, "usd")).toBe("$100");
    expect(formatTick(25, "percent")).toBe("25%");
  });
});

describe("dates", () => {
  it("writes the retrieval date and decimal years the house way", () => {
    expect(formatDateLong("2026-10-02")).toBe("2 October 2026");
    expect(formatDateLong("n/a")).toBe("n/a");
    expect(formatYear(2024)).toBe("2024");
    expect(formatYear(2026.583)).toBe("Aug 2026");
    expect(formatYear(2000.0)).toBe("2000");
  });
});
