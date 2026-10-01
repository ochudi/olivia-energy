/**
 * Lighthouse audit (performance, accessibility, best practices, SEO) for
 * one or more routes at mobile and desktop, using the locally installed
 * Google Chrome.
 *
 *   npm run lighthouse                 # / and /what-we-do, mobile
 *   npm run a11y                       # accessibility only, / at mobile + desktop
 *   node scripts/lighthouse.mjs / /about --desktop-only
 *   node scripts/lighthouse.mjs / --categories=accessibility,seo
 *
 * Requires a running production server at BASE_URL (default
 * http://localhost:3000): `npm run build && npm run start`. JSON and HTML
 * reports land in .screenshots/. Exits non-zero if any category scores
 * below 95.
 */
import fs from "node:fs";
import path from "node:path";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const args = process.argv.slice(2);
const routes = args.filter((a) => a.startsWith("/"));
if (routes.length === 0) routes.push("/");
const categoriesArg = args.find((a) => a.startsWith("--categories="));
const categories = categoriesArg
  ? categoriesArg.slice("--categories=".length).split(",")
  : ["performance", "accessibility", "best-practices", "seo"];
const forms = args.includes("--desktop-only")
  ? ["desktop"]
  : args.includes("--mobile-only")
    ? ["mobile"]
    : ["mobile", "desktop"];
const base = process.env.BASE_URL ?? "http://localhost:3000";
const outDir = path.resolve(".screenshots");
fs.mkdirSync(outDir, { recursive: true });

const configs = {
  mobile: {
    extends: "lighthouse:default",
    settings: {
      formFactor: "mobile",
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        disabled: false,
      },
    },
  },
  desktop: {
    extends: "lighthouse:default",
    settings: {
      formFactor: "desktop",
      // Lighthouse's desktopDense4G preset; the default is mobile slow 4G.
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      screenEmulation: {
        mobile: false,
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        disabled: false,
      },
    },
  },
};

const chrome = await launch({
  chromeFlags: ["--headless=new", "--no-first-run", "--disable-gpu"],
});
let worst = 1;
try {
  for (const route of routes) {
    for (const form of forms) {
      const result = await lighthouse(
        base + route,
        {
          port: chrome.port,
          output: ["json", "html"],
          logLevel: "error",
          onlyCategories: categories,
        },
        configs[form],
      );
      if (!result) throw new Error("Lighthouse returned no result");
      const { lhr } = result;
      const slug =
        route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
      const file = path.join(outDir, `lighthouse-${slug}-${form}.json`);
      const [json, html] = Array.isArray(result.report)
        ? result.report
        : [result.report, null];
      fs.writeFileSync(file, String(json));
      if (html) fs.writeFileSync(file.replace(/\.json$/, ".html"), html);

      const scores = Object.values(lhr.categories)
        .map((c) => `${c.title} ${Math.round((c.score ?? 0) * 100)}`)
        .join(" · ");
      console.log(`${route} (${form}) → ${scores}`);
      for (const c of Object.values(lhr.categories)) {
        if (c.score !== null) worst = Math.min(worst, c.score);
      }
      const failing = Object.values(lhr.audits).filter(
        (a) =>
          a.score !== null &&
          a.score < 1 &&
          !["informative", "manual", "notApplicable"].includes(
            a.scoreDisplayMode,
          ),
      );
      const metrics = [
        "first-contentful-paint",
        "largest-contentful-paint",
        "cumulative-layout-shift",
        "total-blocking-time",
      ]
        .filter((id) => lhr.audits[id])
        .map((id) => `${id.replace(/-/g, " ")} ${lhr.audits[id].displayValue}`);
      if (metrics.length) console.log(`  ${metrics.join(" · ")}`);
      for (const a of failing) console.log(`  ✗ ${a.id}: ${a.title}`);
      if (failing.length === 0) console.log("  no failing audits");
      console.log(`  report: ${path.relative(process.cwd(), file)}`);
    }
  }
} finally {
  await chrome.kill();
}
process.exitCode = worst >= 0.95 ? 0 : 1;
