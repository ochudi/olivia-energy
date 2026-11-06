# November 2026 device QA

A pass over every public route at fourteen viewports, from a 320 px phone to a
2560 px monitor, with the Galaxy Z Fold emulated in both postures. Run on
6 November 2026 against the production build on port 3002, in the cached
Chromium 130 (the one `CHROME_PATH` names in the briefing), with the page
captured in its first screen (motion on) and in full (reduced motion, final
state). Full pages are viewport frames stitched together, not one tall
capture: a single full-page capture resizes the viewport, which moves every
`svh`-based layout between measuring and rendering and produced repeated
content and blank ground below the footer in the first round (the live
document height matched the footer's bottom edge on every such page). Nothing
has been committed; the working tree holds the fixes.

The capture script lives outside the repository (it was a one-off); the
screenshots it produced are in `.screenshots/device-qa/<viewport>/`, 586 files,
and each folder carries a `report.json` with the measurements below.

## 1. The matrix

Routes: `/`, `/what-we-do`, `/about`, `/insights`, `/research`, `/contact`,
`/credits`, `/privacy`, one article (`/insights/nigeria-downstream-after-deregulation`),
one category (`/insights/category/energy-transition`) and the 404.

| Viewport                  | Pointer | Posture    | Horizontal overflow | Targets under 44 px | Headline faults | Home H1 | Insights H1 | Contact H1 |
| ------------------------- | ------- | ---------- | ------------------- | ------------------- | --------------- | ------- | ----------- | ---------- |
| 320 x 640 (phone)         | coarse  |            | none                | 0                   | 0               | 60 px   | 41 px       | 48 px      |
| 360 x 780 (phone)         | coarse  |            | none                | 0                   | 0               | 60 px   | 46 px       | 51 px      |
| 390 x 844 (phone)         | coarse  |            | none                | 0                   | 0               | 61 px   | 50 px       | 52 px      |
| 412 x 915 (phone)         | coarse  |            | none                | 0                   | 0               | 64 px   | 53 px       | 53 px      |
| 344 x 882 (Fold cover)    | coarse  |            | none                | 0                   | 0               | 60 px   | 44 px       | 50 px      |
| 673 x 841 (Fold inner)    | coarse  | continuous | none                | 0                   | 0               | 88 px   | 68 px       | 68 px      |
| 673 x 841 (Fold inner)    | coarse  | folded     | none                | 0                   | 0               | 88 px   | 68 px       | 68 px      |
| 768 x 1024 (tablet)       | coarse  |            | none                | 0                   | 0               | 96 px   | 73 px       | 73 px      |
| 820 x 1180 (tablet)       | coarse  |            | none                | 0                   | 0               | 101 px  | 76 px       | 76 px      |
| 1024 x 768 (tablet, wide) | coarse  |            | none                | 0                   | 0               | 120 px  | 63 px       | 80 px      |
| 1180 x 820 (tablet, wide) | coarse  |            | none                | 0                   | 0               | 134 px  | 73 px       | 92 px      |
| 1280 x 720 (short laptop) | fine    |            | none                |                     | 0               | 108 px  | 80 px       | 100 px     |
| 1440 x 900                | fine    |            | none                |                     | 0               | 149 px  | 80 px       | 101 px     |
| 1920 x 1080               | fine    |            | none                |                     | 0               | 150 px  | 78 px       | 99 px      |
| 2560 x 1440               | fine    |            | none                |                     | 0               | 150 px  | 78 px       | 99 px      |

How each column was measured, in the page after it had settled:

- **Horizontal overflow:** the document's scroll width against the viewport
  width, on every route.
- **Targets under 44 px:** every link, button, summary and input that is
  visible, counting a transparent pseudo-element where one extends the
  control, and leaving out links that are words in running text (WCAG 2.5.5
  exempts those). Measured only where the pointer is coarse.
- **Headline faults:** an H1 that leaves the viewport, that is wider than its
  box (a word that would run into the next column) or that an ancestor with
  hidden overflow clips.
- **Fold postures:** Chromium's device emulation (`Emulation.setDeviceMetricsOverride`
  with a `displayFeature` and a `devicePosture`), which makes
  `(horizontal-viewport-segments: 2)` and the `env(viewport-segment-*)`
  values real in the page. The folded run confirms the query matched on every
  route; the continuous run is one segment.

## 2. Findings

Before the fixes, the first capture found:

1. **No horizontal scroll** on any route at any width.
2. **The 150 px home headline holds everywhere.** At 1280 x 720 it gives way
   to 108 px by the existing `min(var(--text-display-2xl), 15svh)` rule and
   the whole hero sits on the first screen; at 320 it is 60 px over four
   lines, nothing clipped.
3. **Two statement headlines ran out of their column.** "transformation."
   on Insights (6.5 em wide) and "conversation." on Contact (5.5 em) are
   single words wider than the six-column text box at 1024 to 2560; the
   measurement showed the word 20 to 150 px past the box on every wide
   viewport. They did not reach the figure beside them, so nothing was
   clipped, but the margin was a few pixels at 1024.
4. **Tap targets.** On every coarse-pointer viewport, 18 to 41 controls per
   route were under 44 px: the header logo (34 px) and the Menu pill
   (40 px), the desktop navigation links on tablets (40 px), every footer
   link (31 px), the chips (28 px), the category filter (40 px), "View as
   table" and "Get the data (CSV)" on every figure (17 px), the share row,
   the breadcrumb, the credits links (23 px) and the text buttons (31 px).
