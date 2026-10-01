# Fonts

Two kinds of files live here.

## Site fonts (served through `next/font`)

- `newsreader-latin-wght400-500-opsz20-72.woff2` — the display serif roman,
  self-hosted. It is Google's latin subset of the Newsreader variable font,
  instanced to weights 400–500 and optical sizes 20–72 (the only ranges the
  site sets), which halves it from 132 KB to 65 KB while keeping both axes
  variable. Regenerate with `scripts/font-subset.py`. Newsreader is licensed
  under the SIL Open Font License 1.1 (github.com/googlefonts/newsreader).
- Instrument Sans (roman and italic) still comes from `next/font/google`,
  which subsets and self-hosts it at build time; the Newsreader italic is
  the local file described below. The italics are not preloaded because
  they appear only in prose.

## Social-image fonts (read by `next/og`)

- `newsreader-72pt-500.ttf`, `instrument-sans-500.ttf` — static instances
  read from disk by the `opengraph-image` routes; the renderer needs TTF
  data. Reference them with literal `new URL(...)` paths so the bundler
  ships the file, not the folder.

## newsreader-italic-latin-wght400-500-opsz20-72.woff2

The italic, instanced with the same script and ranges from the latin
variable WOFF2 that a build with `next/font/google` leaves in
`.next/static/media/` (Google's file is ~147 KB; this one is about half).
Loaded on demand by `displayItalicFont` in `src/app/fonts.ts`, never
preloaded: it is used only by pull quotes, citations and the About
philosophy band.
