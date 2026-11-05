# Creative brief: "Bridging Light"

Design system reference for the October 2026 rebuild. This document is the source of every visual rule on
the site and of the copy in `src/content`. Copy is not improvised in components: if a string is needed and is
not in `src/content`, add it there, and do not invent it.

Conventions in this brief: copy in quotation marks is final and is entered exactly as written (British
spelling, no em dashes or en dashes, straight quotes in code are fine; typographic quotes are produced by the
existing `typeset()` helper where it is already used). `{n}` marks a value computed from data at build time.
Fact ids such as `nigeria-no-electricity-2024` refer to `src/content/data/facts.ts`; series ids such as
`electricity_access_pct` refer to `src/content/data/series/*.json`. No numeral is typed by hand in a component.

---

## 1. The idea

Olivia Energy exists, in the company's own brand wording, "to bridge these gaps". The site measures Africa's energy
gaps honestly and shows the firm as the one that closes them. It opens like a company, in light: a
graded photograph of Lagos's Third Mainland Bridge at sunset under 150 px type, with the founder's latest
BusinessDay op-ed already on the first screen. As you scroll, the brand green floods in and that photograph
survives only inside the Olivia mark, while his nine lines of "Why Olivia?" light one by one and land on
"We exist to bridge these gaps." From there every gap on the site is drawn in the logo's flame red as a fine
hatch, set beside the opening that answers it, always with its source on its face; and every page ends on a
red band where the ring of the mark draws itself shut. Green is the stage, lime is the evidence, red is the
gap, paper is for reading, night is used one slab at a time. Real African places, real numbers, his own
words, and one idea a stranger could repeat after a single visit: Olivia measures the gap, then bridges it.

---

## 2. Design system

### 2.1 Colour

Brand and surface tokens (new, added to `src/styles/tokens.css`; no existing token is renamed or removed):

| Token                  | Hex       | Use                                                                                             | Never                              |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| `--color-brand-green`  | `#04923F` | The mark; chart series on paper; display type 24 px+ on paper                                   | Behind white body text; as a flood |
| `--color-brand-lime`   | `#88C029` | Lime flood; lead data colour on night; the italic turn on night and photo; underlines and rules | Text on paper, green or red        |
| `--color-brand-red`    | `#D5281B` | Red flood; the gap hatch; gap pills; the big quotation flame                                    | Small text on paper (use red ink)  |
| `--color-flood-green`  | `#047A36` | Green flood surface; green text on paper (4.8:1); the turn on paper                             | The mark                           |
| `--color-red-ink`      | `#B8231A` | Red text under 24 px on paper; form errors                                                      | Floods                             |
| `--color-night`        | `#06170E` | Night slab: figure plates, founder band, About hero, footer                                     | Two dark screens in a row          |
| `--color-night-raised` | `#0E2418` | Panels and grid lines on night                                                                  | Text                               |
| `--color-paper`        | `#F5F0E4` | Default page surface                                                                            |                                    |
| `--color-paper-deep`   | `#EAE2CE` | Alternate band; cover-wall ground                                                               |                                    |
| `--color-card`         | `#FBF8F0` | Cards on paper                                                                                  |                                    |
| `--color-chart-tint`   | `#3FCB79` | Third chart series, night only                                                                  | On paper                           |
| `--color-lime-pale`    | `#D3EDA6` | The italic turn on photographs only                                                             | Anywhere else                      |

Surfaces. Every section declares one surface; the surface remaps the existing semantic tokens
(`--color-canvas`, `--color-ink`, `--color-ink-muted`, `--color-ink-subtle`, `--color-primary`,
`--color-primary-fg`, `--color-accent`, `--color-line`, the logo's `--brand-mark-*`) so components keep using
`bg-canvas`, `text-ink`, `border-line`. All ratios below were computed.

| Surface      | Background          | Text                          | Muted text                                                                 | Lines                   | Turn (italic)                                                       | Primary button             | Logo         |
| ------------ | ------------------- | ----------------------------- | -------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------- | -------------------------- | ------------ |
| `paper`      | `#F5F0E4`           | ink `#0B1F14` (15:1)          | `#4A5A50` (6.4:1); subtle `#5E6D63` (4.8:1)                                | `rgba(11,31,20,.14)`    | flood green `#047A36`                                               | flood green bg, white text | true colours |
| `paper-deep` | `#EAE2CE`           | ink                           | `#4A5A50` (5.7:1); subtle is also `#4A5A50` here (`#5E6D63` is only 4.2:1) | `rgba(11,31,20,.16)`    | flood green (large text only, 4.2:1)                                | flood green bg, white      | true colours |
| `night`      | `#06170E`           | `#FFFFFF`                     | `#B9C7BE` (10.5:1)                                                         | `rgba(255,255,255,.14)` | lime `#88C029` (8.5:1)                                              | lime bg, ink text          | true colours |
| `green`      | `#047A36`           | `#FFFFFF` (5.5:1)             | `#E1F0E6` (4.6:1)                                                          | `rgba(255,255,255,.28)` | white                                                               | paper bg, ink text         | mono white   |
| `lime`       | `#88C029`           | ink `#0B1F14` (7.9:1)         | `#23401C` (5.3:1)                                                          | `rgba(11,31,20,.24)`    | ink                                                                 | ink bg, lime text          | mono ink     |
| `red`        | `#D5281B`           | `#FFFFFF` (5.1:1), white only | none: hierarchy by size and weight                                         | `rgba(255,255,255,.32)` | white                                                               | paper bg, ink text         | mono white   |
| `photo`      | image + night scrim | `#FFFFFF`                     | `#E6ECE8` on at least 70% scrim                                            | `rgba(255,255,255,.3)`  | pale lime `#D3EDA6` (lime itself is too dark over a thinning scrim) | paper bg, ink text         | mono white   |

Rules:

- One flood per section, carrying one strong statement. Never more than two dark screens in a row.
- The italic turn appears at most once per screen. It is lime only on night (pale lime on photographs); on
  other surfaces it is italic in the colour given above.
- Lime is never text on paper, green or red. Red is never small text on paper (use `--color-red-ink`).
- The mark is always `#04923F` / `#D5281B` / `#88C029` in true-colour mode, never the flood green.
- Chart colours per surface (tokens `--chart-1`, `--chart-2`, `--chart-3`, `--chart-gap`, `--chart-axis`,
  `--chart-grid` set by the surface): night: lime, paper `#F5F0E4`, `#3FCB79`, red hatch, `#B9C7BE`,
  `rgba(255,255,255,.12)`. Paper: flood green, ink, brand green at 60% (`#04923F99` only for areas), red
  hatch, `#4A5A50`, `rgba(11,31,20,.10)`. Lime: ink, `#23401C`, n/a, red hatch with ink outline, `#23401C`,
  `rgba(11,31,20,.18)`.
- The gap hatch: `pattern` of 45° lines, 6 px pitch, 1.5 px stroke, `#D5281B` at 85% on night and paper,
  `#D5281B` with a 1 px ink outline on lime. Solid red appears only on the gap label pill. Hatch means "the
  gap" and nothing else.

### 2.2 Type

Families (already self-hosted; no new family, no new weight):

- **Newsreader** (`--font-display`): every headline, the Why Olivia lines, numerals, quotations, cover
  titles. Weight 400 only. `font-optical-sizing: auto`. Italic only for the turn. Numerals:
  `font-variant-numeric: lining-nums tabular-nums`.
- **Instrument Sans** (`--font-sans`): body, ledes, labels, buttons, chips, sources, navigation.
- The Newsreader italic is subset to Latin, weight 400, at most 35 KB, and preloaded. Total fonts on
  first load at most 140 KB.

Scale (tokens; existing names keep their names and take new values; two names are new):

| Token                      | Phone 390 to desktop 1440 | Value                                          | Leading / tracking | Use                                                                                |
| -------------------------- | ------------------------- | ---------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `--text-display-2xl` (new) | 60 to 150 px              | `clamp(3.75rem, 1.6rem + 9.2vw, 9.375rem)`     | 0.9 / -0.04em      | Home H1 only                                                                       |
| `--text-display-xl`        | 48 to 104 px              | `clamp(3rem, 1.9rem + 5.6vw, 6.5rem)`          | 0.95 / -0.035em    | Inner-page H1s, closing statements, footer tagline                                 |
| `--text-display-lg`        | 40 to 72 px               | `clamp(2.5rem, 1.6rem + 3.9vw, 4.5rem)`        | 1.0 / -0.03em      | Section H2s, chapter titles, About H1                                              |
| `--text-display-md`        | 28 to 48 px               | `clamp(1.75rem, 1.2rem + 2.3vw, 3rem)`         | 1.08 / -0.02em     | Why Olivia lines, close lines, statements                                          |
| `--text-display-sm`        | 24 to 32 px               | `clamp(1.5rem, 1.2rem + 1vw, 2rem)`            | 1.15 / -0.015em    | Card and cover titles, chapter ledes                                               |
| `--text-display-xs`        | 20 to 24 px               | `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)`       | 1.25 / -0.01em     | Small titles, list statements                                                      |
| `--text-numeral` (new)     | 64 to 130 px              | `clamp(4rem, 2rem + 7.4vw, 8.125rem)`          | 0.9 / -0.03em      | Numbers band, chapter numerals                                                     |
| `--text-xl`                | 19 to 22 px               | `clamp(1.1875rem, 1.05rem + 0.55vw, 1.375rem)` | 1.45               | Ledes (max 42ch)                                                                   |
| `--text-lg`                | 19 px                     | `1.1875rem`                                    | 1.55               | Large body, About narrative                                                        |
| `--text-base`              | 17 px                     | `1.0625rem`                                    | 1.6                | Body (max 68ch)                                                                    |
| `--text-sm`                | 15 px                     | `0.9375rem`                                    | 1.5                | Secondary text, card summaries, captions                                           |
| `--text-xs`                | 12 px                     | `0.75rem`                                      | 1.4                | Labels (uppercase, 600, tracking 0.14em) and source lines (regular, sentence case) |

Body text is never below 15 px except labels and source lines (12 px). Display headings use
`text-wrap: balance`; body uses `text-wrap: pretty` where supported.

### 2.3 Spacing and grid

- Base unit 8 px; steps 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- `--spacing-section`: `clamp(5rem, 3.5rem + 6vw, 10rem)` (80 to 160 px) top and bottom of every section.
  `--spacing-section-sm`: `clamp(3.5rem, 2.5rem + 4vw, 6rem)` for bands inside a section.
- Gutter (side margin): 20 px at 390, 40 px at 768, 72 px at 1440 (`--spacing-gutter:
clamp(1.25rem, 0.5rem + 3.6vw, 4.5rem)`). Page container 1296 px.
- Grid: 12 columns, 24 px gaps at 1024+; 8 columns, 20 px at 768; 4 columns, 16 px at 390. "Cols 1 to 6"
  below means grid columns at 1440.
- Header height 72 px desktop, 64 px phone (existing `--spacing-header`).

### 2.4 Shape: the shoulder

One shape everywhere: a rectangle with three tight corners (`--radius-xs`, 4 px) and one large rounded
top-right corner that echoes the ring of the mark.

| Token                  | Value                                           | On                                                      |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `--radius-shoulder-sm` | 24 px                                           | Small cards, format tiles, form fields' container       |
| `--radius-shoulder`    | 40 px                                           | Cards, covers, figure plates, audience and pillar tiles |
| `--radius-shoulder-lg` | `clamp(4rem, 2rem + 9vw, 15rem)` (64 to 240 px) | Photographs, flood panels (vision, mission)             |
| `--radius-pill`        | 999 px                                          | Buttons, chips, the Fig. tag, the gap pill              |

Utilities: `shoulder-sm`, `shoulder`, `shoulder-lg` set `border-radius: 4px R 4px 4px` (top-left,
top-right, bottom-right, bottom-left). Circles appear only where the ring is meant: the arrow inside a
button, chart end-markers, the founder's halo, the closing ring, the region ring on the Contact map. Forbidden: arches (two rounded
top corners), notches or die-cuts, offset or drop shadows (a single 1 px line is the only edge treatment),
glow, glassmorphism, gradients other than photo scrims.

