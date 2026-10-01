#!/usr/bin/env python3
"""
Instance the display serif to the ranges the site uses.

Google's latin cut of Newsreader (what next/font/google downloads) is ~132 KB
because it carries wght 200-800 and opsz 6-72. The site sets the serif only
at weights 400-500 and at 20px and above, so this script restricts both axes
(keeping them variable, so optical sizing still works) and writes a ~65 KB
WOFF2 that src/app/fonts.ts self-hosts and preloads.

  python3 -m venv .venv && .venv/bin/pip install fonttools brotli
  .venv/bin/python scripts/font-subset.py <input.woff2|ttf> \
      src/assets/fonts/newsreader-latin-wght400-500-opsz20-72.woff2

Input: the latin variable WOFF2 that a build with next/font/google leaves in
.next/static/media/ (the ~132 KB Newsreader file), or the upstream
Newsreader[opsz,wght].ttf from github.com/googlefonts/newsreader (OFL 1.1).
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

src, out = sys.argv[1], sys.argv[2]
font = TTFont(src)
axes = {a.axisTag: (a.minValue, a.defaultValue, a.maxValue) for a in font["fvar"].axes}
print("input axes:", axes)
instance = instancer.instantiateVariableFont(
    font,
    {"wght": (400, 500), "opsz": (20, 72)},
    inplace=False,
    optimize=True,
    updateFontNames=False,
)
instance.flavor = "woff2"
instance.save(out)
print("wrote", out)
