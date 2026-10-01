/**
 * Brand assets: writes every static file of the mark from the single source
 * of truth, src/lib/brand/mark.ts. Re-run after any change to that file.
 *
 *   node scripts/brand-assets.mjs
 *
 * Writes (sizes in px):
 *   public/brand/mark.svg              full-colour mark
 *   public/brand/mark-mono.svg         one colour, fill="currentColor"
 *   public/brand/mark-inverse.svg      one colour in off-white, for dark grounds
 *   public/brand/logo-512.png          mark on white, 512², clear space kept (schema.org)
 *   public/brand/mark-128.png          mark 128 tall, transparent (email header)
 *   public/brand/icon-192.png          web app icon, transparent
 *   public/brand/icon-512.png          web app icon, transparent
 *   public/brand/maskable-512.png      off-white mark on green-950, inside the maskable safe zone
 *   public/brand/apple-touch-icon.png  180², white tile
 *   public/brand/kit/mark.svg, kit/mark-mono.svg   copies for the client kit
 *   src/app/icon.svg                   favicon construction (16–32px)
 *   src/app/apple-icon.png             same as apple-touch-icon.png
 *   src/app/favicon.ico                the favicon at 16, 32 and 48, for clients that ask for /favicon.ico
 *
 * mark.ts is TypeScript; it has no imports, so it is transpiled in memory
 * with the project's own compiler and imported from a data: URL.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
const mark = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const {
  MARK_WIDTH,
  MARK_HEIGHT,
  MARK_VIEWBOX,
  MARK_COLORS,
  MARK_PATHS,
  MARK_MONO_PATH,
  MARK_INVERSE,
  MARK_RULES,
  markSvg,
  faviconSvg,
} = mark;

const GREEN_950 = "#002210";
const WHITE = "#FFFFFF";

/** Mark body for a tone, as SVG elements in mark coordinates. */
function body(tone) {
  if (tone === "color") {
    return (
      `<path fill="${MARK_COLORS.lime}" d="${MARK_PATHS.lime}"/>` +
      `<path fill="${MARK_COLORS.red}" d="${MARK_PATHS.red}"/>` +
      `<path fill="${MARK_COLORS.green}" d="${MARK_PATHS.ring}"/>`
    );
  }
  return `<path fill="${tone}" d="${MARK_MONO_PATH}"/>`;
}

/** A canvas of w × h with the mark `markH` tall, centred, on an optional ground. */
function composed({ w, h = w, markH, tone = "color", ground = null }) {
  const markW = (markH * MARK_WIDTH) / MARK_HEIGHT;
  const x = (w - markW) / 2;
  const y = (h - markH) / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    (ground ? `<rect width="${w}" height="${h}" fill="${ground}"/>` : "") +
    `<svg x="${x}" y="${y}" width="${markW}" height="${markH}" viewBox="${MARK_VIEWBOX}">${body(tone)}</svg>` +
    `</svg>`
  );
}

async function png(svg, file) {
  const out = path.join(root, file);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(out);
  const { size } = await fs.stat(out);
  console.log(`  ${file}  ${(size / 1024).toFixed(1)} KB`);
}

async function text(content, file) {
  const out = path.join(root, file);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, `${content}\n`);
  console.log(`  ${file}  ${Buffer.byteLength(content)} B`);
}

console.log("Brand assets from src/lib/brand/mark.ts");

// Vector files.
await text(markSvg("color"), "public/brand/mark.svg");
await text(markSvg("mono"), "public/brand/mark-mono.svg");
await text(markSvg("inverse"), "public/brand/mark-inverse.svg");
await text(markSvg("color"), "public/brand/kit/mark.svg");
await text(markSvg("mono"), "public/brand/kit/mark-mono.svg");
await text(faviconSvg(), "src/app/icon.svg");

// Logo for structured data: the house clear space (a quarter of the mark's
// height) on every side, so the mark is 512 / 1.5 tall.
const clear = 1 + 2 * MARK_RULES.clearSpace;
await png(
  composed({ w: 512, markH: Math.round(512 / clear), ground: WHITE }),
  "public/brand/logo-512.png",
);

// Email header image: the mark alone, 128 tall, transparent, cropped tight.
await png(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round((128 * MARK_WIDTH) / MARK_HEIGHT)}" height="128" viewBox="${MARK_VIEWBOX}" preserveAspectRatio="xMidYMid meet">${body("color")}</svg>`,
  "public/brand/mark-128.png",
);

// Web app icons ("any" purpose): transparent, mark at 82% of the height.
for (const size of [192, 512]) {
  await png(
    composed({ w: size, markH: Math.round(size * 0.82) }),
    `public/brand/icon-${size}.png`,
  );
}

// Maskable icon: launchers crop to any shape inside a centred circle 80% of
// the tile wide. The mark's bounding box (diagonal 1.23 × its height) is sized
// to 75% of that circle. One-colour off-white on the inverse green, per the
// rule for dark grounds.
const maskH = Math.round(
  (512 * 0.8 * 0.75) / Math.hypot(1, MARK_WIDTH / MARK_HEIGHT),
);
await png(
  composed({ w: 512, markH: maskH, tone: MARK_INVERSE, ground: GREEN_950 }),
  "public/brand/maskable-512.png",
);

// Apple touch icon: iOS rounds the corners and does not honour transparency,
// so the full-colour mark sits on a white tile.
const touch = composed({ w: 180, markH: 116, ground: WHITE });
await png(touch, "public/brand/apple-touch-icon.png");
await png(touch, "src/app/apple-icon.png");

// favicon.ico: older browsers and many link-preview fetchers request this
// path whatever the page declares. An .ico is a small directory of images;
// PNG payloads are allowed, so the favicon construction is rendered at three
// sizes and wrapped.
const iconSvg = await fs.readFile(path.join(root, "src/app/icon.svg"));
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map((size) =>
    sharp(iconSvg, { density: 384 }).resize(size, size).png().toBuffer(),
  ),
);
const icoHeader = Buffer.alloc(6 + 16 * icoSizes.length);
icoHeader.writeUInt16LE(1, 2); // type: icon
icoHeader.writeUInt16LE(icoSizes.length, 4);
let icoOffset = icoHeader.length;
icoSizes.forEach((size, index) => {
  const entry = 6 + 16 * index;
  icoHeader.writeUInt8(size, entry); // width
  icoHeader.writeUInt8(size, entry + 1); // height
  icoHeader.writeUInt16LE(1, entry + 4); // colour planes
  icoHeader.writeUInt16LE(32, entry + 6); // bits per pixel
  icoHeader.writeUInt32LE(icoImages[index].length, entry + 8);
  icoHeader.writeUInt32LE(icoOffset, entry + 12);
  icoOffset += icoImages[index].length;
});
await fs.writeFile(
  path.join(root, "src/app/favicon.ico"),
  Buffer.concat([icoHeader, ...icoImages]),
);
console.log("src/app/favicon.ico");

console.log("Done.");