### 2.5 Glyphs

One family of 14 line glyphs, drawn as path data in `src/components/ui/glyphs.ts` and rendered by
`<Glyph>`. Grammar: 48 x 48 grid, 4 px safe margin; stroke 2 px at 48 px (scale stroke with size: 2.5 px at
64 px), round caps and joins, no fills except a dot of 3 px diameter; built only from (R) the ring, a circle
or arcs of radius 16 centred at 24,24 (smaller rings r 8 to 12 allowed); (T) the flame tongue, the mark's
lime tongue simplified to two cubic curves, 10 x 22 units; (S) straight strokes at 0°, 45° or 90°; (D) the
dot. At most four elements per glyph. Stroke colour is `currentColor`; draw-in animates `stroke-dashoffset`.

| Name                 | For                          | Construction                                                                                                                 |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `transition`         | Energy Transition Advisory   | R as a 300° arc open at one o'clock, with a short S arrowhead continuing clockwise; T rising inside from the bottom centre   |
| `economics-policy`   | Energy Economics & Policy    | Upper half of R as a dial; S needle from the centre to two o'clock; three D ticks on the dial                                |
| `esg`                | ESG & Sustainability         | Full R; a leaf of two mirrored T curves inside; an S stem below the leaf                                                     |
| `research-analytics` | Research & Analytics         | R of radius 12 offset up-left as a lens; S handle at 45°; a three-segment rising S line inside the lens                      |
| `capacity`           | Capacity Development         | Three S steps rising left to right; T on the top step                                                                        |
| `project`            | Project Advisory             | An S path of three segments from bottom-left to top-right with D nodes at the two bends, ending in a small R (r 6) milestone |
| `research`           | Pillar: Research             | Full R with a D at its centre                                                                                                |
| `advisory`           | Pillar: Advisory             | T laid on its side as a speech mark, with a second smaller T beside it                                                       |
| `innovation`         | Pillar and value: Innovation | One large upright T with a D spark above its tip                                                                             |
| `impact`             | Pillar: Impact               | A D with three concentric quarter arcs of R rippling up and right                                                            |
| `excellence`         | Value: Excellence            | Full R with an upward S chevron inside                                                                                       |
| `integrity`          | Value: Integrity             | Full R with a vertical S through its centre, top to bottom of the ring                                                       |
| `sustainability`     | Value: Sustainability        | Two 150° arcs of R chasing each other, each with an S arrowhead                                                              |
| `collaboration`      | Value: Collaboration         | Two interlocking R of radius 11, centres 12 units apart                                                                      |

They are drawn in flood green on paper, white on green, night or red, ink on lime. Never filled, never
coloured in more than one colour.

### 2.6 Figures

Every chart is a `<figure>` on a plate (night or card, `shoulder`), server-rendered SVG with HTML labels:

- Top line: the Fig. tag ("Fig. 1", outline pill, 12 px label) and the title in `display-xs`.
- Optional subtitle in `text-sm` muted (unit, scale).
- The chart: wide viewBox at 768+, tall viewBox below, switched in CSS; no layout shift (aspect ratio set).
- Series labels at line ends as HTML ("World 91.9%"), value in Newsreader, name in Instrument Sans 12 px.
- End markers: rings (2 px stroke, 6 px radius, surface-coloured fill).
- Gap: hatch between the two lines that define it, with one solid red pill naming it.
- Interpretation: one or two sentences in `text-sm`, under the chart.
- Source line in `text-xs`: "Source: {org}, {title} ({series code}), {licence}. Retrieved 2 October 2026."
- "View as table" (`<details>`), and "Get the data (CSV)" linking `/data/{series}.csv`.
- Numbering restarts on each page. Numeral cards (a big number with a comparison glyph) carry a source line
  and a small tag ("Gap", "Opening", "Target", "Context") instead of a Fig. number.

### 2.7 Imagery

Grade (applied once at build time by `scripts/grade-photos.mjs`, sharp): resize to at most 2400 px long
edge; per-channel linear curve R `1.05x - 6`, G `0.98x + 6`, B `0.93x + 2` (shadows lean to deep green,
highlights warm); then contrast `1.06x - 7.7`; saturation +8% (`modulate({ saturation: 1.08 })`); sRGB; strip
metadata; JPEG quality 82. The result must read as one shoot: dusk-warm highlights, green-black shadows.

Files, crops and captions (captions state only what the source page states):

| Key                    | File                                      | Where                      | Crop and focal point                                                                                                                                                                             | Caption and credit                                                                                 |
| ---------------------- | ----------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `lagos-third-mainland` | `nigeria-lagos-third-mainland-sunset.jpg` | Home hero and mark window  | Desktop 16:9, focal 60% / 58%, bridge line at 60 to 64% height, never cut through. Phone 9:16, focal 55% / 52%, from the 3911 px Commons original if it can be downloaded, else the 2400 px copy | "Third Mainland Bridge, Lagos, at sunset. Photo: Solasly, CC BY-SA 4.0"                            |
| `tarfaya-wind`         | `wind-morocco-tarfaya-golden.jpg`         | Energy Transition Advisory | 4:5, focal 50% / 35%, both hubs in frame                                                                                                                                                         | "Tarfaya Wind Farm, Morocco. Photo: TEDxTarfaya, CC BY-SA 2.0"                                     |
| `abuja-city-gate`      | `nigeria-abuja-citygate-sunset.jpg`       | Energy Economics & Policy  | 4:5, focal 50% / 55%, sun disc and gate                                                                                                                                                          | "City Gate, Abuja, at sunset. Photo: Baqeer Gashua, Unsplash"                                      |
| `bayelsa-flare`        | `nigeria-bayelsa-gas-flare.jpg`           | ESG & Sustainability       | 4:5, focal 35% / 62%, flare stack and flame                                                                                                                                                      | "Gas flare at Obunagha, Bayelsa State, at dawn. Photo: OgbuefiPascal, CC BY-SA 4.0"                |
| `lagos-market`         | `africa-light-market-aerial.jpg`          | Research & Analytics       | 4:5, focal 50% / 40%, keep the yellow bus                                                                                                                                                        | "Street market, Lagos, from above. Photo: Fahd Aminu, Unsplash"                                    |
| `lecture-hall`         | `capacity-auditorium.jpg`                 | Capacity Development       | 4:5 from the right 60% only, focal 70% / 50%                                                                                                                                                     | "Lecture hall. Photo: Henry Storck, Unsplash"                                                      |
| `ethiopia-lineman`     | `grid-ethiopia-hvdc-lineman.jpg`          | Project Advisory           | 4:5, focal 55% / 45%, lineman and conductors                                                                                                                                                     | "A lineman on the Ethiopia to Kenya interconnector, Ethiopia. Photo: Rod Waddington, CC BY-SA 2.0" |
| `lagos-lekki-night`    | `hero-lagos-bridge-night.jpg`             | Fig. 2 on What we do       | 16:9 band inside the plate, focal 70% / 60%, lift shadows                                                                                                                                        | "Lekki-Ikoyi Link Bridge, Lagos. Photo: Opeyemi Adisa, Unsplash"                                   |
| `abuja-lightpoles`     | `nigeria-abuja-lightpoles-sunset.jpg`     | About story band           | 21:9 desktop focal 50% / 72% (sun and lamp heads), 4:5 phone                                                                                                                                     | "Street lights at sunset, Abuja. Photo: Habila Mazawaje, Unsplash"                                 |
| `bonny-night`          | `nigeria-bonny-lng-night.jpg`             | Spare article cover        | 3:2, retouch the red lens ghost at left                                                                                                                                                          | "Gas plant at night, Rivers State. Photo: ---=XEON=--- (Panoramio), CC BY 3.0"                     |
| `noor-solar`           | `solar-morocco-noor3-dusk.jpg`            | Spare article cover        | 3:2 from the right 60%                                                                                                                                                                           | "Noor III solar tower, Ouarzazate, Morocco. Photo: Marc Lacoste, CC BY-SA 4.0"                     |
| `nanyuki-pylon`        | `grid-kenya-nanyuki-pylon-moon.jpg`       | Spare article cover        | 3:2, focal 60% / 50%                                                                                                                                                                             | "Transmission tower, Nanyuki, Kenya. Photo: Emmanuel Wambugu, Unsplash"                            |

The graded photographs are produced by `scripts/grade-photos.mjs` into `public/images/photos/`. The existing `/images/cover-*.jpg` files stay untouched (the starter articles use
them).

