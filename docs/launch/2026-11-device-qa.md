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
screenshots it produced are in `.screenshots/device-qa/<viewport>/`, 588 files,
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

After the second review, five more:

- **Chapter two on the deep field.** The Economics and Policy chapter was a
  night slab carrying a lede, a list and three step paragraphs, and prose
  never sits on night (DESIGN.md, Colors). The chapter now takes the deep
  field (`surface: "paper-deep"` in `src/content/what-we-do.ts`) and Fig. 2's
  plate is the night object on it; the chapters still alternate field and
  deep field.
- **What we do hero on phones.** The lede ran twelve lines on green before
  the figure. The positioning statement is now two fields, `lede` and
  `ledeMore`; the second sentence sits beside the first from 768 px and
  follows Fig. 1 on phones, so the first screen is the headline, one
  sentence and the figure. Both copies are in the markup, each hidden in
  the other range, so one is ever read.
- **Close band size by length.** display-xl is for statements of six words
  or fewer (DESIGN.md, Typography); the close band now sets a longer
  statement at display-lg (`src/components/blocks/close-band.tsx`). Research
  (ten words) and Home (nine) drop a step; Contact (six) keeps display-xl.
  No copy changed.
- **Privacy measure.** The body column sat at `max-w-text` (42 rem), which
  in Instrument Sans at 17 px is about 82 characters a line. The privacy
  body is capped at 60ch, about 68 characters in this face.
- **Category chip rail.** The same right-edge fade and end padding as the
  chapter bar below 768 px.
- **Two contrast misses from this round**, caught by `npm run a11y` (What we
  do fell to 96): the hero's second sentence at 85 per cent ink on green
  (4.4:1) is now full ink, and the step numbers in green on the deep field
  (4.49:1) are muted ink, as DESIGN.md asks for secondary text on the deep
  band. Back to 100.

After the third review, four more:

- **Vision and mission.** The two panels set heading and statement with
  `justify-between`, so the shorter vision statement sat at the foot of its
  panel while the longer mission filled its own from the top, and the pair
  read as two alignments. Both statements now start at the same distance
  below their headings.
- **Measures, by measurement.** Instrument Sans averages 0.45em a
  character, so the `ch` unit (the width of a zero) and the text container
  token both overshoot: `max-w-text` gave 87 characters on Privacy and the
  article body's own `--container-text` cap gave 79. Privacy's body is now
  33 rem (68 characters at 17 px, measured) and the prose and article body
  rules are 30.5em (68 at any size).
- **Rail fades** on the chapter bar and the chip rail widened to 4.5 rem.
- **Credits table heads** no longer wrap ("Source page").

After the fourth review, three more:

- **About headline at 1024 to 1279.** The sentence H1 ran to seven lines
  with "through" alone on one, because `text-balance` gives up beyond six
  lines. In that range the text column takes eight of twelve columns and an
  18-character measure, the mark four columns; from 1280 the original seven
  and five, 15 characters.
- **Chapter two's runway.** The last step held 70svh of scroll after its
  text, so the chapter ended on a screen that was mostly empty ground beside
  the pinned plate. The last step now holds 45svh.
- **The dot before "And in Fort Worth"** sits on the first line when the
  line wraps on a narrow phone.

Checked and found sound: the "doubled" form intro on the phone contact
page that two reviewers reported is a downsampling artefact of viewing a
4,000 px page as a thumbnail; at full resolution the sentence is drawn once
at 320, 360 and 390, and the DOM holds one copy. The chapter bar at 673
fades over 4.5 rem; a reviewer read the cut as hard, the pixels show the
fade.

Noted and left as they are, with the reason:

- The home founder band carried a short bio on night; it was left at first
  as the client's copy, then removed in round nine because DESIGN.md's rule
  (prose never sits on night) is the client's own approved direction. The
  sentence stays in `src/content/home.ts` for About or a later decision.
- Fig. 1 on Insights crosses the hinge on a half-folded screen: it is a
  full-width plate in a one-column hero, and the brief scoped the fold
  handling to the pinned grid figure and the op-ed wall.
- On What we do at 1440 the chapter-two step rail runs on below the last
  step while the plate is pinned: it is the scroll runway of the signature
  moment.
- The home hero's secondary action is a pill from 640 px and a text link on
  phones, a decision from the October build.
- The Turnstile test-key notice in the contact captures is the local
  build's key, not the page.
