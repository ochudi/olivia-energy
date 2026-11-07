#!/usr/bin/env node
/**
 * Grades and crops the twelve photographs for the "Bridging Light" rebuild.
 *
 *   node scripts/grade-photos.mjs [--sheet=<contact-sheet.jpg>]
 *
 * Deterministic and re-runnable: the same source files give byte-identical
 * output. Source folders come from PHOTO_SRC_AFRICA and PHOTO_SRC_FIRST (the
 * original downloads; see /credits for each photograph's source page).
 *
 * Grade, applied once per crop, in this order:
 *   1. resize to at most 2400 px on the long edge (never enlarged)
 *   2. per-channel linear curve  R 1.05x - 6, G 0.98x + 6, B 0.93x + 2
 *   3. contrast                  1.06x - 7.7
 *   4. saturation +8%            modulate({ saturation: 1.08 })
 *   5. sRGB, metadata stripped, JPEG quality 82
 * Each step runs on its own 8-bit buffer so the order cannot be reshuffled by
 * sharp's internal pipeline. Crops follow CSS object-position semantics: a
 * focal point of 60% / 58% places 60% of the horizontal and 58% of the
 * vertical overflow before the crop window.
 *
 * Output: public/images/photos/<key>-<ratio>.jpg, the two hero WebPs, and
 * public/images/photos/manifest.json (sizes, focal points, blur placeholders)
 * which src/content/images.ts is written from.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/images/photos");
const AFRICA = process.env.PHOTO_SRC_AFRICA ?? "";
const FIRST = process.env.PHOTO_SRC_FIRST ?? "";
if (!AFRICA || !FIRST || !existsSync(AFRICA) || !existsSync(FIRST)) {
  console.error(
    "Set PHOTO_SRC_AFRICA and PHOTO_SRC_FIRST to the folders holding the original photographs.",
  );
  process.exit(1);
}

const MAX_EDGE = 2400;
const JPEG_QUALITY = 82;
const sheetArg = process.argv.find((a) => a.startsWith("--sheet="));
const SHEET = sheetArg ? sheetArg.slice("--sheet=".length) : null;

/**
 * One row per delivered crop. `ratio` is "w:h". `region` limits the crop to a
 * part of the source (fractions of its width and height). `focal` is
 * object-position style, in percent. `retouch` and `lift` are named steps
 * below.
 */
const CROPS = [
  {
    key: "lagos-third-mainland",
    // The 3911 px Commons original if it is present, else the 2400 px copy.
    file: [
      [AFRICA, "nigeria-lagos-third-mainland-sunset-orig3911.jpg"],
      [AFRICA, "nigeria-lagos-third-mainland-sunset.jpg"],
    ],
    outputs: [
      { ratio: "16:9", name: "16x9", focal: [60, 58] },
      { ratio: "9:16", name: "9x16", focal: [55, 52] },
    ],
  },
  {
    key: "tarfaya-wind",
    file: [[AFRICA, "wind-morocco-tarfaya-golden.jpg"]],
    outputs: [{ ratio: "4:5", name: "4x5", focal: [50, 35] }],
  },
  {
    key: "abuja-city-gate",
    file: [[AFRICA, "nigeria-abuja-citygate-sunset.jpg"]],
    outputs: [{ ratio: "4:5", name: "4x5", focal: [40, 55] }],
  },
  {
    key: "bayelsa-flare",
    file: [[AFRICA, "nigeria-bayelsa-gas-flare.jpg"]],
    outputs: [{ ratio: "4:5", name: "4x5", focal: [35, 62] }],
  },
  {
    key: "lagos-market",
    file: [[FIRST, "africa-light-market-aerial.jpg"]],
    // Focal y is 0 so the yellow bus, which runs to the top of the frame, is whole.
    outputs: [{ ratio: "4:5", name: "4x5", focal: [50, 0] }],
  },
  {
    key: "lecture-hall",
    file: [[FIRST, "capacity-auditorium.jpg"]],
    // The right 60% only: the seated woman in profile at the left is cropped out.
    outputs: [
      {
        ratio: "4:5",
        name: "4x5",
        focal: [70, 50],
        region: { x: 0.4, y: 0, w: 0.6, h: 1 },
      },
    ],
  },
  {
    key: "ethiopia-lineman",
    file: [[AFRICA, "grid-ethiopia-hvdc-lineman.jpg"]],
    outputs: [{ ratio: "4:5", name: "4x5", focal: [45, 45] }],
  },
  {
    key: "lagos-lekki-night",
    file: [[FIRST, "hero-lagos-bridge-night.jpg"]],
    outputs: [{ ratio: "16:9", name: "16x9", focal: [70, 60], lift: true }],
  },
  {
    key: "abuja-lightpoles",
    file: [[AFRICA, "nigeria-abuja-lightpoles-sunset.jpg"]],
    outputs: [
      { ratio: "21:9", name: "21x9", focal: [50, 72] },
      { ratio: "4:5", name: "4x5", focal: [50, 30] },
    ],
  },
  {
    key: "bonny-night",
    file: [[AFRICA, "nigeria-bonny-lng-night.jpg"]],
    retouch: "bonny-lens-ghost",
    outputs: [{ ratio: "3:2", name: "3x2", focal: [50, 50] }],
  },
  {
    key: "noor-solar",
    file: [[AFRICA, "solar-morocco-noor3-dusk.jpg"]],
    // The right 60%: most of the low-sun flare at the left is cropped out.
    outputs: [
      {
        ratio: "3:2",
        name: "3x2",
        focal: [70, 50],
        region: { x: 0.4, y: 0, w: 0.6, h: 1 },
      },
    ],
  },
  {
    key: "nanyuki-pylon",
    file: [[AFRICA, "grid-kenya-nanyuki-pylon-moon.jpg"]],
    outputs: [{ ratio: "3:2", name: "3x2", focal: [60, 50] }],
  },
];