Forbidden: any Dangote, Nigerian or African caption on the Japanese refinery and stacks frames, the
Hamburg cranes, the German solar and wind frames, the Dunhuang solar plant, the Calgary wetland (it is never
"mangrove"), the Zurich crane; none of those are used in this release. The Bonny frame is never called
"Nigeria LNG". The NASA frames are not used (licence unconfirmed). Dangote stories get typographic covers,
never a photograph. Faces are never the subject of a stock frame.

Scrims: text over a photograph sits on a night gradient strong enough that the lightest pixel behind body
text gives 4.5:1 with white (luminance at most 0.18), and behind the H1 (white) and the turn (pale lime)
gives 3:1 (luminance at most 0.30 and 0.22). Home hero: left
`linear-gradient(90deg, rgba(6,23,14,.85) 0%, rgba(6,23,14,.62) 50%, rgba(6,23,14,0) 78%)`, bottom
`linear-gradient(0deg, rgba(6,23,14,.88) 0%, rgba(6,23,14,0) 52%)`, top `linear-gradient(180deg,
rgba(6,23,14,.45) 0, rgba(6,23,14,0) 160px)`. On phones the bottom scrim reaches 62%.

Every photograph shows its credit: in a caption under it, or as the vertical credit on the hero, or inside
the figure plate. `/credits` lists all of them in full (author, licence with link, source page, "cropped and
colour-graded", and "adapted files are shared under the same licence").

### 2.8 Motion

Native scroll only. Server HTML is always in its final state; JavaScript may set a pre-state only on
elements still below the fold (the existing `Reveal` rule). Above-the-fold H1s never animate opacity, clip
or mask.

| Name     | What moves                                                                                          | Duration                               | Easing                                        | Trigger              |
| -------- | --------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------- | -------------------- |
| `mask`   | Display heading: `clip-path: inset(0 0 100% 0)` to `inset(0)` plus `translateY(0.3em)` to 0         | 800 ms                                 | ease-out-expo `cubic-bezier(0.16, 1, 0.3, 1)` | 20% in view          |
| `fade`   | Body blocks: opacity 0 to 1, `translateY(16px)` to 0                                                | 600 ms, stagger 90 ms                  | ease-out (existing token)                     | 15% in view          |
| `wipe`   | Photographs: `clip-path: inset(100% 0 0 0)` to `inset(0)`; inner image scale 1.08 to 1 over 1400 ms | 1000 ms                                | in-out `cubic-bezier(0.65, 0, 0.35, 1)`       | 20% in view          |
| `draw`   | Glyph, ring, chart line strokes: `stroke-dashoffset` to 0                                           | 900 ms glyphs, 1200 ms lines and rings | in-out                                        | 30% in view          |
| `sweep`  | Chart lines revealed left to right by a clip rect                                                   | 1200 ms                                | in-out                                        | 30% in view          |
| `hatch`  | Gap hatch: opacity 0 to 1 and clip from left, after `sweep`                                         | 600 ms                                 | ease-out                                      | sweep end            |
| `pop`    | Gap pill and end labels: scale 0.92 to 1, opacity                                                   | 240 ms                                 | ease-out-expo                                 | hatch end            |
| `count`  | Numerals count up (existing `AnimatedNumber`)                                                       | 1400 ms                                | ease-out                                      | 60% in view          |
| `light`  | Why Olivia line: colour `#A9CDB5` to white, flame bullet scale 0 to 1                               | 300 ms                                 | ease-out                                      | scroll threshold     |
| `settle` | Home hero photo: scale 1.06 to 1, once on load                                                      | 4500 ms                                | ease-out                                      | load                 |
| `close`  | The ring's gap closes (dash)                                                                        | 1200 ms                                | in-out                                        | 50% in view          |
| `hover`  | Button arrow `translateX(4px)`; card photo scale 1.04; cover `translateY(-4px)`                     | 200, 600, 300 ms                       | ease-out                                      | hover, focus-visible |

Tokens (new unless noted): `--ease-out-expo`, `--ease-in-out`, `--duration-mask: 800ms`,
`--duration-wipe: 1000ms`, `--duration-draw: 1200ms`, `--duration-settle: 4500ms`; existing
`--duration-reveal` becomes 600ms and `--motion-reveal-distance` becomes 16px. Each new duration gets its
`@utility`.

Pinned scenes: at most one per page, desktop only, enabled purely in CSS with
`@media (scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 640px)`.
One passive scroll listener and one rAF write a single custom property `--p` on the scene; everything
else is CSS reading `--p` or a `data-step` attribute. Scripting at most 2 ms a frame at 4x CPU throttle.

Reduced motion and no JavaScript: everything final, no pinning, all lines lit, counters final, rings closed,
charts drawn, the ignition is the static mark. Route changes keep the existing light fade on client-side
navigation only; the first load never starts below full opacity. No React ViewTransition.

### 2.9 Signature moments

1. **First light, then the mark window** (home, sections 1 and 2): the Lagos photograph at sunset, then the
   green flood closes around the Olivia mark and the photograph survives inside it. The cinematic device;
   used once. Specification in 2.10.
2. **The gaps, measured** (home, section 3): a lime flood with four numerals whose glyphs grow in, three
   hatched gaps and one solid opening, then Fig. 1 sweeping across a night plate with the 29.4-point gap
   hatching in behind it.
3. **Installed is not delivered** (What we do, chapter 02): 136 squares on a night plate over the Lekki-Ikoyi
   bridge; scrolling turns two thirds of them dark, then four of the remaining 45 to red hatch.
4. **Ignition** (About hero): on capable desktops sparks in the three logo colours converge into the mark in
   under 2.5 s, then the canvas hands over to the crisp vector mark and stops. Everywhere else the mark draws
   itself in strokes.
5. **On the record** (home section 7, Insights): his op-eds as coloured covers cut from the mark, and his
   Dangote line set large: "Nations that fail to refine what they produce will always import the
   consequences of global instability."
6. **The ring closes** (every page's last band): a red flood where the ring of the mark draws shut as
   "Start a conversation" arrives.

### 2.10 The mark window, exactly

One section, `#hero`, `data-hero="dark"`, `data-surface="photo"`, containing the hero copy, the
photograph, the flood layer and the Why Olivia block.

Two layouts from one DOM:

- **Static** (default; phones; tablets; reduced motion; no JavaScript; browsers without the `scripting`
  media feature): the hero is a normal section (min-height 100svh); the Why Olivia block follows in flow as
  its own green section with the photograph inside a static SVG `clipPath` of the mark (`MARK_MONO_PATH` from
  `src/lib/brand/mark.ts`), 300 px tall on phones, 520 px on tablets. Lines are lit as each crosses 60% of
  the viewport (IntersectionObserver toggling `data-lit`; without JS all are lit).
- **Pinned** (the media query in 2.8): the wrapper is 280svh tall; an inner stage is `position: sticky; top: 0;
height: 100svh`. The photograph fills the stage. The flood is one inline SVG covering the stage: a very large
  rectangle with the mark silhouette as an even-odd hole, inside a `<g>` whose `transform` attribute is the only
  thing written per frame. The path data never changes. The Why Olivia block sits absolutely inside the stage:
  text in cols 1 to 6, mark window in cols 7 to 12, mark height 64svh, right edge on the grid.

Progress `p` runs 0 to 1 over the wrapper's scroll range:

| p            | What happens                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 to 0.08    | Rest. The hero as designed.                                                                                                                                                                                                                                                           |
| 0.04 to 0.16 | Hero copy and card lift 48 px and fade out; at 0.16 they become `visibility: hidden`. If any hero link takes focus, scroll the window back to the wrapper's top.                                                                                                                      |
| 0.08 to 0.42 | The flood closes: the `<g>` scales from S0 to 1 about an anchor inside the thickest part of the mark silhouette and translates to the final mark position; in-out easing. S0 is computed on resize so that at S0 the hole covers the whole viewport. The photograph scales 1 to 1.04. |
| 0.22         | "Why Olivia?" and the first line appear (fade 300 ms). At this point the left half of the screen must already be at least 95% green.                                                                                                                                                  |
| 0.30 to 0.86 | Lines 1 to 8 light, one every 0.07 (`light`, time-based once its threshold passes).                                                                                                                                                                                                   |
| 0.86 to 0.94 | The closing line lights; its lime underline draws (scaleX 0 to 1, 600 ms).                                                                                                                                                                                                            |
| 0.94 to 1    | Hold. Then the stage releases and the lime band follows.                                                                                                                                                                                                                              |

Acceptance: screenshots at p = 0, 0.1, 0.2 ... 1.0 at 1440 x 900 and 1280 x 720 each show the photograph or
the mark and readable text, with no flat empty field and no stray shard of green at the viewport edge; the
mark edge is crisp at DPR 2 at rest; the photograph inside the mark is the 2400 px graded file; scripting is
under 2 ms a frame at 4x throttle; static layout is identical in content.

---

## 3. Global elements

### 3.1 Header

- Left: `<Logo variant="lockup">` (mark 28 px tall, wordmark "Olivia Energy" in Newsreader 22 px), linking home.
- Desktop right: "What we do", "About", "Insights", "Research" (Instrument Sans 15 px, 500), then the button
  "Start a conversation". Current page: `aria-current="page"` and a 2 px underline in `currentColor`.
- Phone: logo and a "Menu" pill. The full-screen menu (existing dialog behaviour) is a green flood: the four
  links in `display-lg`, then the "Start a conversation" button, then the email from settings. Close button
  label "Close".
- Tone: the header takes the surface beneath it (decision 23): transparent with white or ink text at the top
  of a page whose first section has `data-hero`; otherwise solid in the colour of the section under its
  bottom edge, with a 1 px line in that surface's line colour. Logo per the surface table.
- Skip link (existing): "Skip to content".

### 3.2 Footer (night)

- Row 1, the tagline: "Powering the transition." in `display-xl` white, and beneath it "Inspiring
  sustainable futures." in `display-lg` lime italic.
- Row 2, four columns (stacked on phones):
  - Column 1: the logo lockup in true colours; "Olivia Energy and Power Company Limited"; "RC 1662525";
    "Fort Worth, Texas · Southwest Nigeria".
  - Column 2, heading "What we do": the six service titles, each linking `/what-we-do#{slug}`.
  - Column 3, heading "Company": "About", "Insights", "Research", "Contact", "Credits", "Privacy".
  - Column 4, heading "Get in touch": email (settings), LinkedIn (settings), "Start a conversation" link.
- Row 3: "© {year} Olivia Energy and Power Company Limited. Incorporated in Nigeria." and, right-aligned,
  "Photographs by Solasly, Rod Waddington, OgbuefiPascal, TEDxTarfaya, Baqeer Gashua, Fahd Aminu, Henry
  Storck, Habila Mazawaje and Opeyemi Adisa. Full credits" with "Full credits" linking `/credits`.
- The footer tagline reads `SITE.tagline` from settings when present (decision: the developer sets the new
  tagline in Admin); the two-line layout splits it at the first full stop.

### 3.3 The close band (red), shared

Red flood. A ghosted mark (mono white at 7% opacity, 130% of the band height) bleeds off the right edge. A
`RingMark` (white, 2 px; 220 px desktop, 120 px phone) sits top-right of the text column with a 25% gap that
closes (`close`) when the band is half in view. Text: optional eyebrow, optional lines in `display-md`, the
statement in `display-xl`, then the button "Start a conversation" (paper button, ink text, arrow) linking
`/contact`. Phone: ring above the text, left-aligned. Per-page copy is given with each page.

### 3.4 Social card

`/opengraph-image` 1200 x 630, night background. Left 62%: the logo lockup in true colours (mark 56 px);
"Powering the transition." in Newsreader 84 px white; "Inspiring sustainable futures." in Newsreader italic
48 px lime; footer line "Energy advisory · Research · Sustainability" in Instrument Sans 24 px `#B9C7BE`.
Right 38%: the mark in true colours, 440 px tall, bleeding 60 px off the right edge. The phrase "Led by ...,
energy economist" is replaced by "Founded by Dr Olugbenga Olaoye". Article pages may keep their existing
per-article card if one exists, restyled to the same night ground.

### 3.5 Page titles and descriptions (`SEO`, each title at most 60 characters with any suffix, each description at most 160)

| Page       | Title                                                         | Description                                                                                                                                                      |
| ---------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home       | "Olivia Energy: energy advisory, research and sustainability" | "Olivia Energy is a strategic energy advisory, research and sustainability consultancy working towards a cleaner, more secure and more inclusive energy future." |
| What we do | "What we do: energy transition, policy and ESG advice"        | "Six services, from energy transition advisory and energy policy to ESG, research and analytics, capacity development and project advisory."                     |
| About      | "About Olivia Energy and our founder"                         | "Olivia Energy helps organisations navigate the energy transition. Founded by Dr Olugbenga Olaoye, energy economist and BusinessDay contributor."                |
| Insights   | "Insights: energy analysis and commentary"                    | "Analysis, commentary and data on energy security, downstream markets and the energy transition in Africa, including op-eds in BusinessDay."                     |
| Research   | "Research: journal articles and commentary"                   | "Peer-reviewed research and BusinessDay commentary by Dr Olugbenga Olaoye on energy economics, environmental quality and policy."                                |
| Contact    | "Contact Olivia Energy"                                       | "Start a conversation with Olivia Energy, in Fort Worth, Texas and Southwest Nigeria."                                                                           |
| Credits    | "Credits"                                                     | "Photographs, data and typefaces used on this site, with their authors and licences."                                                                            |
| Privacy    | (existing)                                                    | (existing)                                                                                                                                                       |

If the existing suffix pushes a title over 60 characters, drop the suffix for that page rather than editing
the words. `SEO.knowsAbout`: "Energy transition", "Energy economics", "Energy policy", "ESG and
sustainability", "Energy security", "Downstream petroleum markets", "Dangote refinery", "Electricity access
in Africa".

### 3.6 Shared microcopy

- Button arrow labels: visible text only; external links add the visually hidden text ", opens in a new tab".
- Dates: long form "10 September 2026" in prose and article headers; short form "10 Sep 2026" on cards and
  covers.
- Counts in prose come from `countWords(n)` (one to twenty as words, then numerals): "eleven op-eds",
  "twelve BusinessDay reports". Counters use numerals.
- Table toggle: "View as table". Data link: "Get the data (CSV)". Chart readout instruction (visually
  hidden): "Use the left and right arrow keys to read each year."
- Gap tags: "Gap", "Opening", "Target", "Context".
- Empty states: format tile "First issue coming"; webinar tile "First episode coming"; articles "The first
  articles are in preparation."

---

## 4. Pages

Each section lists: surface; layout at 1440 and at 390; motion; copy source; final copy.

### 4.1 Home (`/`)

**1. Hero** (`#hero`, photo, `data-hero="dark"`; pinned stage on desktop, see 2.10)

- 1440: photograph full bleed (`lagos-third-mainland`, desktop crop) under the three scrims. Eyebrow at
  about 300 px from the top, cols 1 to 8; H1 in `display-2xl` on two lines ("Powering the" / "transition."
  as it naturally breaks at 1440); the turn in `display-lg` pale lime italic; the lede (`text-xl`, max 46ch);
  buttons in a row. "Latest in BusinessDay" card at bottom right (368 px wide, night at 92% with a 1 px
  lime top rule, `shoulder` corner): label row (label left, short date right), title in `display-xs`, meta
  line, ring arrow button. Vertical credit along the right edge, 12 px, rotated 90°.
- 390: portrait crop fills the first 100svh; content anchored to the bottom: eyebrow, H1 60 px, turn 30 px,
  lede 17 px, primary button full width, secondary as a text link; the card follows and its label peeks
  above the fold's bottom edge. Credit under the card, 12 px.
- Motion: `settle` on the photograph; H1 static in the first frame; turn, lede, buttons `fade` with 90 ms
  stagger from 150 ms; card `fade` at 400 ms. Photograph preloaded (phone 828 px wide at most 35 KB;
  desktop 1920 px at most 120 KB).
- Source: Tagline 1; Positioning Statement; op-eds (newest by `published_on`).
- Copy:
  - Eyebrow: "Energy advisory · Research · Sustainability"
  - H1: "Powering the transition."
  - Turn (paragraph, not a heading): "Inspiring sustainable futures."
  - Lede: "Olivia Energy is a strategic energy advisory, research and sustainability consultancy, committed
    to a cleaner, more secure and more inclusive energy future. We bring evidence-based solutions to
    governments, businesses, investors and development organisations."
  - Primary button: "What we do" (`/what-we-do`)
  - Secondary button: "Read the commentary" (`/insights#businessday`)
  - Card label: "Latest in BusinessDay"; date `{short date}`; title `{title}`; meta "Op-ed · {first two
    topics joined by ' · '}"; link label "Read “{title}” on BusinessDay, opens in a new tab".
  - Vertical credit: "Third Mainland Bridge, Lagos · Photo: Solasly, CC BY-SA 4.0"

**2. Why Olivia?** (`#why-olivia`, green; inside the pinned stage on desktop, own section otherwise)

- 1440 (pinned): label and lines in cols 1 to 6, vertically centred; mark window right, 64svh tall.
  Lines in `display-md`, closing line in `display-lg` italic white with a 4 px lime underline.
- 390: label; mark window 300 px tall, centred, with the photo credit under it in 12 px; lines in 28 px;
  closing line 40 px.
- Motion: per 2.10; on phones `light` as each line crosses 60% of the viewport.
- Source: Why Olivia? (verbatim lines).
- Copy:
  - Heading (h2, styled as a label with the flame bullet): "Why Olivia?"
  - Lines (one list): "Energy is changing." / "Policies are evolving." / "Markets are transforming." /
    "Climate risks are increasing." / "Businesses must adapt." / "Governments need evidence." / "Investors
    require clarity." / "Communities deserve sustainable solutions."
  - Closing line: "We exist to bridge these gaps."
  - Unlit colour `#A9CDB5` (3.1:1, large text only), lit `#FFFFFF`.

**3. The gaps, measured** (`#evidence`, lime, with a night plate for Fig. 1)

- 1440: header row: eyebrow and H2 in cols 1 to 7; lede in cols 8 to 12, bottom-aligned. Then four tiles in a
  2 x 2 grid (each cols 6 wide, about 636 x 300): numeral in `text-numeral` with its unit in `display-sm`
  beside it; tag chip; caption (`text-base`, ink); glyph (about 280 x 96) to the right of the caption;
  source line at the tile's foot. Tiles have no fill: a 1 px ink line on top only. Then Fig. 1 on a night
  plate, full container width, about 1296 x 640.
- 390: tiles stacked; numeral 64 px; glyph full width under the caption; Fig. 1 with the tall viewBox.
- Motion: tiles `fade` with stagger; numerals `count`; glyph bars grow (scaleX 0 to 1, 900 ms
  ease-out-expo) then `hatch`. Fig. 1: `sweep`, `hatch`, `pop`. Fig. 1 has a pointer and keyboard readout
  (vertical rule and the three values for the nearest year).
- Source: Brand Story ("driven by evidence"); facts and series below.
- Copy:
  - Eyebrow: "The gaps, measured"
  - H2: "Driven by evidence."
  - Lede: "Our work is driven by evidence and shaped by experience. Four numbers frame it: three gaps to
    close, and one sign of what closing them looks like."
  - Tile 1 (fact `nigeria-no-electricity-2024`): numeral "87" unit "million"; tag "Gap"; caption "people in
    Nigeria had no electricity in 2024, more than in any other country."; glyph: 87 dots, glyph caption
    "Each dot is one million people."; source "Sustainable Energy for All, Tracking SDG7: The Energy
    Progress Report 2026".
  - Tile 2 (fact `nigeria-grid-installed-vs-available-q1-2026`): numeral "32.7%"; tag "Gap"; caption "of
    Nigeria's installed grid capacity was available, on average, in the first quarter of 2026: 4,458 MW of
    13,625 MW."; glyph: share bar, 32.7% solid, the rest hatched, labels "Available" and "Installed"; source
    "Nigerian Electricity Regulatory Commission, Quarterly Report, first quarter 2026".
  - Tile 3 (fact `africa-clean-investment-share-vs-population`): numeral "2%" with "of investment" in
    `display-sm`; tag "Gap"; caption "Africa's share of global clean energy investment in 2025, against 20%
    of the world's population (IEA estimate)."; glyph: two bars 2 and 20, the difference hatched, labels
    "Clean energy investment" and "Population"; source "International Energy Agency, World Energy
    Investment 2025".
  - Tile 4 (fact `nigeria-product-exports-sevenfold-2026`): numeral "7×"; tag "Opening"; caption "Nigeria's
    petroleum product exports rose about sevenfold after the Dangote refinery opened: from 46,000 barrels a
    day in 2023 to 350,000 in the second quarter of 2026."; glyph: two solid bars 46 and 350, labels "2023"
    and "Q2 2026"; source "U.S. Energy Information Administration, Today in Energy, 24 August 2026 (data:
    Vortexa)".
  - Fig. 1 (series `electricity_access_pct`): tag "Fig. 1"; title "Share of people with electricity, 2000
    to 2024"; end labels "World 91.9%", "Nigeria 62.5%", "Sub-Saharan Africa 55.1%"; gap between World and
    Nigeria hatched, pill "29.4-point gap in 2024"; interpretation "Nigeria has raised access from 43.2% to
    62.5% since 2000, ahead of the sub-Saharan average of 55.1%. The world stands at 91.9%: a gap of 29.4
    points still to bridge."; source "Source: World Bank, World Development Indicators (EG.ELC.ACCS.ZS), CC
    BY 4.0. Retrieved 2 October 2026."; readout text "{year}: Nigeria {a}%, sub-Saharan Africa {b}%, world
    {c}%".

