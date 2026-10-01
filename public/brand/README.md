# Olivia Energy — brand files

The mark is the client's own: an open ring with a three-tongue flame rising
from its gap. It has been redrawn as clean vector geometry from the legacy
artwork (true circles for the ring, smooth curves for the tongues, colours
sampled from the original) and is paired with the wordmark **Olivia Energy**
set in the house serif, Newsreader 500. The rounded 1990s wordmark, the spaced
red "ENERGY" and the fuel-retail tagline "…our fuel takes you further" are
retired.

The live reference, with every variant rendered, is the Brand section of
`/styleguide`.

## Source of truth

Everything here is generated from **`src/lib/brand/mark.ts`** (path data,
colours, lockup ratios, rules). On the site the mark is drawn inline by
`<Logo>` (`src/components/ui/logo.tsx`), so it costs no request and is crisp
at every pixel density. After changing `mark.ts`:

```sh
node scripts/brand-assets.mjs                          # SVG, PNG, app icons, favicon
BASE_URL=http://localhost:3000 node scripts/brand-kit.mjs  # kit PNGs (needs a running server)
```

## Files

| File                           | What it is                                                           | Used by                               |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------- |
| `mark.svg`                     | Full-colour mark, 72 × 100 viewBox                                   | Anyone needing the vector             |
| `mark-mono.svg`                | One colour, `fill="currentColor"` (black when used as an image)      | Inline use, print                     |
| `mark-inverse.svg`             | One colour in off-white `#FAF7F3`                                    | Dark grounds                          |
| `logo-512.png`                 | Mark on white, 512 × 512, clear space kept                           | schema.org `Organization.logo`        |
| `mark-128.png`                 | Mark 92 × 128, transparent                                           | Contact-notification email header     |
| `icon-192.png`, `icon-512.png` | Full-colour mark, transparent                                        | Web app manifest                      |
| `maskable-512.png`             | Off-white mark on green-950 `#002210`, inside the maskable safe zone | Web app manifest (Android)            |
| `apple-touch-icon.png`         | 180 × 180, mark on a white tile                                      | iOS home screen                       |
| `src/app/icon.svg`             | Favicon construction (see below)                                     | Browser tabs                          |
| `src/app/apple-icon.png`       | Same as `apple-touch-icon.png`                                       | Next.js `apple-icon` convention       |
| `src/app/manifest.ts`          | Web app manifest                                                     | Browsers                              |
| `source/oliviaenergy-logo.png` | The legacy artwork, 157 × 182                                        | Reference only; never use on the site |

### Client kit (`kit/`)

| File                                | What it is                                                    |
| ----------------------------------- | ------------------------------------------------------------- |
| `kit/lockup-horizontal.png`         | Horizontal lockup, full colour, transparent, 4× (1376 × 288)  |
| `kit/lockup-horizontal-inverse.png` | Horizontal lockup, off-white on transparent, for dark grounds |
| `kit/lockup-stacked.png`            | Stacked lockup, full colour, transparent, 4× (825 × 576)      |
| `kit/lockup-stacked-inverse.png`    | Stacked lockup, off-white on transparent, for dark grounds    |
| `kit/mark.svg`                      | Full-colour mark, vector                                      |
| `kit/mark-mono.svg`                 | One-colour mark, vector                                       |

The inverse PNGs are off-white on a transparent ground, so they look empty in
a file browser with a white background. That is correct.

## Colour

Sampled from the legacy artwork (median of solid interior pixels in both the
157 px original and the 1024 px upscale; each value is the mean of the two).

| Part               | Hex       | Notes                                                                            |
| ------------------ | --------- | -------------------------------------------------------------------------------- |
| Ring               | `#04923F` | Identical to the green-500 token                                                 |
| Middle tongue      | `#D5281B` | The mark's own red. Interface red is the accent token `#C5372B`; never swap them |
| Outer tongue       | `#88C029` | Lime appears in the mark and nowhere else                                        |
| One-colour on dark | `#FAF7F3` | neutral-50, the inverse text colour                                              |

## Lockups

- **Horizontal** (default): mark, then the wordmark. The wordmark's baseline
  sits on the ring's base and its cap height reaches the top of the ring's
  counter, so the mark is 1.264 × the wordmark's font size (a 22 px wordmark
  takes a 27.8 px mark). Gap: 0.38 em.
- **Stacked**: mark centred above the wordmark; mark 2.6 × the font size, gap
  0.42 em. For square or centred placements.
- **Mark alone**: favicons, app icons, avatars, and wherever the name is
  already present.

## Colourways

- **Full colour** on light grounds: the canvas `#FAF7F3`, white, surface.
- **One colour** on dark, busy or photographic grounds, and wherever colour
  would fight the page: off-white on the inverse green, ink `#161310` for
  print, forms and single-colour reproduction. On the site this is automatic:
  `<Logo tone="color">` goes one-colour inside any `data-tone="inverse"`
  surface, the header over a dark hero, and the open mobile menu.

## Clear space

One quarter of the mark's height on every side of the mark or a lockup,
measured from its bounding box. No text, edge or other logo comes inside it.

## Minimum sizes (height of the mark on screen)

| Use                     | Minimum                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Mark alone, full detail | 24 px                                                                                                                          |
| Horizontal lockup       | 20 px mark (16 px wordmark)                                                                                                    |
| Stacked lockup          | 40 px mark                                                                                                                     |
| Below 24 px             | Use the favicon construction (`src/app/icon.svg`): one flame tongue in red and a heavier green ring, drawn to survive at 16 px |

## Never

- Stretch, squash, rotate or skew the mark.
- Recolour it, or swap its colours: it is full colour or one colour.
- Add shadows, glows, outlines, gradients or transparency.
- Put text, figures or other graphics on or inside the mark.
- Reset the wordmark in another typeface, or change the lockup's spacing.
- Use the full-colour mark on dark, busy or photographic grounds.
- Bring back the rounded wordmark or the tagline "…our fuel takes you
  further".

## Note on the source artwork

The redraw was fitted to a 1024 px upscale of the legacy logo supplied
separately (`~/Downloads/oliviaenergy-logo.png`); that file was no longer on
disk when the source folder was assembled, so only the 157 × 182 original is
in `source/`. If the client wants the upscale archived, add it as
`source/oliviaenergy-logo-1024.png`.
