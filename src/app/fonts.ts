import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * TYPEFACE PAIR — decision record
 *
 * Brief: institutional energy advisory (IEA / RMI / McKinsey Energy Insights
 * register). Editorial, authoritative, calm. Not a startup landing page.
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
 * weights 400–500 and optical sizes 20–72, the only ranges the site sets.
 * 65 KB instead of 132 KB, still variable, still optically sized. See
 * src/assets/fonts/README.md and scripts/font-subset.py.
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
 * The serif italic is a separate family so it is NOT preloaded: it appears
 * only in pull quotes, citations and the About philosophy band, so it loads
 * on demand through the `--font-display-italic` token. It is instanced the
 * same way as the roman (weights 400–500, optical sizes 20–72), which cut
 * Google's 147 KB latin file to about half; on About that file used to
 * compete with the roman for the page's first paint.
 */
export const displayItalicFont = localFont({
  src: "../assets/fonts/newsreader-italic-latin-wght400-500-opsz20-72.woff2",
  weight: "400 500",
  style: "italic",
  variable: "--font-newsreader-italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: false,
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