**4. Our services** (`#services`, paper)

- 1440: header row (eyebrow and H2 in cols 1 to 7, lede in cols 8 to 12). Then a 3 x 2 grid of cards (cols
  4 wide): photograph 4:5 with `shoulder-lg` (about 416 x 520), then a row with the number label ("01") and
  the glyph (40 px, flood green), the title in `display-sm`, the summary in `text-sm` muted, and the link
  "Explore" with arrow. Under the grid, right-aligned, the button "All services".
- 390: a native horizontal rail (`overflow-x: auto`, `scroll-snap-type: x proximity`), cards 300 px wide,
  the next card visibly cut at the right edge; the rail bleeds to the screen edges with 20 px inner padding.
- Motion: photographs `wipe` with 90 ms stagger; glyphs `draw`; card hover per the table.
- Images: lazy, `sizes="(min-width: 1024px) 416px, 300px"`, quality 60.
- Source: Our Services (titles), bullets condensed into summaries; Refined Brand Narrative (lede).
- Copy:
  - Eyebrow: "What we do"
  - H2: "Six services, one energy future."
  - Lede: "From policy advisory and ESG strategy to market intelligence and capacity building, we help
    governments, businesses, investors and development partners make informed decisions that shape a
    cleaner, more resilient energy future."
  - Cards (title, then summary):
    - 01 "Energy Transition Advisory": "Net-zero strategies, decarbonisation roadmaps and transition plans,
      with renewable integration and climate resilience built in."
    - 02 "Energy Economics & Policy": "Energy market analysis, regulatory advice, economic impact studies,
      tariff analysis and policy development."
    - 03 "ESG & Sustainability": "ESG strategy and reporting, materiality assessments, sustainability
      reporting and carbon management."
    - 04 "Research & Analytics": "Market intelligence, industry reports, feasibility studies, data
      analytics and scenario modelling."
    - 05 "Capacity Development": "Executive training, energy transition workshops, ESG education,
      leadership development and public policy seminars."
    - 06 "Project Advisory": "Project and programme management, stakeholder engagement, risk management, and
      monitoring and evaluation."
  - Card link: "Explore" (accessible name "Explore {title}"), to `/what-we-do#{slug}`.
  - Button: "All services" (`/what-we-do`).

