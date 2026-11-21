#!/usr/bin/env node
/**
 * Prepares the firm's three heritage photographs (the first station, its
 * sign, the retail team) for About, section "Real-world operations".
 *
 *   node scripts/heritage-photos.mjs <folder with station.png, billboard.png, staff.png>
 *
 * Documentary photographs: exposure and white balance only, never a
 * stylistic grade, never enlarged, no sharpening. Each correction is a
 * per-channel gain measured on a neutral surface in the frame (`gain`, R G
 * B); a photograph that already reads neutral is passed through. sRGB JPEG
 * at quality 88, metadata stripped. next/image serves the AVIF and WebP sizes.
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/images/heritage");
const SRC = process.argv[2] ?? "";
if (!SRC || !existsSync(SRC)) {
  console.error(
    "Usage: node scripts/heritage-photos.mjs <folder with the sources>",
  );
  process.exit(1);
}

const PHOTOS = [
  // The forecourt at night: the white pillars read neutral (244, 245, 245).
  { source: "station.png", out: "station-night.jpg", gain: null },
  // Overcast daylight: the white wall reads neutral (213, 213, 211).
  { source: "billboard.png", out: "station-sign.jpg", gain: null },
  // The white wall reads cool (189, 193, 200) and the highlights stop near
  // 219: balanced on the wall, then lifted so they reach about 240.
  { source: "staff.png", out: "retail-team.jpg", gain: [1.15, 1.13, 1.09] },
];

await mkdir(OUT, { recursive: true });
for (const { source, out, gain } of PHOTOS) {
  const file = path.join(SRC, source);
  if (!existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }
  let image = sharp(file).removeAlpha().toColourspace("srgb");
  if (gain) image = image.linear(gain, [0, 0, 0]);
  const info = await image
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(path.join(OUT, out));
  console.log(`${out}: ${info.width}x${info.height}, ${info.size} bytes`);
}
