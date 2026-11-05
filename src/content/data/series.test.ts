import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { SeriesId } from "@/types/contracts";
import { getSeries, SERIES_IDS, seriesValue } from "./series";

/**
 * The research team's verified files. Points are copied, never recomputed,
 * so every point here must equal the research point. Set RESEARCH_DIR to the
 * research folder to run that comparison; without it the comparison is
 * skipped and the stable checks below still run.
 */
const RESEARCH_DATA = process.env.RESEARCH_DIR
  ? path.join(process.env.RESEARCH_DIR, "data")
  : "";
const hasResearch = RESEARCH_DATA !== "" && fs.existsSync(RESEARCH_DATA);

const ALL_IDS: readonly SeriesId[] = [
  "electricity_access_pct",
  "people_without_electricity",
  "solar_pv_capacity_gw",
  "solar_pv_module_price",
  "generation_by_source_nigeria",
  "generation_by_source_africa",
  "low_carbon_share_electricity",
  "co2_per_capita",
  "temperature_anomaly",
  "brent_crude_annual",
  "brent_crude_monthly",
  "energy_per_person",
  "electricity_per_person",
];

const seriesDir = path.join(process.cwd(), "src/content/data/series");
const csvDir = path.join(process.cwd(), "public/data");

describe("series files", () => {
  it("exist for every SeriesId, and only those", () => {
    expect([...SERIES_IDS].sort()).toEqual([...ALL_IDS].sort());
    const onDisk = fs
      .readdirSync(seriesDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(onDisk).toEqual([...ALL_IDS].sort());
  });

  it.each(ALL_IDS)("%s carries its provenance and well-formed points", (id) => {
    const file = getSeries(id);
    expect(file.id).toBe(id);
    expect(file.title.length).toBeGreaterThan(4);
    expect(file.unit.length).toBeGreaterThan(0);
    expect(file.source_org.length).toBeGreaterThan(0);
    expect(file.source_url).toMatch(/^https:\/\//);
    expect(file.licence.length).toBeGreaterThan(0);
    expect(file.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(file.series.length).toBeGreaterThan(0);
    for (const s of file.series) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.points.length).toBeGreaterThan(1);
      let prev = -Infinity;
      for (const [x, y] of s.points) {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(x).toBeGreaterThan(prev);
        prev = x;
      }
    }
  });

  it.skipIf(!hasResearch).each(ALL_IDS)(
    "%s points equal the research file's points",
    (id) => {
      const research = JSON.parse(
        fs.readFileSync(path.join(RESEARCH_DATA, `${id}.json`), "utf8"),
      ) as { series: { name: string; points: [number, number][] }[] };
      const ours = getSeries(id);
      expect(ours.series.map((s) => s.name)).toEqual(
        research.series.map((s) => s.name),
      );
      ours.series.forEach((s, i) => {
        expect(s.points).toEqual(research.series[i].points);
      });
    },
  );

  it.each(ALL_IDS)("%s has a CSV with the same rows", (id) => {
    const file = getSeries(id);
    const csv = fs.readFileSync(path.join(csvDir, `${id}.csv`), "utf8");
    const [header, ...rows] = csv.trimEnd().split("\n");
    expect(header.split(",")[0]).toBe("year");
    const xs = [
      ...new Set(file.series.flatMap((s) => s.points.map((p) => p[0]))),
    ].sort((a, b) => a - b);
    expect(rows).toHaveLength(xs.length);
    // Spot check: the last row carries the last point of the first line.
    const lastRow = rows[rows.length - 1].split(",");
    const lastX = xs[xs.length - 1];
    expect(Number(lastRow[0])).toBe(lastX);
    const v = seriesValue(id, file.series[0].name, lastX);
    const cell = lastRow[1];
    if (v === undefined) expect(cell).toBe("");
    else expect(Number(cell)).toBe(v);
  });
});

describe("seriesValue", () => {
  it("reads a point by line name and x, or undefined", () => {
    expect(seriesValue("electricity_access_pct", "Nigeria", 2024)).toBeCloseTo(
      62.5,
      0,
    );
    expect(
      seriesValue("electricity_access_pct", "Nigeria", 1066),
    ).toBeUndefined();
    expect(
      seriesValue("electricity_access_pct", "Atlantis", 2024),
    ).toBeUndefined();
  });
});