5. **Near-square screens.** At 673 px (the Fold inner, open) every
   two-column grid collapsed to the phone stack because the columns were
   keyed to the 768 px viewport breakpoint: the op-ed wall, the journal
   cards, the format tiles, the four flood tiles and the credits.
6. **Safe-area insets** were not used anywhere, and the viewport meta did not
   declare `viewport-fit=cover`, so on a phone with a notch held sideways the
   browser letterboxes the page instead of the page handling the inset.
7. **Full-height sections** already use the small viewport unit: the home
   stage is `100svh`, the body `min-h-dvh`, the pinned scenes and reveals
   `svh`; the menu is `fixed; inset: 0`. Nothing to change.
8. **Hover-only information:** none. The only hover effects are a scale on
   photographs and colour changes; nothing appears on hover alone.
9. **Foldables:** no layout knew about the hinge, so the op-ed wall and the
   pinned grid figure sat across it on a half-folded screen.

## 3. Fixes

All in the working tree, uncommitted:

- **Tap targets (`src/app/globals.css`, utility `tap`).** Under
  `(pointer: coarse)` a control keeps its drawn size and a transparent
  `::before`, centred on it, makes what the finger can press at least 44 by
  44 px. Applied to the header logo, the navigation links and the Menu
  pill, every `Button`, every linked `Chip`, the category filter, the
  figure plate's "View as table" and CSV link, the footer's links, the
  share row, the breadcrumb, the credits links, the Insights count line and
  the status links on the format tiles. The services card, whose text
  button already covers the whole card with an overlay, opts out of the
  utility's `position: relative` with `pointer-coarse:static!` so the
  overlay keeps its reach. Nothing moves on screen; after the fix every
  coarse-pointer viewport reports zero targets under 44 px.
- **Statement headlines.** Insights and Contact cap the display-xl size by
  their own column's width (`14.5cqi` and `17.5cqi`, from the measured word
  widths), the technique Insights already used with too generous a cap. The
  words now stay inside their box on every viewport; the sizes are in the
  matrix.
- **Near-square screens.** The archive op-ed wall, the journal cards, the
  format tiles, the four flood tiles and the credits grid now take their
  columns from a container query on their own width (`@xl`, 36 rem, for two
  columns; `@4xl`, 56 rem, for the wide layouts) instead of the viewport.
  At 673 px they lay out in two columns; at 390 and at 1440 nothing changed.
- **Safe-area insets.** `viewportFit: "cover"` in the root viewport; the
  header's height token adds `env(safe-area-inset-top)` so `pt-header` and
  `-mt-header` follow and the fixed header pads its content below the
  status bar; the page container's side padding becomes `px-page`, the
  gutter plus the left and right insets (rails inside it undo the gutter
  alone, so they stay inside the safe area); the footer and the open menu
  add the bottom inset. In the capture, which has no insets, every value
  resolves to the old one.
- **Foldables (progressive enhancement).** Under
  `(horizontal-viewport-segments: 2)` a `--hinge-gap` is computed from the
  segments, and any grid marked `data-fold-split` (the two op-ed walls and
  the pinned Fig. 2 scene) lays one cell either side of the hinge, with
  spans reset and the home wall's phone rail unrolled into a stack. The
  rule is unlayered so it wins over the utilities and does nothing where the
  query never matches. Verified in the folded run: the Insights wall sits
  two covers wide with the hinge in the gap, the Fig. 2 plate sits in the
  right segment beside its steps and, after the review below, holds there
  (`data-fold-sticky`) while the steps scroll past in the other segment.

After the first independent review (section 5), four more:

- **Fig. 1 end labels at 1024 px.** On the narrowest half-width plate the
  "World" and "Sub-Saharan Africa" labels collided, because the half box's
  minimum label gap (104 units, about 34 px there) was less than a
  two-line label. The gap is now 170 units (`src/lib/figures/chart-layout.ts`),
  55 px at 1024 and 75 px at 1440; the chart tests still pass.
- **Article header.** The category chip under the breadcrumb restated the
  breadcrumb, so only the format chip remains, and the header's text block
  now shares the body's columns (eight of twelve, from the fourth) so the
  page keeps one axis from breadcrumb to footer; the cover alone runs the
  container's width.
- **Chapter bar below 1024 px.** The rail's right edge fades over 3 rem so a
  cut item reads as "more", and the rail ends with 3 rem of padding so the
  last item clears the fade when scrolled to the end.
- **Fig. 2 on a half-folded screen.** The plate is sticky in its segment
  (above), so the right half no longer sits empty under a short plate.

## 4. Checks

Run on the fixed tree, 6 November 2026:

| Check                          | Result                                                   |
| ------------------------------ | -------------------------------------------------------- |
| `npm run typecheck`            | clean                                                    |
| `npm run lint`                 | clean                                                    |
| `npm test`                     | 35 files, 459 tests passed, 13 skipped                   |
| `npm run build`                | clean                                                    |
| `npm run slop`                 | 0 findings (P0 0, P1 0, P2 0) over 17 rendered routes    |
| `npm run a11y` (all 10 routes) | Accessibility 100, mobile and desktop, no failing audits |
| `npm run format:check`         | clean                                                    |

`npm run a11y` defaults to port 3000; against this server it needs
`BASE_URL=http://localhost:3002` and the route list, as in the briefing.

## 5. Independent review

<!-- review -->
