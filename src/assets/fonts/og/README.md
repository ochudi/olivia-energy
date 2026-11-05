# Social-card fonts

Static TrueType instances of the variable Newsreader, for `next/og` (the
renderer needs TTF, not WOFF2, and no variable axes). Read by
`src/app/opengraph-image.tsx` with literal `new URL(..., import.meta.url)`
paths. SIL Open Font License 1.1 (github.com/googlefonts/newsreader).

- `newsreader-400-opsz72.ttf`: roman, weight 400, optical size 72 (the
  tagline at 84 px).
- `newsreader-italic-400-opsz48.ttf`: italic, weight 400, optical size 48
  (the second tagline line at 48 px).

Made from the site's variable WOFF2 files in the parent folder with
fontTools (needs the `brotli` module to read WOFF2):

    instancer.instantiateVariableFont(font, {"wght": 400, "opsz": 72})   # 48 for the italic

then `fontTools.subset` to Basic Latin, Latin-1, U+2013, U+2014,
U+2018, U+2019, U+201C, U+201D, U+2022, with hinting dropped and the
features kern, liga, calt, locl, ccmp, mark, mkmk, lnum, pnum kept. Written
with `flavor = None` (plain TTF). 44 KB and 48 KB.

The wordmark in the lockup uses `../newsreader-72pt-500.ttf` and the footer
lines use `../instrument-sans-500.ttf`.
