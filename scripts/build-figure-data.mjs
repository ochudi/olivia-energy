/**
 * Figure data: copies the verified research series into the site, writes a
 * CSV for each ("Get the data"), and generates the typed facts module.
 * Re-runnable; a second run with the same inputs changes nothing.
 *
 *   node scripts/build-figure-data.mjs [--from=<research dir>]
 *
 * Inputs
 *   <research dir>/data/<SeriesId>.json   research format: { id, title, unit,
 *                                         source_org, source_url, licence,
 *                                         retrieved, series: [{ name, points }] }
 *   <research dir>/facts.json             { facts: [{ id, verdict, claim, ... }] }
 *
 *   When --from is omitted, RESEARCH_DIR is used if it is set and exists;
 *   otherwise the copies already in the repo are the inputs, so the CSVs and
 *   facts.ts can always be regenerated.
 *
 * Outputs
 *   src/content/data/series/<SeriesId>.json  points copied, never recomputed
 *   src/content/data/facts.json              confirmed and corrected facts only
 *   src/content/data/facts.ts                FACTS: Record<FactId, Fact>
 *   public/data/<SeriesId>.csv               header "year,<series names>"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seriesDir = path.join(root, "src/content/data/series");
const csvDir = path.join(root, "public/data");
const factsJson = path.join(root, "src/content/data/facts.json");
const factsTs = path.join(root, "src/content/data/facts.ts");

const RESEARCH_DIR = process.env.RESEARCH_DIR ?? "";
const RETRIEVED = "2026-10-02";

const fromArg = process.argv.find((a) => a.startsWith("--from="));
const from = fromArg
  ? path.resolve(fromArg.slice(7))
  : RESEARCH_DIR && fs.existsSync(path.join(RESEARCH_DIR, "data"))
    ? path.resolve(RESEARCH_DIR)
    : null;

const written = [];
const unchanged = [];
function write(file, text) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === text) {
    unchanged.push(path.relative(root, file));
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  written.push(path.relative(root, file));
}

/* ---------------- series ---------------- */

fs.mkdirSync(seriesDir, { recursive: true });
if (from) {
  const sourceDir = path.join(from, "data");
  for (const name of fs.readdirSync(sourceDir).sort()) {
    if (!name.endsWith(".json")) continue;
    const raw = fs.readFileSync(path.join(sourceDir, name), "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.series)) continue;
    const text = data.retrieved
      ? raw
      : JSON.stringify({ ...data, retrieved: RETRIEVED }, null, 1) + "\n";
    write(path.join(seriesDir, `${data.id}.json`), text);
  }
}

const seriesFiles = fs
  .readdirSync(seriesDir)
  .filter((f) => f.endsWith(".json"))
  .sort();
if (seriesFiles.length === 0) {
  console.error("No series files found; pass --from=<research dir>.");
  process.exit(1);
}

const csvCell = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

for (const file of seriesFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(seriesDir, file), "utf8"));
  const xs = [
    ...new Set(data.series.flatMap((s) => s.points.map((p) => p[0]))),
  ].sort((a, b) => a - b);
  const lookup = data.series.map((s) => new Map(s.points));
  const lines = [
    ["year", ...data.series.map((s) => s.name)].map(csvCell).join(","),
    ...xs.map((x) =>
      [x, ...lookup.map((m) => (m.has(x) ? m.get(x) : null))]
        .map(csvCell)
        .join(","),
    ),
  ];
  write(path.join(csvDir, `${data.id}.csv`), lines.join("\n") + "\n");
}

/* ---------------- facts ---------------- */

if (from) {
  const research = JSON.parse(
    fs.readFileSync(path.join(from, "facts.json"), "utf8"),
  );
  const kept = research.facts
    .filter((f) => f.verdict === "confirmed" || f.verdict === "corrected")
    .map((f) => ({
      id: f.id,
      status: f.verdict,
      statement: f.claim,
      value: f.value,
      unit: f.unit,
      year: f.year,
      source_org: f.source_org,
      source_url: f.source_url,
      quote: f.quote,
      notes: f.notes,
      retrieved: f.retrieved ?? RETRIEVED,
    }));
  write(
    factsJson,
    JSON.stringify({ retrieved: RETRIEVED, facts: kept }, null, 2) + "\n",
  );
}

const facts = JSON.parse(fs.readFileSync(factsJson, "utf8")).facts;
const lit = (s) => JSON.stringify(s);

/**
 * House style for a printed statement (the house rules):
 * no en or em dashes (a numeric range reads "1850 to 1900"), and the source
 * institution stays in the source line, never in the prose. The research
 * claim in facts.json is left as checked; only the printed form changes.
 */
const PROSE_CITATIONS =
  /\s*\((?:World Bank|AfDB|African Development Bank|UNDP)(?:, \d{4})?\)/g;
function houseStyle(statement) {
  return statement
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2")
    .replace(/\s*[–—]\s*/g, ", ")
    .replace(PROSE_CITATIONS, "")
    .replace(/\s+([.,;:])/g, "$1");
}

const entries = facts
  .map(
    (f) => `  ${lit(f.id)}: {
    id: ${lit(f.id)},
    statement: ${lit(houseStyle(f.statement))},
    source: { org: ${lit(f.source_org)}, url: ${lit(f.source_url)} },
    retrieved: ${lit(f.retrieved)},
    status: ${lit(f.status)},
  },`,
  )
  .join("\n");

const factsSource = `/**
 * Verified facts for the figures and numeral cards. GENERATED by
 * scripts/build-figure-data.mjs from src/content/data/facts.json (itself a
 * filtered copy of the research team's facts.json: confirmed and corrected
 * only). Do not edit by hand; re-run the script.
 */
import type { FactId, SourceRef } from "@/types/contracts";

export type Fact = {
  id: FactId;
  /** The verified claim, as checked against the source. */
  statement: string;
  source: SourceRef;
  /** ISO date the source was retrieved. */
  retrieved: string;
  status: "confirmed" | "corrected";
};

export const FACTS: Record<FactId, Fact> = {
${entries}
};

/** Every verified fact, in research order. */
export const FACT_LIST: readonly Fact[] = Object.values(FACTS);
`;
write(
  factsTs,
  await prettier.format(factsSource, {
    ...(await prettier.resolveConfig(factsTs)),
    filepath: factsTs,
  }),
);

console.log(
  `${written.length} file(s) written, ${unchanged.length} unchanged` +
    (from ? ` (source: ${from})` : " (source: repo copies)"),
);
for (const f of written) console.log("  wrote", f);
