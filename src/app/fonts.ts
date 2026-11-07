import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * TYPEFACE PAIR — decision record
 *
 * Register: institutional energy advisory. Editorial, authoritative, calm.
 * Not a startup landing page.
 *
 * Display serif — evaluated Fraunces, Newsreader, Source Serif 4.
 *   • Fraunces: beautiful but its "wonk" and soft terminals read as warm,
 *     craft, food-and-drink. Too much personality for policy-grade content.
 *   • Source Serif 4: a dependable workhorse, but it is the default serif of
 *     a thousand Adobe templates and has little presence at display sizes.
 *   • Newsreader ✔ — drawn by Production Type for on-screen long-form news.
 *     Its optical-size axis (6–72) gives a genuinely different cut for
 *     headlines (higher contrast, tighter) versus text (sturdier), so one
 *     family covers the H1 masthead and the pull quote without looking like
 *     a text face blown up. Narrow-ish set width and restrained x-height
 *     echo the printed annual report — the visual register we want.
 *
 * UI / body grotesk — evaluated Instrument Sans, Schibsted Grotesk, Inter.
 *   • Inter: technically excellent but ubiquitous; it is the typographic
 *     signature of SaaS, which is exactly the association to avoid.
 *   • Schibsted Grotesk: strong editorial pedigree, but its wide set width
 *     and heavier personality compete with the serif for attention.
 *   • Instrument Sans ✔ — a precise, slightly compact grotesk with even
 *     colour, tabular figures for data (`tnum`), and a quiet voice that lets
 *     Newsreader carry the tone. Its 400–700 range is all we need; we never
 *     set the serif bold, so the sans owns emphasis in UI.
 *
 * Both are variable fonts served by next/font (self-hosted, zero layout shift,
 * `font-display: swap`). They are exposed as CSS variables and mapped to the
 * `--font-display` / `--font-sans` tokens in src/styles/tokens.css.
 */

/**
 * The serif roman is the largest resource on the critical path of every
 * page's Largest Contentful Paint (the hero heading repaints when it
 * arrives), so it is a self-hosted subset: Google's latin cut instanced to
 * weights 400–500 and optical sizes 20–72. 65 KB instead of 132 KB, still
 * variable, still optically sized. The site sets Newsreader at weight 400
 * only; weight 500 remains for the wordmark in the logo lockup. See
 * src/assets/fonts/README.md and scripts/font-subset.py.
 *
 * First-load font budget: at most 140 KB. Preloaded today:
 * roman 65 KB + italic 23 KB + Instrument Sans roman (Google latin, about
 * 30 KB) = about 118 KB.
 */
export const displayFont = localFont({
  src: "../assets/fonts/newsreader-latin-wght400-500-opsz20-72.woff2",
  weight: "400 500",
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: true,
});

/**
 * The serif italic is the turn: "Inspiring sustainable futures.", the
 * closing line of a statement, the lime line on night. It appears above the
 * fold on most pages, so it is preloaded; to stay inside the 35 KB budget
 * for a preloaded file it is a static instance (weight 400, optical size 48,
 * the middle of the 28 to 72px range the turn is set at) of Google's latin
 * cut, subset to Latin-1 plus the typographic marks the copy uses: 23 KB
 * against 147 KB for Google's file. Newsreader is set in weight 400 only.
 */
export const displayItalicFont = localFont({
  src: "../assets/fonts/newsreader-italic-latin-wght400-opsz48.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-newsreader-italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: true,
});

export const sansFont = Instrument_Sans({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-instrument-sans",
  display: "swap",
});

/** Sans italic: emphasis inside prose only, so it loads on demand too. */
export const sansItalicFont = Instrument_Sans({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-instrument-sans-italic",
  display: "swap",
  preload: false,
});
