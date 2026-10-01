/**
 * Visual QA: screenshots a route at phone / tablet / desktop widths using the
 * locally installed Google Chrome (no browser download), and reports console
 * errors, horizontal overflow and the reduced-motion state.
 *
 *   npm run shots                       # /styleguide at 390, 768, 1440
 *   npm run shots -- /  --widths=390    # another route, custom widths
 *   npm run shots -- /styleguide --reduced-motion
 *
 * Requires a running server (npm run dev, or npm run build && npm run start)
 * at BASE_URL (default http://localhost:3000). Output: .screenshots/
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const route = args.find((a) => a.startsWith("/")) ?? "/styleguide";
const widthsArg = args.find((a) => a.startsWith("--widths="));
const widths = widthsArg
  ? widthsArg.replace("--widths=", "").split(",").map(Number)
  : [390, 768, 1440];
const reduced = args.includes("--reduced-motion");
const base = process.env.BASE_URL ?? "http://localhost:3000";
const outDir = path.resolve(".screenshots");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const slug =
  route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");

for (const width of widths) {
  const height = width < 600 ? 844 : width < 1024 ? 1024 : 900;
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error")
      problems.push(`[console] ${m.text().slice(0, 160)}`);
  });
  page.on("pageerror", (e) =>
    problems.push(`[pageerror] ${String(e).slice(0, 160)}`),
  );

  await page.goto(base + route, { waitUntil: "networkidle" });
  // Scroll through so reveals and counters have run, then return to top.
  await page.evaluate(async () => {
    const total = document.body.scrollHeight;
    for (let y = 0; y < total; y += 350) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2200);

  const suffix = reduced ? "-reduced" : "";
  const file = path.join(outDir, `${slug}-${width}${suffix}.png`);
  await page.screenshot({ path: file, fullPage: true });

  const report = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    docWidth: document.documentElement.scrollWidth,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    fonts: [
      ...new Set(
        [...document.fonts]
          .filter((f) => f.status === "loaded")
          .map((f) => f.family),
      ),
    ],
  }));
  console.log(`${width}px → ${path.relative(process.cwd(), file)}`);
  console.log(
    `  overflow: ${report.overflow ? "YES (" + report.docWidth + "px)" : "none"} · reduced-motion: ${report.reducedMotion} · fonts: ${report.fonts.join(", ") || "none"}`,
  );
  if (problems.length) console.log("  problems:\n   " + problems.join("\n   "));
  await context.close();
}
await browser.close();