- The hero photograph is soft at 2560: the image budget of October caps
  its largest source.

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

Each round, a fresh reviewer subagent that had not seen the session's work was
given `DESIGN.md`, the tell list from `docs/design/2026-11-craft-audit.md`
(section 6) and the screenshots only, and scored every route from 1 to 5 on
five criteria: looks chosen not defaulted, hierarchy, motion restraint,
legibility, and whether a senior designer would ship it. A 4 is "ship with no
notes", a 5 a portfolio piece, a 3 "needs a fix". Anything under 4 was fixed
and the set re-captured and re-reviewed by a new reviewer. Ten rounds were
needed; each reviewer found things the one before had not.

| Round | Under 4                                                                                                                                 | Fixed before the next round                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Also raised                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | What we do (legibility, ship), Insights (legibility, ship), Research (ship), Contact (ship), Article (hierarchy, ship), Category (ship) | Fig. 1 end labels at 1024; the article's duplicate category chip and its axis; the chapter bar fade; the Fig. 2 plate sticky on a folded screen. The rest were capture artefacts (section 1), proved so in the DOM                                                                                                                                                                                                                                                                                                                                                                                        | Founder bio on night (left to the client); 2560 hero softness (image budget)                                                                                                                                                                                                                                                                                                                                                 |
| 2     | What we do (legibility, ship), Research (ship), Privacy (legibility, ship)                                                              | Chapter two on the deep field; the phone hero lede; close band size by length; Privacy measure; chip rail fade; two contrast misses the audit then caught                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Fig. 1 across the hinge on Insights; Turnstile test key (both capture environment)                                                                                                                                                                                                                                                                                                                                           |
| 3     | About (hierarchy, ship), Privacy (legibility, ship), Article (legibility, ship)                                                         | Vision and mission aligned; both measures set at 68 characters by measurement; rail fades widened; credits heads on one line                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Contact footer heading "sliced" at 1440 (not reproduced in the next capture)                                                                                                                                                                                                                                                                                                                                                 |
| 4     | What we do (ship), About (legibility, ship), Contact (legibility, ship)                                                                 | About headline at 1024 to 1279; chapter two's runway; the dot before "And in Fort Worth". The "ghosted" contact sentence was checked at full resolution and is drawn once                                                                                                                                                                                                                                                                                                                                                                                                                                 | Home's lime underline on the ninth Why Olivia line (an accent, kept); the pinned grid is not caught by the fixed scroll stops (checked by eye in the craft pass)                                                                                                                                                                                                                                                             |
| 5     | Home (legibility), Insights (ship)                                                                                                      | The home H1 widowed "the" at 344 and 320 px (the token's 60 px floor): below 352 px it is capped at 16vw. The Insights item is the client's (below)                                                                                                                                                                                                                                                                                                                                                                                                                                                       | The chapter bar's edge at 673 again (the fade is there); the secondary home button as a text link on phones (October decision)                                                                                                                                                                                                                                                                                               |
| 6     | What we do (ship), About (legibility), Insights (ship)                                                                                  | About H1 one size down below 368 px; the chapter bar's current chapter switches at 40 per cent of the viewport, not at the bar; on a half-folded screen the About hero, the Insights hero and the home numerals split either side of the hinge. The other two items are the client's (below)                                                                                                                                                                                                                                                                                                              | The chapter bar's edge at 673 once more; the About mark centred above a left-aligned headline on phones (the October layout)                                                                                                                                                                                                                                                                                                 |
| 7     | What we do (chosen), About (legibility, ship), Insights (legibility, ship)                                                              | The What we do hero's single series was lime alone on night, which DESIGN.md forbids: it is paper white, the pill the lime beside it. The About H1 in a half-folded cell is capped at 5.2vw. The phone plate's label gap goes from 52 to 80 units so the two Fig. 1 labels clear each other at 278 px; the flame marker on the wrapped count line sits on its first line                                                                                                                                                                                                                                  | Which pages split at the hinge (two heroes and the paired objects do; the rest keep the phone stack); the Insights phone wall as a stack of eleven, the home wall a rail (the October decision)                                                                                                                                                                                                                              |
| 8     | Home (hierarchy, ship), What we do (hierarchy), Insights (ship)                                                                         | On a half-folded screen the home wall's lead cover stretched beside the four stacked covers: the lead now spans the width and the four sit two-up. The What we do hero's second sentence, stranded under the plate on phones since round two, is shown from 768 px only. The contact fine print's privacy link has a standing underline. The About story's text at under 1024 px moves off night onto the field. Article lists take the flame marker                                                                                                                                                      | Two findings were misreads of thumbnails: the home numerals band is one lime surface (the green ends above its heading) and the Insights wall ends on two wide covers, not an empty slot. The darker band at the 1920 hero's right edge is the scrim that carries the vertical photo credit (October). Fold-posture nits (the founder portrait, the map label, the 404 pills on the hinge) are the phone stack, out of scope |
| 9     | Home (ship), Insights (hierarchy, ship), Contact (ship)                                                                                 | The home founder band drops its paragraph (prose never sits on night; the copy stays in `src/content/home.ts` for About or a later decision) and keeps name, roles, credentials, the two counters and the button. The home H1 is capped at 14 characters so "Powering the / transition." holds at 1280 too. Lime is the lead cover's alone: the Power topic takes green. "Southwest Nigeria, Nigeria" on Contact drops the country when the line already names it. The lead figures (Research timeline, Contact map) play on load from 768 px, not 1024, so a tablet's first screen is not an empty plate | The Research H1 rag at 1024 ("research" alone on a line) and the credentials line's size on the founder band were notes at 4, left                                                                                                                                                                                                                                                                                           |
| 10    | Category (legibility, ship)                                                                                                             | The category page's lead card split photo and text at 768 px into a 260 px column; it stacks below 1024 now. Three notes at 4 taken as well: the op-ed count line said once (the hero), the Fig. 2 step labels as "Step 1" to "Step 3" under headings that carry the word (bare "01" to "03" tripped the slop gate's numbering tell, though the steps are the one sequence DESIGN.md allows), and no category chip on a category page's own cards                                                                                                                                                         | The home closing line's lime underline (kept, the ninth line lighting is the October design), the home "building a library of" chips (the client's eight formats), the contact inputs' border (a hairline in the strong line colour, ink on focus), and the fold-posture nits                                                                                                                                                |

Portfolio-grade on every round: Home and Insights (5 on "chosen"), and from
round three What we do.

The tenth review is the last complete one. It would ship ten of the eleven
routes as they stood and Category after the one breakpoint change above,
which was made; the eleventh set was captured clean on that build (the matrix
in section 1 is from it), and its review was cut off twice by the machine
sleeping and then stopped to save usage. Scores at the tenth review:

| Route      | Chosen | Hierarchy | Motion | Legibility | Ship      |
| ---------- | ------ | --------- | ------ | ---------- | --------- |
| Home       | 5      | 4         | 4      | 4          | 4         |
| What we do | 4      | 4         | 4      | 4          | 4         |
| About      | 5      | 4         | 4      | 4          | 4         |
| Insights   | 4      | 4         | 4      | 4          | 4         |
| Research   | 4      | 4         | 4      | 4          | 4         |
| Contact    | 4      | 4         | 4      | 4          | 4         |
| Credits    | 4      | 4         | 4      | 4          | 4         |
| Privacy    | 4      | 4         | 4      | 4          | 4         |
| Article    | 4      | 4         | 4      | 4          | 4         |
| Category   | 4      | 4         | 4      | 3 (fixed)  | 3 (fixed) |
| Not found  | 4      | 4         | 4      | 4          | 4         |

Its verdict: "The system is real and applied without exception: two faces,
six colours with jobs, the shoulder on the firm's own objects only, square
instruments, no arrows, no eyebrows, no cream, and the Home, About and
Insights pages are distinctive enough to show."

Two items from rounds five and six are not fixed here because they are the
client's page structure, not craft:

- Six of the eight format tiles on Insights say "First issue coming" or
  "First episode coming". Two reviewers would ship the page only with the
  two live formats as tiles and the six planned ones folded into the
  sentence the home page already uses. The eight formats are the client's
  brief for the Insights library (creative brief 4.4, section 2); the change
  is a short one in `src/components/sections/insights/what-we-publish.tsx`
  once the client agrees.
- What we do ends with three sections after the six chapters: the
  "Practical advice" list, the four pillars and the four flood tiles that the
  home page also carries. One reviewer reads them as three restatements of
  the services and would keep only the first. All three are in the client's
  brief for the page (creative brief 4.2); dropping two is the client's call.

No reviewer in any round saw a tell from the audit list return.
