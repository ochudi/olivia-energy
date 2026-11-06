#!/usr/bin/env node
/**
 * `npm run slop`: the design-tell gate. Fetches every public route from a
 * running build (default http://localhost:3002, every <loc> in its sitemap
 * plus the 404), writes the rendered HTML to .screenshots/slop/html with
 * scripts removed and tags split onto lines (the scanner hangs on Next's
 * single-line output), then runs the avoid-ai-design detector over the
 * folder at --min=P1. Exit 2 when a P0 or P1 tell remains, as the detector
 * itself does.
 *
 *   npm run slop                       scan http://localhost:3002
 *   npm run slop -- --url http://localhost:3005
 *
 * Deliberate choices the audit marked KEEP (docs/design/2026-11-craft-audit.md)
 * are the only ignores, listed in IGNORES below with the DESIGN.md section
 * that records the choice. They are written into each rendered file as an
 * `avoid-ai-design-ignore-file` comment, so the ignore and its reason live
 * here, in one place, and never in the components.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DETECT = path.join(
  ROOT,
  ".claude/skills/avoid-ai-design/scripts/detect.mjs",
);
const OUT = path.join(ROOT, ".screenshots/slop/html");

/** Catalog IDs kept on purpose, each with the DESIGN.md section that says why. */
const IGNORES = [
  {
    id: "L4",
    why: "The home numbers band (four numerals with a tag, a caption, a comparison glyph and a dated source each) is not a stat strip: DESIGN.md, Do's and Don'ts, keeps every number traceable to facts.ts with its source on its face; craft audit 2.5, KEEP the tiles.",
  },
];

const args = process.argv.slice(2);
const urlIndex = args.indexOf("--url");
const BASE = (
  urlIndex >= 0 ? args[urlIndex + 1] : "http://localhost:3002"
).replace(/\/$/, "");

async function routes() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap ${res.status} from ${BASE}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/",
  );
  return [...new Set([...locs, "/does-not-exist"])];
}

/** Scripts out (JSON payloads are not design), one tag a line. */
function prepare(html) {
  const header = IGNORES.length
    ? `<!-- avoid-ai-design-ignore-file: ${IGNORES.map((i) => i.id).join(", ")} -->\n`
    : "";
  return (
    header +
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/></g, ">\n<")
  );
}

function fileName(route) {
  return (
    (route === "/" ? "home" : route.slice(1).replace(/\//g, "__")) + ".html"
  );
}

async function main() {
  if (!fs.existsSync(DETECT)) {
    console.error(
      `slop: detector not found at ${DETECT} (install the avoid-ai-design skill under .claude/skills)`,
    );
    return 1;
  }
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const list = await routes();
  for (const route of list) {
    const res = await fetch(BASE + route);
    const html = await res.text();
    fs.writeFileSync(path.join(OUT, fileName(route)), prepare(html));
    console.log(`${res.status} ${route}`);
  }
  if (IGNORES.length) {
    console.log("\nIgnored on purpose:");
    for (const i of IGNORES) console.log(`  ${i.id}: ${i.why}`);
  }
  console.log(
    `\n${list.length} routes in ${path.relative(ROOT, OUT)}; scanning at --min=P1\n`,
  );
  const result = spawnSync(process.execPath, [DETECT, OUT, "--min=P1"], {
    stdio: "inherit",
  });
  return result.status ?? 1;
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(`slop: ${e.message}`);
    process.exit(1);
  },
);
