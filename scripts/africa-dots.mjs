/**
 * The dotted Africa (Contact hero): one <path> of dots derived from Natural
 * Earth 1:110m countries (public domain), continent "Africa".
 *
 *   node scripts/africa-dots.mjs [--source=<ne_110m_countries.geojson>] [--step=1.5]
 *
 * Writes public/images/africa-dots.svg. The dots are zero-length subpaths
 * with round caps, so a thousand dots cost about seven bytes each. The
 * projection is plate carree (x = lon + 19, y = 39 - lat on a 72 x 76
 * viewBox); src/lib/figures/africa.ts has the same numbers for pins.
 *
 * The geojson is not kept in the repo (3 MB); pass --source to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public/images/africa-dots.svg");

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const source = arg("source", process.env.NE_COUNTRIES_GEOJSON ?? "");
const step = Number(arg("step", "1.5"));

if (!fs.existsSync(source)) {
  console.error(
    `Natural Earth file not found: ${source || "(none given)"}\n` +
      "Pass --source=<ne_110m countries GeoJSON> or set NE_COUNTRIES_GEOJSON.",
  );
  process.exit(1);
}

// Keep in step with src/lib/figures/africa.ts.
const VIEW = { width: 72, height: 76 };
const project = (lat, lon) => [lon + 19, 39 - lat];

const geo = JSON.parse(fs.readFileSync(source, "utf8"));
const africa = geo.features.filter((f) => f.properties.CONTINENT === "Africa");
const rings = [];
for (const f of africa) {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const poly of polys) rings.push(poly); // [outer, ...holes]
}

const inRing = (lon, lat, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
};
const onLand = (lon, lat) =>
  rings.some(
    ([outer, ...holes]) =>
      inRing(lon, lat, outer) && !holes.some((h) => inRing(lon, lat, h)),
  );

// Staggered grid: odd rows shift by half a step so the texture reads as
// fabric rather than graph paper.
const dots = [];
let row = 0;
for (let lat = 37.5; lat >= -35.5; lat -= step, row++) {
  const offset = row % 2 ? step / 2 : 0;
  for (let lon = -18 + offset; lon <= 52; lon += step) {
    if (onLand(lon, lat)) dots.push(project(lat, lon));
  }
}

// Relative moves keep every dot to a few bytes.
const r1 = (v) => {
  const s = v.toFixed(1).replace(/\.0$/, "");
  return s === "-0" ? "0" : s;
};
let d = "";
let px = 0;
let py = 0;
for (const [x, y] of dots) {
  d += `m${r1(x - px)} ${r1(y - py)}h0`;
  px = Number(r1(x - px)) + px;
  py = Number(r1(y - py)) + py;
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="Africa, drawn as a grid of dots">` +
  `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="${r1(step * 0.56)}" stroke-linecap="round"/>` +
  `</svg>\n`;

fs.writeFileSync(out, svg);
console.log(
  `${dots.length} dots, ${Buffer.byteLength(svg)} bytes -> ${path.relative(root, out)}`,
);
