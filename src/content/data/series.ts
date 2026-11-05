/**
 * Verified data series for the figures. Each JSON file is a verbatim copy of
 * the research team's file (scripts/build-figure-data.mjs); points are never
 * recomputed here. The matching CSV lives at /data/<id>.csv.
 */
import type { SeriesId } from "@/types/contracts";
import brent_crude_annual from "./series/brent_crude_annual.json";
import brent_crude_monthly from "./series/brent_crude_monthly.json";
import co2_per_capita from "./series/co2_per_capita.json";
import electricity_access_pct from "./series/electricity_access_pct.json";
import electricity_per_person from "./series/electricity_per_person.json";
import energy_per_person from "./series/energy_per_person.json";
import generation_by_source_africa from "./series/generation_by_source_africa.json";
import generation_by_source_nigeria from "./series/generation_by_source_nigeria.json";
import low_carbon_share_electricity from "./series/low_carbon_share_electricity.json";
import people_without_electricity from "./series/people_without_electricity.json";
import solar_pv_capacity_gw from "./series/solar_pv_capacity_gw.json";
import solar_pv_module_price from "./series/solar_pv_module_price.json";
import temperature_anomaly from "./series/temperature_anomaly.json";

/** One `[x, y]` pair: x a year (or a decimal year), y the value. */
export type SeriesPoint = readonly [number, number];

/** One named line: points in ascending x. */
export type Series = {
  name: string;
  points: readonly SeriesPoint[];
};

export type SeriesFile = {
  id: SeriesId;
  title: string;
  unit: string;
  geography?: string;
  source_org: string;
  source_url: string;
  licence: string;
  /** ISO date the data was retrieved. */
  retrieved: string;
  notes?: string;
  series: readonly Series[];
};

/** The shape TypeScript infers from a research JSON file. */
type RawSeriesFile = {
  id: string;
  title: string;
  unit: string;
  geography?: string;
  source_org: string;
  source_url: string;
  licence: string;
  retrieved: string;
  notes?: string;
  series: { name: string; points: number[][] }[];
};

/**
 * Checks a JSON import against the series contract once, at module load,
 * and narrows `number[][]` to pairs. A malformed file fails loudly here
 * rather than as a NaN in a chart path.
 */
function validate(id: SeriesId, raw: RawSeriesFile): SeriesFile {
  if (raw.id !== id) {
    throw new Error(`Series file ${id}.json declares id "${raw.id}"`);
  }
  const series: Series[] = raw.series.map((s) => ({
    name: s.name,
    points: s.points.map((p, i): SeriesPoint => {
      if (p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) {
        throw new Error(`Series ${id} "${s.name}" point ${i} is not [x, y]`);
      }
      return [p[0], p[1]];
    }),
  }));
  return { ...raw, id, series };
}

const FILES: Record<SeriesId, SeriesFile> = {
  brent_crude_annual: validate("brent_crude_annual", brent_crude_annual),
  brent_crude_monthly: validate("brent_crude_monthly", brent_crude_monthly),
  co2_per_capita: validate("co2_per_capita", co2_per_capita),
  electricity_access_pct: validate(
    "electricity_access_pct",
    electricity_access_pct,
  ),
  electricity_per_person: validate(
    "electricity_per_person",
    electricity_per_person,
  ),
  energy_per_person: validate("energy_per_person", energy_per_person),
  generation_by_source_africa: validate(
    "generation_by_source_africa",
    generation_by_source_africa,
  ),
  generation_by_source_nigeria: validate(
    "generation_by_source_nigeria",
    generation_by_source_nigeria,
  ),
  low_carbon_share_electricity: validate(
    "low_carbon_share_electricity",
    low_carbon_share_electricity,
  ),
  people_without_electricity: validate(
    "people_without_electricity",
    people_without_electricity,
  ),
  solar_pv_capacity_gw: validate("solar_pv_capacity_gw", solar_pv_capacity_gw),
  solar_pv_module_price: validate(
    "solar_pv_module_price",
    solar_pv_module_price,
  ),
  temperature_anomaly: validate("temperature_anomaly", temperature_anomaly),
};

export const SERIES_IDS = Object.keys(FILES) as SeriesId[];

export function getSeries(id: SeriesId): SeriesFile {
  return FILES[id];
}

/** The named line of a series file, or undefined if the name is unknown. */
export function getLine(id: SeriesId, name: string): Series | undefined {
  return FILES[id].series.find((s) => s.name === name);
}

/** The y value of a named line at x, or undefined if there is no point there. */
export function seriesValue(
  id: SeriesId,
  name: string,
  x: number,
): number | undefined {
  const line = getLine(id, name);
  if (!line) return undefined;
  const hit = line.points.find((p) => p[0] === x);
  return hit ? hit[1] : undefined;
}