**5. Who we serve** (`#who-we-serve`, paper deep; shared block, compact variant)

- 1440: header (eyebrow, H2, lede in a 7 + 5 split). Four tiles in a row (cols 3 wide, about 306 x 380,
  `shoulder`): Governments on green, Private sector on night, Development partners on lime, Academia on red.
  Each: number label ("01"), title in `display-sm`, items as a list in `text-sm`, one per line, each with
  the flame bullet.
- 390: tiles stacked, full width, auto height.
- Motion: tiles `fade` with stagger. No interaction; every list is visible.
- Source: Who We Serve (institution types only; decision 11).
- Copy:
  - Eyebrow: "Who we serve"
  - H2: "For the institutions that shape energy systems."
  - Lede: "Our advice is built for four kinds of institution, from energy ministries and regulators to
    investors, development partners and research institutes."
  - "Governments": "Energy ministries" / "Regulators" / "State agencies"
  - "Private sector": "Oil and gas" / "Utilities" / "Renewable energy developers" / "Manufacturing" /
    "Financial institutions"
  - "Development partners": "Multilateral development banks" / "Bilateral agencies" / "UN agencies" /
    "Foundations and non-governmental organisations"
  - "Academia": "Research institutes" / "Universities"

**6. Our founder** (`#founder`, night)

- 1440: cols 1 to 5: portrait (existing `FOUNDER.portrait`, displayed at most 300 x 375 CSS px, `shoulder-lg`)
  with a lime ring halo (2 px, about 420 px diameter, centred on the portrait's top-right corner, behind
  it). Cols 6 to 12: eyebrow; H2 in `display-lg`; role line; credentials in `display-md` white with lime
  middle dots; lede in `text-xl` muted; three counters in a row (numeral 72 px lime, label `text-sm` white,
  source `text-xs` muted); the button "About our founder" (lime button on night).
- 390: portrait 240 x 300 centred, then the text; counters in a three-column row with 44 px numerals;
  credentials may wrap.
- Motion: portrait `wipe`; halo `draw`; counters `count`.
- Source: About the Founder; Our Founder; verified facts (decision 13).
- Copy:
  - Eyebrow: "Our founder"
  - H2: "Dr Olugbenga Olaoye"
  - Role: "Founder and energy economist"
  - Credentials: "PhD · MPS · MBA · PMP · CSM" with a visually hidden sentence "PhD in Economics, Master of
    Public Service, Executive MBA, Project Management Professional and Certified ScrumMaster."
  - Lede: "An energy economist who bridges industry, academia and public policy. He holds a PhD in
    Economics from Covenant University, a Master of Public Service from the Clinton School of Public
    Service and an executive MBA from Lagos Business School, and he writes on energy security, the Dangote
    refinery and the energy transition for BusinessDay."
  - Counter 1: "9", "journal articles since 2022", source "ORCID 0000-0003-2658-916X"
  - Counter 2: "200+", "citations", source "Google Scholar, retrieved 2 October 2026"
  - Counter 3: "{n}", "op-eds in BusinessDay", source "BusinessDay, {first month and year} to {last month and
    year}" (today "June 2025 to September 2026")
  - Button: "About our founder" (`/about#founder`)

**7. On the record, in BusinessDay** (`#businessday`, paper; cover wall block, home layout)

- 1440: header: eyebrow, H2 in `display-xl`, lede (cols 1 to 8); count line and "All commentary" link right.
  Cover wall: the lead cover (lime, cols 1 to 6, about 636 x 560) for the newest op-ed; four standard covers
  in a 2 x 2 grid (cols 7 to 12) for the next four op-eds whose topics are not only Policy (the two
  sanitation pieces never appear here). Then a quotation panel (paper deep, `shoulder`, full width): a large
  red flame quotation mark, the quote in `display-md`, attribution in `text-sm`. Then the Insights line and
  eight chips, and the link "Visit Insights".
- 390: lead cover full width; a native rail of the four covers (260 px wide, the next one cut); quotation
  panel; chips wrap.
- Motion: covers `fade` with stagger and their art `draw`; the quotation `mask`; hover per the table.
- Source: op-eds (data); Olivia Energy Insights (format names).
- Copy:
  - Eyebrow: "Commentary"
  - H2: "On the record, in BusinessDay."
  - Lede: "Dr Olaoye writes on energy security, the Dangote refinery and the energy transition: {eleven}
    op-eds since June 2025, and quoted as an energy economist in {twelve} BusinessDay reports."
  - Count line: "{11} op-eds · quoted in {12} BusinessDay reports"
  - Link: "All commentary" (`/insights#businessday`)
  - Cover anatomy (all covers): label "BusinessDay · {short date}" (lead: "Latest · BusinessDay · {short
    date}"); title; topic chips (at most three); the whole cover links to the article, accessible name "Read
    “{title}” on BusinessDay, opens in a new tab".
  - Quotation: "Nations that fail to refine what they produce will always import the consequences of global
    instability." Attribution: "Dr Olugbenga Olaoye, “Nigeria’s unexpected shield in a time of global
    energy turbulence”, BusinessDay, 24 March 2026". (Configured by slug in content; if that op-ed is absent
    the panel uses the newest op-ed with a pull quote.)
  - Insights line: "Olivia Energy Insights is building a library of:"
  - Chips: "Energy transition briefings" / "Downstream market outlooks" / "African Energy Outlook" / "ESG
    insights" / "Policy briefs" / "Executive commentaries" / "Research papers" / "Webinars and podcasts"
  - Link: "Visit Insights" (`/insights`)

**8. We believe** (`#believe`, red; close band, home variant)

- 1440: text in cols 1 to 7: eyebrow, four lines in `display-md`, the statement in `display-xl`, the button.
  Ring and ghosted mark at right.
- 390: ring above, then text.
- Motion: lines `fade` with stagger; statement `mask`; ring `close`.
- Source: Our Philosophy.
- Copy:
  - Eyebrow: "We believe"
  - Lines: "Energy changes lives." / "Policy shapes markets." / "Innovation accelerates progress." /
    "Knowledge drives transformation."
  - Statement: "Sustainability is not a choice. It is a responsibility." (the second sentence italic, white)
  - Button: "Start a conversation"

**9. Footer** (3.2).

### 4.2 What we do (`/what-we-do`)

**1. Hero** (green, `data-hero="dark"`)

- 1440: cols 1 to 6: eyebrow, H1 in `display-xl` white, lede in `text-xl` (`#E1F0E6`). Cols 7 to 12: Fig. 1
  on a night plate (about 636 x 540). The H1 is the LCP.