/** Hand-encoded hero files for the home page (P1), at their byte caps. */
const HEROES = [
  {
    name: "lagos-third-mainland-1920.webp",
    from: "16x9",
    width: 1920,
    cap: 120_000,
  },
  {
    name: "lagos-third-mainland-828.webp",
    from: "9x16",
    width: 828,
    cap: 35_000,
  },
];

const clamp8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

async function loadSource(candidates) {
  for (const [dir, name] of candidates) {
    const file = path.join(dir, name);
    if (existsSync(file)) {
      const { data, info } = await sharp(file)
        .rotate()
        .toColourspace("srgb")
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { data, width: info.width, height: info.height, file, name };
    }
  }
  throw new Error(
    `No source found among ${candidates.map((c) => c[1]).join(", ")}`,
  );
}

/** Replaces the red lens ghost on the Bonny frame with clean sky from its left. */
function retouchBonnyLensGhost(src) {
  const { data, width, height } = src;
  const cx = 863;
  const cy = 650;
  const rx = 62;
  const ry = 108;
  const shift = 165;
  const copy = Buffer.from(data);
  const x0 = Math.max(0, cx - rx);
  const x1 = Math.min(width - 1, cx + rx);
  const y0 = Math.max(0, cy - ry);
  const y1 = Math.min(height - 1, cy + ry);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (d >= 1) continue;
      // smoothstep feather: solid in the middle 55%, fading to nothing at the rim
      const t = Math.min(1, (1 - d) / 0.45);
      const a = t * t * (3 - 2 * t);
      const o = (y * width + x) * 3;
      const s = (y * width + (x - shift)) * 3;
      for (let c = 0; c < 3; c++) {
        data[o + c] = clamp8(copy[o + c] * (1 - a) + copy[s + c] * a);
      }
    }
  }
}

function cropRect(src, out) {
  const region = out.region ?? { x: 0, y: 0, w: 1, h: 1 };
  const rx = Math.round(region.x * src.width);
  const ry = Math.round(region.y * src.height);
  const rw = Math.round(region.w * src.width);
  const rh = Math.round(region.h * src.height);
  const [aw, ah] = out.ratio.split(":").map(Number);
  let cw = rw;
  let ch = Math.round((rw * ah) / aw);
  if (ch > rh) {
    ch = rh;
    cw = Math.round((rh * aw) / ah);
  }
  const left = rx + Math.round(((out.focal[0] ?? 50) / 100) * (rw - cw));
  const top = ry + Math.round(((out.focal[1] ?? 50) / 100) * (rh - ch));
  const scale = Math.min(1, MAX_EDGE / Math.max(cw, ch));
  return {
    left,
    top,
    width: cw,
    height: ch,
    outWidth: Math.round(cw * scale),
    outHeight: Math.round(ch * scale),
  };
}

async function rawOf(pipeline) {
  const { data, info } = await pipeline
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const asRaw = (b) =>
  sharp(b.data, { raw: { width: b.width, height: b.height, channels: 3 } });

/** The grade, one 8-bit step at a time. */
async function grade(buf, { lift }) {
  let cur = buf;
  // 2. per-channel linear curve
  cur = await rawOf(asRaw(cur).linear([1.05, 0.98, 0.93], [-6, 6, 2]));
  // 3. contrast
  cur = await rawOf(asRaw(cur).linear(1.06, -7.7));
  // 4. saturation +8%
  cur = await rawOf(asRaw(cur).modulate({ saturation: 1.08 }));
  if (lift) {
    // Lift shadows only (Lekki bridge, very dark): gamma 1.45 with a small black point.
    const inv = 1 / 1.45;
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++)
      lut[i] = clamp8(8 + 247 * Math.pow(i / 255, inv));
    const d = Buffer.from(cur.data);
    for (let i = 0; i < d.length; i++) d[i] = lut[d[i]];
    cur = { data: d, width: cur.width, height: cur.height };
  }
  return cur;
}

const jpeg = (b) =>
  asRaw(b)
    .toColourspace("srgb")
    .jpeg({
      quality: JPEG_QUALITY,
      progressive: true,
      chromaSubsampling: "4:2:0",
    })
    .toBuffer();

