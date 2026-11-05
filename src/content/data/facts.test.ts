import { describe, expect, it } from "vitest";
import type { FactId } from "@/types/contracts";
import { FACT_LIST, FACTS } from "./facts";

/** Every id in the contract; a missing key fails the typecheck and this test. */
const ALL_IDS: readonly FactId[] = [
  "ssa-no-electricity-2024",
  "world-no-electricity-2024",
  "nigeria-no-electricity-2024",
  "africa-no-clean-cooking-2024",
  "clean-cooking-half-of-two-billion-in-africa",
  "africa-clean-investment-share-vs-population",
  "africa-energy-investment-fall-debt",
  "africa-solar-resource-share",
  "africa-solar-pv-installed-2025",
  "nigeria-grid-installed-vs-available-q1-2026",
  "nigeria-grid-delivered-q1-2026",
  "nigeria-business-generators",
  "nigeria-grid-unavailable-and-losses",
  "nigeria-flaring-rank-2025",
  "nigeria-flaring-rise-2025",
  "global-flaring-2025",
  "dangote-nameplate-2026",
  "dangote-capacity-700k-eia-2026",
  "nigeria-product-exports-sevenfold-2026",
  "nigeria-net-zero-2060-etp-cost",
  "nigeria-etp-original-410bn",
  "nigeria-power-2060-277gw",
  "clean-vs-fossil-investment-2026",
  "solar-pv-cost-fall-since-2010",
  "record-renewable-additions-2025-africa",
  "global-temperature-2025",
  "energy-co2-2025",
  "ssa-population-growth-2054",
];

describe("FACTS", () => {
  it("has every FactId and nothing else", () => {
    expect(Object.keys(FACTS).sort()).toEqual([...ALL_IDS].sort());
    expect(FACT_LIST).toHaveLength(ALL_IDS.length);
  });

  it.each(ALL_IDS)("%s has a source URL and a retrieval date", (id) => {
    const f = FACTS[id];
    expect(f.id).toBe(id);
    expect(f.source.org.length).toBeGreaterThan(0);
    expect(f.source.url).toMatch(/^https:\/\/\S+$/);
    expect(f.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(["confirmed", "corrected"]).toContain(f.status);
    expect(f.statement.length).toBeGreaterThan(20);
  });

  it("prints statements in house style: no en or em dashes", () => {
    for (const f of FACT_LIST) {
      expect(f.statement, f.id).not.toMatch(/[–—]/);
    }
    expect(FACTS["global-temperature-2025"].statement).toContain(
      "1850 to 1900",
    );
  });

  it("keeps the institution in the source line, not the prose", () => {
    const flaring = FACTS["nigeria-flaring-rank-2025"];
    expect(flaring.statement).not.toMatch(/World Bank/);
    expect(flaring.source.org).toMatch(/World Bank/);
    for (const f of FACT_LIST) {
      expect(f.statement, f.id).not.toMatch(
        /\((World Bank|AfDB|African Development Bank|UNDP)(, \d{4})?\)/,
      );
    }
  });
});