- 390: eyebrow, H1 48 px, lede, then the plate (tall viewBox); the plate must begin inside the first 844 px.
- Motion: H1 static; lede `fade`; Fig. 1 `sweep` left to right, then the pill `pop`.
- Source: Mission (H1 and lede); series `solar_pv_module_price`; facts `africa-solar-resource-share`,
  `africa-solar-pv-installed-2025`.
- Copy:
  - Eyebrow: "What we do"
  - H1: "Research, strategic advice and practical solutions."
  - Lede: "We help governments, businesses and institutions navigate a changing energy landscape while
    advancing sustainability, energy security and economic growth."
  - Fig. 1: tag "Fig. 1"; title "The price of solar modules, 1975 to 2024"; subtitle "US dollars per watt,
    constant 2025 prices, log scale"; labels "$132.38 in 1975" and "$0.27 in 2024"; pill "99.8% cheaper"
    (lime pill, ink text); interpretation "Solar modules now cost a fraction of what they did. Africa holds
    60% of the world's best solar resources, yet had less than 1% of the world's installed solar capacity at
    the end of 2025."; source "Source: Our World in Data, from IRENA (2025), Nemet (2009), and Farmer and
    Lafond (2016), CC BY 4.0; International Energy Agency, Africa Energy Outlook 2022; IRENA, Renewable
    Capacity Statistics 2026. Retrieved 2 October 2026."

**2. Chapter bar** (sticky under the header, paper)

- A single row of six links (existing `service-nav.tsx` behaviour, restyled): "01 Transition", "02 Economics
  & Policy", "03 ESG", "04 Research", "05 Capacity", "06 Projects". Current chapter: flood green 2 px
  underline and `aria-current="true"`. 390: the row scrolls horizontally.

**3 to 8. Six chapters** (each `id={slug}`)

- Surfaces: 01 paper, 02 night, 03 paper, 04 paper deep, 05 paper, 06 paper deep.
- 1440 (chapters 01, 03 to 06): photograph 4:5 in cols 1 to 5 (cols 8 to 12 on 03 and 05) with
  `shoulder-lg` and its caption; text in cols 7 to 12 (1 to 6 on 03 and 05): label "{0n} / 06", glyph 64 px
  (`draw`), title in `display-lg`, chapter lede in `display-sm` (Newsreader roman), body in `text-lg`, the
  five services as a two-column list with flame bullets, then the numeral card (card surface, `shoulder`):
  numeral in `text-numeral` (96 px cap inside cards), tag, caption, glyph, source.
- 390: label, glyph and title; photograph full width; lede; body; list in one column; numeral card.
- Chapter 02 (night): cols 1 to 5 hold the label, glyph, title, lede, body and list, followed by the three
  steps (each about 70svh tall at desktop); cols 6 to 12 hold Fig. 2, sticky (`top: header + 32 px`) on
  desktop within the 250svh step range, changing `data-step` 1 to 3. On 390 the plate is static in its final
  state with a legend, after the three step texts.
- Motion: photographs `wipe`; glyphs `draw`; numerals `count`; Fig. 2 squares change state with a 400 ms
  colour transition, staggered 6 ms a square from top-left.
- Source: Our Services (titles and bullets); philosophy lines and values as chapter ledes; facts below.
- Copy per chapter:
  - **01, `energy-transition-advisory`**: label "01 / 06"; title "Energy Transition Advisory"; lede
    "Innovation accelerates progress."; body "We help organisations set net-zero strategies and turn them
    into decarbonisation roadmaps and transition plans that integrate renewables and build climate
    resilience."; list "Net-zero strategies" / "Decarbonisation roadmaps" / "Renewable integration" /
    "Transition planning" / "Climate resilience"; numeral card (fact `nigeria-power-2060-277gw`): "277 GW",
    tag "Target", caption "of installed power capacity by 2060 is the target in Nigeria's updated Energy
    Transition Plan, with electricity generation rising 6.5 times from 2020.", source "Nigeria Energy
    Transition Plan, 2024 update, hosted by Sustainable Energy for All". Photo `tarfaya-wind`.
  - **02, `energy-economics-policy`**: label "02 / 06"; title "Energy Economics & Policy"; lede "Policy
    shapes markets."; body "We analyse energy markets, advise on regulation and tariffs, and measure the
    economic impact of policy, so that decisions rest on evidence."; list "Energy market analysis" /
    "Regulatory advisory" / "Economic impact studies" / "Tariff analysis" / "Policy development". Photo
    `abuja-city-gate` (shown above the steps at 4:5, cols 1 to 5). Fig. 2 (facts
    `nigeria-grid-installed-vs-available-q1-2026`, `nigeria-grid-delivered-q1-2026`): tag "Fig. 2"; title
    "Installed is not delivered: Nigeria's grid, first quarter of 2026"; legend "Each square is 100 MW" /
    "Available, not generated" (hatched) / "Unavailable" (outline); steps:
    - "01 Installed" / heading "Installed: 13,625 MW" / "Nigeria's 28 grid-connected power plants have
      13,625 MW of installed capacity. Each square is 100 MW."
    - "02 Available" / heading "Available: 4,458 MW" / "On average in the quarter, less than a third of it
      could run: a plant availability factor of 32.7%."
    - "03 Delivered" / heading "Delivered: 4,113 MWh an hour" / "That is what the grid actually generated,
      on average, each hour of the quarter: 8,883 GWh in total. The red squares were available but not
      generated."
    - Squares: 136 in total (17 x 8); state 2 lights 45; state 3 keeps 41 lit and hatches 4. Note under the
      legend: "Squares are rounded to the nearest 100 MW."
    - Plate photograph `lagos-lekki-night` at the foot of the plate, caption inside "Lekki-Ikoyi Link
      Bridge, Lagos. Photo: Opeyemi Adisa, Unsplash".
    - Source: "Source: Nigerian Electricity Regulatory Commission, Quarterly Report, first quarter 2026.
      Retrieved 2 October 2026."
  - **03, `esg-sustainability`**: label "03 / 06"; title "ESG & Sustainability"; lede "Growth,
    environmental protection and social impact, in balance."; body "We help organisations set an ESG
    strategy, report against it with confidence and manage their carbon."; list "ESG strategy" / "ESG
    reporting" / "Materiality assessments" / "Sustainability reporting" / "Carbon management"; numeral card
    (fact `nigeria-flaring-rank-2025`): "83%", tag "Gap", caption "of global gas flaring in 2025 came from
    nine countries, Nigeria among them, which together produced 46% of the world's oil.", glyph two bars 83
    and 46 with the difference hatched, labels "Gas flaring" and "Oil production", source "World Bank,
    Global Gas Flaring Tracker Report, June 2026". Photo `bayelsa-flare`.
  - **04, `research-analytics`**: label "04 / 06"; title "Research & Analytics"; lede "Knowledge drives
    transformation."; body "We turn data into decisions: market intelligence, industry reports, feasibility
    studies and scenario models built for the question at hand."; list "Market intelligence" / "Industry
    reports" / "Feasibility studies" / "Data analytics" / "Scenario modelling"; numeral card (series
    `electricity_per_person`, 2025 values): "175 kWh", tag "Gap", caption "of electricity was generated
    per person in Nigeria in 2025, against a world average of 3,860 kWh.", glyph two bars 175 and 3,860 with
    the difference hatched, labels "Nigeria" and "World", source "Our World in Data, from Ember (2026), CC
    BY 4.0". Photo `lagos-market`.
  - **05, `capacity-development`**: label "05 / 06"; title "Capacity Development"; lede "Training that
    bridges industry, academia and public policy."; body "We design executive training, workshops and
    seminars that build the skills the energy transition needs, for leaders in government and industry.";
    list "Executive training" / "Energy transition workshops" / "ESG education" / "Leadership development"
    / "Public policy seminars"; numeral card (fact `ssa-population-growth-2054`): "2.2 billion", tag
    "Context", caption "people will live in sub-Saharan Africa by 2054, after 79% growth in thirty years, on
    United Nations projections.", no glyph, source "United Nations, World Population Prospects 2024". Photo
    `lecture-hall`.
  - **06, `project-advisory`**: label "06 / 06"; title "Project Advisory"; lede "Disciplined execution,
    from first plan to final evaluation."; body "We bring project and programme management discipline to
    energy projects, with stakeholder engagement, risk management, and monitoring and evaluation."; list
    "Project management" / "Programme management" / "Stakeholder engagement" / "Risk management" /
    "Monitoring and evaluation"; numeral card (fact `africa-energy-investment-fall-debt`): "85%+", tag
    "Gap", caption "Debt service costs equalled more than 85% of Africa's total energy investment in 2025,
    and that investment was a third lower than in 2015 (IEA estimates).", glyph a share bar with 85%
    hatched, label "Debt service as a share of energy investment", source "International Energy Agency,
    World Energy Investment 2025". Photo `ethiopia-lineman`.

**9. What makes us different** (green)

- 1440: cols 1 to 5: eyebrow and H2 (`display-lg`, white). Cols 6 to 12: six rows, each a number label
  ("01") and a statement in `display-xs` white, divided by the green surface line.
- 390: stacked.
- Motion: rows `fade` with stagger.
- Source: What makes us Different?
- Copy:
  - Eyebrow: "What makes us different"
  - H2: "Practical advice, informed by real operations."
  - Rows: "Deep industry expertise across conventional and renewable energy." / "Evidence-based research
    and economic analysis." / "Practical policy advice informed by real-world operations." / "Experience
    across government, industry, academia and the non-profit sector." / "A global perspective with a
    strong understanding of African energy markets." / "A commitment to sustainable development and energy
    equity."

**10. Four pillars** (paper)

- 1440: header (eyebrow, H2); four tiles in a row (cols 3, about 306 x 400, `shoulder`): Research on green,
  Advisory on night, Innovation on lime, Impact on red. Each: glyph 64 px, number label, title in
  `display-md`, line in `text-base`.
- 390: stacked tiles.
- Motion: tiles `fade`; glyphs `draw`.
- Source: Four Pillars.
- Copy:
  - Eyebrow: "How we work"
  - H2: "Four pillars."
  - "Research": "Independent research that informs decisions."
  - "Advisory": "Strategic advice for governments and businesses."
  - "Innovation": "Helping organisations navigate energy transformation."
  - "Impact": "Creating measurable social, economic and environmental value."

**11. Who we serve** (paper deep; shared block, full variant: same copy as home section 5, H2 level 2).

