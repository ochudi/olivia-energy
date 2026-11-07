# Fonts

Two kinds of files live here. Budget: fonts on first
load at most 140 KB; the italic at most 35 KB and preloaded.

## Site fonts (served through `next/font`)

- `newsreader-latin-wght400-500-opsz20-72.woff2` — the display serif roman,
  self-hosted and preloaded. It is Google's latin subset of the Newsreader
  variable font, instanced to weights 400–500 and optical sizes 20–72,
  which halves it from 132 KB to 65 KB while keeping both axes variable.
  The site sets Newsreader at weight 400; weight 500 remains for the
  wordmark in the logo lockup. Regenerate with `scripts/font-subset.py`.
  Newsreader is licensed under the SIL Open Font License 1.1
  (github.com/googlefonts/newsreader).
- `newsreader-italic-latin-wght400-opsz48.woff2` — the serif italic, used
  only for the turn (`.turn`), preloaded. A static instance (weight 400,
  optical size 48, the middle of the 28 to 72 px range the turn is set at)
  subset to Latin-1 plus the typographic marks the copy uses: 23,076 bytes.
  Keeping the optical-size axis variable costs about 20 KB whatever the
  range (40 to 42 KB measured for opsz 28–72, 36–72, 48–72), which is over
  the 35 KB budget, so the axis is pinned. Made with the same fontTools
  pipeline as the roman, from Google's variable Newsreader italic:
  `instancer.instantiateVariableFont(font, {"wght": 400, "opsz": 48})`
  then `fontTools.subset` with the Latin-1 range, U+2013–U+203A punctuation,
  U+2022, U+20AC, U+2122, U+2212, U+2009, U+202F, U+FB01, U+FB02; features
  kern, liga, calt, locl, ccmp, mark, mkmk, lnum, tnum, onum, pnum. The
  WOFF2 writer needs the `brotli` Python module (`pip install brotli`).
- Instrument Sans (roman and italic) still comes from `next/font/google`,
  which subsets and self-hosts it at build time. The sans italic is not
  preloaded because it appears only in prose.

## Social-image fonts (read by `next/og`)

More static instances for the social cards (the Newsreader roman at
opsz 72 and the italic at opsz 48) live in `og/`; see
[`og/README.md`](og/README.md).

- `newsreader-72pt-500.ttf`, `instrument-sans-500.ttf` — static instances
  read from disk by the `opengraph-image` routes; the renderer needs TTF
  data. Reference them with literal `new URL(...)` paths so the bundler
  ships the file, not the folder.
