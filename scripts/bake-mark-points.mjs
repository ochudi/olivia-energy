/**
 * Bake the Ignition particle targets (About hero, P5).
 *
 *   node scripts/bake-mark-points.mjs [--count=9000]
 *
 * Rasterises the three paths of the mark (src/lib/brand/mark.ts) with sharp,
 * resolves paint order (lime, then red, then ring on top), and samples about
 * `count` points on a jittered grid so the particles cover the mark evenly.
 * Re-run after any change to the mark.
 *
 * Writes public/data/mark-points.bin, little-endian:
 *   bytes 0..3   "OEM1"
 *   bytes 4..5   u16 point count
 *   bytes 6..7   u16 grid pitch in thousandths of a mark unit (72 x 100 box)
 *   then 3 bytes per point, a u24: x (11 bits, 0..2047 over 0..72),
 *   y (11 bits, 0..2047 over 0..100, top down), colour (2 bits: 0 lime,
 *   1 red, 2 ring green). Points are shuffled with a fixed seed, so the file
 *   is reproducible.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "public/data/mark-points.bin");
const LIMIT = 40 * 1024;

const target = Number(
  process.argv.find((a) => a.startsWith("--count="))?.slice(8) ?? 9000,
);

const source = await fs.readFile(
  path.join(root, "src/lib/brand/mark.ts"),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const {
  MARK_WIDTH: W,
  MARK_HEIGHT: H,
  MARK_PATHS,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

/** Raster scale: pixels per mark unit. 12 gives an 864 x 1200 mask. */
const S = 12;
const PW = W * S;
const PH = H * S;

async function mask(d) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="#fff"/></svg>`;
  const { data, info } = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = new Uint8Array(info.width * info.height);
  for (let i = 0; i < out.length; i++) out[i] = data[i * info.channels + 3];
  return out;
}

// Paint order lime, red, ring: a later path wins where they overlap.
const layers = [
  await mask(MARK_PATHS.lime),
  await mask(MARK_PATHS.red),
  await mask(MARK_PATHS.ring),
];
/** Colour index at a point in mark units, or -1 outside the mark. */
function colourAt(x, y) {
  const px = Math.min(PW - 1, Math.max(0, Math.floor(x * S)));
  const py = Math.min(PH - 1, Math.max(0, Math.floor(y * S)));
  const i = py * PW + px;
  for (let c = 2; c >= 0; c--) if (layers[c][i] >= 128) return c;
  return -1;
}

/** Mulberry32: a small seeded generator, so the bake is reproducible. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(pitch) {
  const rand = rng(20261003);
  const pts = [];
  for (let gy = 0; gy * pitch < H; gy++) {
    for (let gx = 0; gx * pitch < W; gx++) {
      // Jitter within the middle 70% of the cell: even cover, no grid moiré.
      const x = (gx + 0.15 + rand() * 0.7) * pitch;
      const y = (gy + 0.15 + rand() * 0.7) * pitch;
      if (x >= W || y >= H) continue;
      const c = colourAt(x, y);
      if (c >= 0) pts.push([x, y, c]);
    }
  }
  return pts;
}

// Find the grid pitch that gives the target count (count falls as pitch grows).
let lo = 0.1;
let hi = 3;
for (let i = 0; i < 30; i++) {
  const mid = (lo + hi) / 2;
  if (sample(mid).length > target) lo = mid;
  else hi = mid;
}
const pitch = hi;
const points = sample(pitch);

// Shuffle with a fixed seed so the draw order carries no spatial pattern.
const rand = rng(72100);
for (let i = points.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [points[i], points[j]] = [points[j], points[i]];
}

const buf = Buffer.alloc(8 + points.length * 3);
buf.write("OEM1", 0, "ascii");
buf.writeUInt16LE(points.length, 4);
buf.writeUInt16LE(Math.round(pitch * 1000), 6);
const counts = [0, 0, 0];
points.forEach(([x, y, c], i) => {
  const qx = Math.round((x / W) * 2047);
  const qy = Math.round((y / H) * 2047);
  const v = qx | (qy << 11) | (c << 22);
  buf.writeUIntLE(v, 8 + i * 3, 3);
  counts[c]++;
});

if (buf.length > LIMIT) {
  console.error(`mark-points.bin would be ${buf.length} bytes, over ${LIMIT}`);
  process.exit(1);
}
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, buf);
console.log(
  `wrote ${path.relative(root, OUT)}: ${points.length} points ` +
    `(lime ${counts[0]}, red ${counts[1]}, ring ${counts[2]}), ` +
    `pitch ${pitch.toFixed(3)} units, ${buf.length} bytes`,
);