**12. Close** (red): no eyebrow, no lines; statement "Governments need evidence. Investors require clarity.";
button "Start a conversation".

### 4.3 About (`/about`)

**1. Ignition** (night, `data-hero="dark"`)

- 1440: cols 1 to 7: eyebrow, H1 in `display-lg` white (four or five lines), lede in `text-xl` muted. Cols 8
  to 12: the mark in true colours, about 340 x 472, vertically centred; `IgnitionLazy` overlays it on
  eligible devices.
- 390: the mark 150 x 208 centred at the top, then eyebrow, H1 (40 px), lede.
- Motion: eligible desktops: ignition (`IgnitionLazy` on About); everyone else: the mark draws (ring 900 ms, red flame 700 ms
  from 300 ms, lime tongue 700 ms from 500 ms, fills fade in over 400 ms); reduced motion: static. The H1
  is static (LCP).
- Source: The Brand Story (headline and first paragraph).
- Copy:
  - Eyebrow: "About Olivia Energy"
  - H1: "Powering Africa's energy future through knowledge, innovation and sustainable solutions."
  - Lede: "The global energy landscape is going through its greatest transformation in history. As nations
    balance energy security, economic growth and environmental responsibility, the need for trusted
    advisers has never been greater."

**2. Our story** (photo band, `abuja-lightpoles`)

- 1440: photograph full bleed, 21:9, `shoulder-lg` on the top-right corner of the band; a text panel at the
  bottom left over a night scrim, cols 1 to 7.
- 390: photograph 4:5 full width; the text below it on night.
- Motion: photograph `wipe`; paragraph two `mask`.
- Source: The Brand Story (paragraphs two and three).
- Copy:
  - Eyebrow: "Our story"
  - Paragraph (`text-lg`): "At Olivia Energy, we bridge the gap between policy, business, research and
    technology, helping governments, corporations, development institutions and investors navigate the
    complexities of the energy transition."
  - Statement (`display-sm`): "Our work is driven by evidence, shaped by experience and focused on
    sustainable solutions that create long-term value for society."
  - Caption: "Street lights at sunset, Abuja. Photo: Habila Mazawaje, Unsplash"

**3. Who we are** (paper)

- 1440: cols 1 to 5: eyebrow and H2 (`display-lg`); cols 7 to 12: two paragraphs in `text-lg`.
- 390: stacked.
- Source: A Refined Brand Narrative.
- Copy:
  - Eyebrow: "Who we are"
  - H2: "One of the defining challenges of our time."
  - Paragraph 1: "Olivia Energy is a strategic energy advisory, research and sustainability firm dedicated
    to helping organisations navigate the global energy transition. We combine deep industry experience
    with rigorous research and innovative thinking."
  - Paragraph 2: "We deliver practical solutions that strengthen energy security, accelerate
    decarbonisation, improve environmental performance and create sustainable economic value. From policy
    advisory and ESG strategy to market intelligence and capacity building, we help governments,
    businesses, investors and development partners make informed decisions that shape a cleaner, more
    resilient energy future."

**4. Vision and mission** (split: green panel and lime panel)

- 1440: two panels side by side, each half the viewport, min-height 560 px; the left panel's top-right
  corner and the right panel's top-right corner use `shoulder-lg`. Text in `display-md`, max 22ch per
  line block width 520 px.
- 390: stacked, each panel full width.
- Motion: text `mask`.
- Source: Vision Statement; Mission Statement.
- Copy:
  - Green panel: eyebrow "Our vision"; text "To be Africa's leading energy transition, sustainability and
    policy advisory firm, shaping resilient energy systems that drive economic prosperity, environmental
    stewardship and inclusive development."
  - Lime panel: eyebrow "Our mission"; text "To provide innovative research, strategic advice and practical
    solutions that help governments, businesses and institutions navigate a changing energy landscape while
    advancing sustainability, energy security and economic growth."

**5. Our values** (paper)

- 1440: header (eyebrow, H2) then five full-width rows: glyph 48 px, value name in `display-sm` (cols 2 to
  5), sentence in `text-lg` (cols 6 to 12), hairline between rows.
- 390: glyph and name on one line, sentence below.
- Motion: rows `fade`; glyphs `draw`.
- Source: Core Values.
- Copy:
  - Eyebrow: "Our values"
  - H2: "What we hold ourselves to."
  - "Excellence": "We pursue the highest standards in research, consulting and client service."
  - "Integrity": "We act ethically, transparently and professionally in every engagement."
  - "Innovation": "We embrace new ideas, technologies and approaches to solve complex energy challenges."
  - "Sustainability": "We promote responsible energy solutions that balance economic growth, environmental
    protection and social impact."
  - "Collaboration": "We build strong partnerships that create lasting value for clients and communities."

**6. Our founder** (`#founder`, paper deep)

- 1440: cols 1 to 5: portrait (at most 300 x 375 CSS px, `shoulder-lg`) with a flood-green ring halo; under
  it three profile pills. Cols 6 to 12: eyebrow, H2, role, the six points (list with flame bullets,
  `text-lg`), then "Credentials" as a horizontal timeline (a 1 px line with ring nodes for dated items, then
  undated items as chips at the end), then four counters, then the source line.
- 390: portrait 240 x 300, the text, the timeline vertical (line on the left), counters in a 2 x 2 grid.
- Motion: portrait `wipe`; timeline line `draw` with nodes `pop` in order; counters `count`.
- Source: About the Founder; Our Founder; verified facts.
- Copy:
  - Eyebrow: "Our founder"
  - H2: "Dr Olugbenga Olaoye"
  - Role: "Founder, Olivia Energy · Energy economist · Fort Worth, Texas"
  - Points:
    1. "A PhD in Economics from Covenant University, with a focus on energy and environmental economics."
    2. "A Master of Public Service from the Clinton School of Public Service, University of Arkansas,
       grounded in governance and policy."
    3. "An executive MBA from Lagos Business School, and PMP and Certified ScrumMaster credentials for
       strategy execution."
    4. "A published energy policy analyst, with nine journal articles since 2022, and a BusinessDay
       contributor."
    5. "A commentator on downstream reform, energy security and the energy transition, quoted as an energy
       economist in {twelve} BusinessDay reports."
    6. "Someone who bridges industry, academia and public policy, and a member of the United States
       Association for Energy Economics."
  - Timeline heading (h3): "Credentials"
  - Dated nodes: "2000" "BSc Economics, Obafemi Awolowo University" / "2019" "Executive MBA, Lagos Business
    School" / "2022" "MSc Economics, Bells University of Technology" / "2025" "PhD Economics, Covenant
    University"
  - Undated chips: "Master of Public Service, Clinton School of Public Service" / "Project Management
    Professional (PMP)" / "Certified ScrumMaster (CSM)" / "Member, United States Association for Energy
    Economics"
  - Timeline source: "Degrees and dates as listed on his ORCID record (0000-0003-2658-916X). Master of Public
    Service and USAEE membership as stated in his BusinessDay author notes."
  - Counters: "9" "journal articles" / "200+" "citations, Google Scholar, 2 October 2026" / "{11}" "op-eds in
    BusinessDay" / "{12}" "BusinessDay reports quoting him"
  - Profile pills: "ORCID", "Google Scholar", "LinkedIn" (URLs from `FOUNDER.profiles` and settings)

**7. Where we started** (paper)

- 1440: cols 1 to 5: eyebrow and H2; cols 7 to 12: paragraph and a definition list.
- 390: stacked.
- Source: verified company facts; "real-world operations" (What makes us different).
- Copy:
  - Eyebrow: "Where we started"
  - H2: "Real-world operations, since 2020."
  - Paragraph: "Olivia Energy and Power Company Limited was incorporated in Nigeria on 26 February 2020.
    That year it opened two fuel retail outlets in Southwest Nigeria, in June and in November. Running them is
    where our practical view of energy markets began."
  - Definition list (amended 5 November 2026 on the client's instructions of 3 October: no town or state is
    named, and the United States entity is shown beside the Nigerian one): "Nigeria" "Olivia Energy and Power
    Company Limited · RC 1662525 · Incorporated 26 February 2020" / "United States" "Olivia Group LLC ·
    Registration ID 805857089 · Formed 14 January 2025" / "Locations" "Fort Worth, Texas · Southwest Nigeria"

**8. Close** (red): statement "We exist to bridge these gaps."; button "Start a conversation".

### 4.4 Insights (`/insights`)

**1. Hero** (lime, `data-hero="light"`)

- 1440: cols 1 to 6: eyebrow, H1 in `display-xl` ink, lede. Cols 7 to 12: Fig. 1 on a night plate with a
  date chip.
- 390: text, then the plate (it must begin inside the first 844 px).
- Motion: H1 static; Fig. 1 `sweep`, `hatch` on the sub-Saharan area, `pop`.
- Source: Our Philosophy (H1); Olivia Energy Insights; series `people_without_electricity`.
- Copy:
  - Eyebrow: "Olivia Energy Insights"
  - H1: "Knowledge drives transformation."
  - Lede: "Analysis, commentary and data on energy security, downstream markets and the energy transition
    in Africa."
  - Fig. 1: date chip "Figure · October 2026"; tag "Fig. 1"; title "People without electricity, 2000 to
    2024"; end labels "World 657 million" and "Sub-Saharan Africa 579 million"; the sub-Saharan area is
    hatched; interpretation "Since 2000 the number of people without electricity has more than halved
    worldwide, from 1.34 billion to 657 million. In sub-Saharan Africa it rose, from 506 million to 579
    million, so the region is now home to most of the people still without power."; source "Source: Our
    World in Data, from World Bank, CC BY 4.0. Retrieved 2 October 2026."; "Get the data (CSV)".

**2. What we publish** (paper)

- 1440: header (eyebrow, H2, lede) then a 4 x 2 grid of tiles (card, `shoulder-sm`, about 306 x 220): name in
  `display-xs`, description in `text-sm`, status label at the foot (a link when it has a count).