async function blurDataUrl(b) {
  const buf = await asRaw(b)
    .resize({ width: 16, kernel: "lanczos3" })
    .webp({ quality: 40, effort: 6 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function webpUnderCap(srcJpeg, width, cap) {
  const meta = await sharp(srcJpeg).metadata();
  const height = Math.round((meta.height * width) / meta.width);
  const encode = (q) =>
    sharp(srcJpeg)
      .resize(width, height, { kernel: "lanczos3" })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
  let lo = 1;
  let hi = 100;
  let best = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const buf = await encode(mid);
    if (buf.length <= cap) {
      best = { buf, quality: mid };
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (!best) throw new Error(`Cannot meet ${cap} bytes at ${width} px`);
  return { ...best, width, height };
}

const md5 = (b) => createHash("md5").update(b).digest("hex");

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest = {
    generator: "scripts/grade-photos.mjs",
    photos: {},
    heroes: {},
  };
  const sheetRows = [];
  const jpegs = {};

  for (const crop of CROPS) {
    const src = await loadSource(crop.file);
    const original = {
      data: Buffer.from(src.data),
      width: src.width,
      height: src.height,
    };
    if (crop.retouch === "bonny-lens-ghost") retouchBonnyLensGhost(src);
    manifest.photos[crop.key] = {
      source: src.name,
      sourceSize: [src.width, src.height],
      crops: {},
    };
    for (const out of crop.outputs) {
      const r = cropRect(src, out);
      const resized = await rawOf(
        asRaw(src)
          .extract({
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
          })
          .resize(r.outWidth, r.outHeight, { kernel: "lanczos3" }),
      );
      const graded = await grade(resized, { lift: Boolean(out.lift) });
      const jpg = await jpeg(graded);
      const fileName = `${crop.key}-${out.name}.jpg`;
      await writeFile(path.join(OUT, fileName), jpg);
      jpegs[fileName] = jpg;
      manifest.photos[crop.key].crops[out.name] = {
        file: `/images/photos/${fileName}`,
        width: graded.width,
        height: graded.height,
        focal: `${out.focal[0]}% ${out.focal[1]}%`,
        bytes: jpg.length,
        md5: md5(jpg),
        blurDataURL: await blurDataUrl(graded),
      };
      // Before: the same crop of the untouched source, for the contact sheet.
      const before = await rawOf(
        asRaw(original)
          .extract({
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
          })
          .resize(r.outWidth, r.outHeight, { kernel: "lanczos3" }),
      );
      sheetRows.push({
        label: `${crop.key} ${out.ratio}`,
        before,
        after: graded,
      });
    }
  }

  for (const hero of HEROES) {
    const jpg = jpegs[`lagos-third-mainland-${hero.from}.jpg`];
    const w = await webpUnderCap(jpg, hero.width, hero.cap);
    await writeFile(path.join(OUT, hero.name), w.buf);
    manifest.heroes[hero.name] = {
      file: `/images/photos/${hero.name}`,
      width: w.width,
      height: w.height,
      quality: w.quality,
      bytes: w.buf.length,
      cap: hero.cap,
      md5: md5(w.buf),
    };
  }

  await writeFile(
    path.join(OUT, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  if (SHEET) await contactSheet(sheetRows, SHEET);

  for (const [key, p] of Object.entries(manifest.photos)) {
    for (const [name, c] of Object.entries(p.crops)) {
      console.log(
        `${key}-${name}.jpg  ${c.width}x${c.height}  ${(c.bytes / 1024).toFixed(0)} KB  focal ${c.focal}`,
      );
    }
  }
  for (const [name, h] of Object.entries(manifest.heroes)) {
    console.log(
      `${name}  ${h.width}x${h.height}  ${h.bytes} bytes (cap ${h.cap}, q${h.quality})`,
    );
  }
}

/** Before and after for every crop, two pairs per row, each cell labelled. */
async function contactSheet(rows, file) {
  const cell = 380;
  const label = 24;
  const pad = 12;
  const pairW = cell * 2 + pad;
  const rowH = cell + label + pad;
  const perRow = 2;
  const width = pad + perRow * (pairW + pad);
  const gridRows = Math.ceil(rows.length / perRow);
  const tiles = [];
  for (let i = 0; i < rows.length; i++) {
    const left0 = pad + (i % perRow) * (pairW + pad);
    const top = pad + Math.floor(i / perRow) * rowH;
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pairW}" height="${label}"><text x="0" y="17" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#e8efe9">${rows[i].label}   before (left), after (right)</text></svg>`,
    );
    tiles.push({ input: svg, left: left0, top });
    for (const [j, side] of ["before", "after"].entries()) {
      const img = await asRaw(rows[i][side])
        .resize(cell, cell, { fit: "contain", background: "#0b1a12" })
        .jpeg({ quality: 88 })
        .toBuffer();
      tiles.push({
        input: img,
        left: left0 + j * (cell + pad),
        top: top + label,
      });
    }
  }
  await mkdir(path.dirname(file), { recursive: true });
  await sharp({
    create: {
      width,
      height: pad + gridRows * rowH,
      channels: 3,
      background: "#0b1a12",
    },
  })
    .composite(tiles)
    .jpeg({ quality: 85 })
    .toFile(file);
}

await main();
