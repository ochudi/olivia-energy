/**
 * Brand kit: photographs the <Logo> lockups from the Brand section of
 * /styleguide at 4× device scale, on a transparent ground, cropped to the ink.
 * The files are what the client drops into documents, slides and signatures.
 *
 *   node scripts/brand-kit.mjs            # server at BASE_URL (default :3000)
 *   BASE_URL=http://localhost:3001 node scripts/brand-kit.mjs
 *
 * Writes public/brand/kit/lockup-{horizontal,stacked}{,-inverse}.png. The
 * inverse files are off-white on transparent, for dark grounds. The vector
 * marks in the same folder come from scripts/brand-assets.mjs.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/brand/kit");
const base = process.env.BASE_URL ?? "http://localhost:3000";
const KIT = [
  "lockup-horizontal",
  "lockup-horizontal-inverse",
  "lockup-stacked",
  "lockup-stacked-inverse",
];

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 4,
  reducedMotion: "reduce",
});
const page = await context.newPage();
await page.goto(`${base}/styleguide`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

// Clear every background behind the specimens so the capture is transparent.
await page.evaluate(() => {
  for (const el of document.querySelectorAll("[data-kit]")) {
    for (let node = el; node; node = node.parentElement) {
      node.style.setProperty("background", "transparent", "important");
    }
  }
});

for (const name of KIT) {
  const el = page.locator(`[data-kit="${name}"]`);
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (!box) throw new Error(`No specimen for ${name}`);
  const pad = 6;
  const shot = await page.screenshot({
    omitBackground: true,
    clip: {
      x: box.x - pad,
      y: box.y - pad,
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
  const file = path.join(outDir, `${name}.png`);
  await sharp(shot)
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(file);
  const { width, height } = await sharp(file).metadata();
  console.log(`  public/brand/kit/${name}.png  ${width}×${height}`);
}

await browser.close();