- 390: one column.
- Source: Olivia Energy Insights (formats), decision 10.
- Copy:
  - Eyebrow: "What we publish"
  - H2: "Eight formats, one standard of evidence."
  - Lede: "Olivia Energy Insights is building a library for decision makers. Two formats are already in
    print. The others are in preparation, and each will appear here with its first issue."
  - Tiles (name, description, status):
    - "Energy transition briefings", "Short, sourced reads on what changed in the transition and why it
      matters.", `{n} published` or "First issue coming"
    - "Downstream market outlooks", "Fuel supply, pricing and refining, including the Dangote refinery.",
      as above
    - "African Energy Outlook", "A continental view of energy access, investment and supply.", as above
    - "ESG insights", "Practical notes on ESG strategy, reporting and carbon management.", as above
    - "Policy briefs", "Evidence for ministries, regulators and state agencies.", as above
    - "Executive commentaries", "Op-eds and commentary by Dr Olugbenga Olaoye.", "{11} published in
      BusinessDay" linking `#businessday` (plus posts in this format, if any)
    - "Research papers", "Peer-reviewed research by our founder.", "{9} journal articles" linking
      `/research`
    - "Webinars and podcasts", "Conversations on energy policy and markets.", `{n} published` or "First
      episode coming"

**3. Articles** (paper deep)

- 1440: header (eyebrow, H2) and the topic filter (existing category routes as chips: "All topics" plus each
  category label); a 3-column grid of post cards: cover 3:2 with `shoulder`, chips (format if set, topic),
  title in `display-sm`, dek in `text-sm`, date and reading time in `text-xs`.
- 390: one column.
- Copy: eyebrow "Latest analysis"; H2 "Articles"; filter label (visually hidden) "Filter by topic"; empty
  state "The first articles are in preparation."
- Category pages (`/insights/category/[slug]`) reuse this section with H1 "{Category label}" and the eyebrow
  "Insights".

**4. In BusinessDay** (`#businessday`, paper; cover wall block, archive layout)

- 1440: header (eyebrow, H2, lede); the lead cover (newest, lime) spanning cols 1 to 8, then every other
  op-ed as standard covers in a 3-column grid, newest first, including the two sanitation pieces.
- 390: the lead cover, then compact covers in one column (title, date, chips, a small art shape).
- Copy:
  - Eyebrow: "In BusinessDay"
  - H2: "On the record."
  - Lede: "Op-eds by Dr Olugbenga Olaoye, newest first. BusinessDay publishes them on its opinion pages
    under its house byline; each closes with his author note."

**5. Quoted in BusinessDay** (same section, below the wall)

- A two-column list at 1440 (date in `text-xs` label style, title as an external link in `text-base`,
  "BusinessDay Pro" chip where the outlet says so); one column on phones.
- Copy:
  - H3: "Quoted in BusinessDay"
  - Lede: "{Twelve} BusinessDay reports have quoted Dr Olaoye as an energy economist."
  - Footnote: "One of these reports was also syndicated by Parrot Nigeria." with "Parrot Nigeria" linking
    the syndicated copy.

**6. Close** (red): statement "Communities deserve sustainable solutions."; button "Start a conversation".

### 4.5 Article (`/insights/[slug]`)

- Header (paper): breadcrumb "Insights / {Category label}"; chips (format if set, category); H1 in
  `display-lg` (max 22ch); dek in `text-xl`; meta line "By {author} · {long date} · {n} min read"; cover
  (16:9, `shoulder-lg`, container width) with its caption if the post has one.
- Body: the existing `Prose`, restyled: 19 px Instrument Sans, max 68ch, H2 in `display-sm`, H3 in
  `display-xs`, blockquotes in `display-xs` italic with a red flame mark, links underlined in flood green,
  figures with `shoulder` corners and captions in `text-sm`.
- After the body: author card (paper deep, `shoulder`): portrait 72 px in a shoulder frame; "Dr Olugbenga
  Olaoye is the founder of Olivia Energy and an energy economist. He writes for BusinessDay." and the link
  "About our founder".
- "More insights": three cards (same card as the Insights grid), heading (h2) "More insights".
- Close (red): as Insights.

### 4.6 Research (`/research`, redirected from `/publications`)

**1. Hero** (paper, `data-hero="light"`)

- 1440: cols 1 to 6: eyebrow, H1 in `display-xl`, lede, two counters (9, 200+). Cols 7 to 12: Fig. 1 on a
  night plate.
- 390: text, counters, plate.
- Motion: H1 static; markers `pop` in date order (20 ms apart).
- Source: Four Pillars (Research line); verified publication record.
- Copy:
  - Eyebrow: "Research"
  - H1: "Independent research that informs decisions."
  - Lede: "Peer-reviewed research and published commentary by our founder, Dr Olugbenga Olaoye, on energy
    economics, environmental quality and policy."
  - Counters: "9" "journal articles since 2022"; "200+" "citations, Google Scholar, 2 October 2026"
  - Fig. 1: tag "Fig. 1"; title "In print, 2022 to 2026"; legend "Journal article" (lime ring) and
    "BusinessDay op-ed" (white flame); interpretation "{Nine} journal articles since 2022 and {eleven}
    op-eds in BusinessDay since June 2025."; source "Source: ORCID record 0000-0003-2658-916X; BusinessDay.
    Retrieved 2 October 2026."

**2. Journal articles** (paper deep)

- 1440: two-column list of cards (card, `shoulder`): journal in label style, year, title in `display-xs`,
  authors in `text-sm` if present, "Read the article" (DOI link).
- 390: one column.
- Copy: eyebrow "Peer-reviewed"; H2 "Journal articles"; link label "Read the article" (accessible name
  "Read “{title}”, opens in a new tab").

**3. Commentary** (paper)

- Rows: short date, title (external link), topic chips. Then the link "See the covers on Insights"
  (`/insights#businessday`).
- Copy: eyebrow "Commentary"; H2 "In BusinessDay"; lede "{Eleven} op-eds by Dr Olaoye, newest first."

**4. Profiles** (paper)

- A row of pills; one sentence above.
- Copy: H2 "Find the record"; sentence "His publications are listed on ORCID and Google Scholar."; pills
  "ORCID", "Google Scholar"; text line "Member, United States Association for Energy Economics".

**5. Close** (red): statement "Our work is driven by evidence and shaped by experience."; button "Start a
conversation".

### 4.7 Contact (`/contact`)

**1. Hero** (red, `data-hero="dark"`)

- 1440: cols 1 to 6: eyebrow, H1 in `display-xl` white, lede. Cols 7 to 12: the dotted Africa (one SVG file
  shown with `<img>`, white dots at 35% opacity), a ring around Southwest Nigeria (white ring over a faint
  disc, sized in degrees so it marks a region, not a town; amended 5 November 2026 on the client's
  instructions), and the label "Southwest Nigeria" beside the ring. Below the map, as separate text (not on
  the map): "And in Fort Worth, Texas, United States".
- 390: H1, lede, then the map at 320 px tall (it must begin inside the first 844 px).
- Motion: dots fade in; the region ring `draw`.
- Source: Why Olivia? (two lines); settings (addresses).
- Copy:
  - Eyebrow: "Contact"
  - H1: "Start a conversation."
  - Lede: "Governments need evidence. Investors require clarity. Tell us what you are working on, and we will
    be in touch."
  - Map label: "Southwest Nigeria"; line below: "And in Fort Worth, Texas, United States"

**2. Message and details** (paper)

- 1440: cols 1 to 7: the existing form inside a card (`shoulder`), unchanged fields, restyled inputs (1 px
  ink line, 4 px corners, 48 px tall, 17 px text, flood-green focus ring 2 px). Cols 9 to 12: details.
- 390: form, then details.
- Copy:
  - Form heading (h2): "Send a message"
  - Intro: "Tell us about your organisation and the question you are working on."
  - Existing labels, help text, validation messages and the success message stay as they are in
    `src/content/contact.ts` unless they contain an em dash (replace it with a comma or full stop).
  - Details headings: "Email" (settings email); "Where we are" ("Fort Worth, Texas, United States" /
    "Southwest Nigeria", from settings); "Company" ("Olivia Energy and Power Company Limited" / "RC
    1662525").

### 4.8 Not found (404)

- Green flood, min-height 80svh. A `RingMark` that stays open (a 25% gap, white, 160 px), then the text.
- Copy:
  - Eyebrow: "Error 404"
  - H1: "Page not found."
  - Lede: "This is one gap we can close. Try one of these instead."
  - Links (pills): "Home", "What we do", "Insights", "Contact"

### 4.9 Credits (`/credits`, new) and Privacy

- Credits (paper): eyebrow "Credits"; H1 "Credits"; lede "The photographs, data and typefaces on this site,
  with their authors and licences."; sections "Photographs" (table: image, place, author, licence linked,
  source page, "Cropped and colour-graded" where true), "Data" (each series and fact source used, with
  licence and retrieval date), "Map" ("Africa outline from Natural Earth, public domain"), "Typefaces"
  ("Newsreader" and "Instrument Sans", each with its designers exactly as named in the font's own licence
  or metadata in the repo, and "SIL Open Font License"; do not name designers from memory); closing note
  "Adapted versions of photographs licensed CC BY-SA are shared under the same licence."
- Privacy (paper): existing copy from `src/content/legal.ts`, restyled with the paper surface and the type
  scale; H1 "Privacy".

---

## 5. What the admin edits

The client (or the developer for him) edits in `/admin`:

- **Publications**: journal articles as today; op-eds with kind "Op-ed", title, outlet ("BusinessDay"),
  URL, publication date, topics (from the topic list: Dangote Refinery, Energy security, Energy
  transition, Downstream, Oil and gas, Power, Climate and ESG, Policy, Economy), pull quote and summary;
  mentions with kind "Mention", title, outlet, URL and date. A new op-ed appears on Home (hero card and
  covers), Insights, Research and the counts within an hour, or at once after a cache purge.
- **Posts**: the new "Format" select (none, or one of the eight formats); everything else as today.
- **Settings**: the tagline (set once to "Powering the transition. Inspiring sustainable futures."), email,
  addresses, socials, Scholar URL. The old "stats" setting is no longer shown on the site.
- Not in the admin (code, by the developer): page copy, figures and their data (refresh yearly; each file
  carries its retrieval date), photographs and credits.

## 6. Never write

"Speaker" with specifics; years of experience; team size; client names; "partners" with named
institutions; USAID; "monthly", "quarterly" or "annual" before a format exists; "Graphic of the month";
"Read the briefing"; "thirteen" reports; "Nigeria LNG"; "mangrove"; "Dangote" beside any photograph; any
number not drawn from the facts registry, a series, or the publication data.
