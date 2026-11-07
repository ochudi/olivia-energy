#!/usr/bin/env node
/**
 * Crops the founder's two supplied portraits into square, face-centred masters.
 *
 *   node scripts/portraits.mjs <folder holding suit.png and academic.png>
 *
 * Portraits get no stylistic grade: a square crop, a resize to 1120 px (never
 * enlarged), one light unsharp mask and sRGB JPEG at quality 92, so skin tones
 * stay as supplied. next/image serves the AVIF and WebP sizes at request time.
 * Deterministic: the same sources give the same files.
 *
 * Crop windows are in source pixels, measured so the whole head sits in the
 * circle the page cuts from the square, with the same margin above the hair
 * (or the cap) and below the beard.
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/founder");
const SRC = process.argv[2] ?? "";
if (!SRC || !existsSync(SRC)) {
  console.error("Usage: node scripts/portraits.mjs <folder with the sources>");
  process.exit(1);
}

const SIZE = 1120;
const PORTRAITS = [
  {
    source: "suit.png",
    out: "olugbenga-olaoye-suit.jpg",
    crop: { left: 5, top: 60, size: 1120 },
  },
  {
    source: "academic.png",
    out: "olugbenga-olaoye-academic.jpg",
    crop: { left: 160, top: 0, size: 1250 },
  },
];

await mkdir(OUT, { recursive: true });
for (const { source, out, crop } of PORTRAITS) {
  const file = path.join(SRC, source);
  if (!existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }
  const info = await sharp(file)
    .extract({
      left: crop.left,
      top: crop.top,
      width: crop.size,
      height: crop.size,
    })
    .resize(SIZE, SIZE, { kernel: "lanczos3" })
    .removeAlpha()
    .toColourspace("srgb")
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 0.4 })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(path.join(OUT, out));
  console.log(`${out}: ${info.width}x${info.height}, ${info.size} bytes`);
}
