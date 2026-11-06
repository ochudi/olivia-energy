# Craft audit, November 2026

An audit of the "Bridging Light" rebuild for the tells that make a site read as
generated rather than designed. Run on 6 November 2026 against the committed tree
(`d16ea2b`), a clean production build served on port 3002, and screenshots of
every public route at 390 and 1440. No code was changed by this audit.

The brief for it: the client asked for bold, eye-catching graphics. The goal is
not restraint. It is that every visible choice was clearly made for this firm,
and that nothing on the page could belong to any other site.

Companion documents: `DESIGN.md` at the repo root (the direction the CHANGE
verdicts build towards) and `docs/design/2026-10-bridging-light.md` (the
creative brief the current site was built from).

---

## 1. Method

| Step                            | What ran                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build and serve                 | `npm run build` (Next 16.3.7, 41 routes, no errors) against the local harness, `next start -p 3002`.                                                                                                                                                                                                                                                           |
| Rendered HTML                   | Every public route exported with `curl` to `.screenshots/craft-audit/html/` (home, what-we-do, about, insights, research, contact, credits, privacy, one article, one category page, 404). A line-split copy in `html-pretty/` gives the scanners usable line numbers.                                                                                         |
| avoid-ai-design 0.4.0           | `scripts/detect.mjs` over `src/` (328 files) and over the line-split HTML (11 files). The catalog's IDs (SD4, SD6, M1 and so on) are used below.                                                                                                                                                                                                               |
| Impeccable 4.8.0, engine 0.1.18 | `detect` over `src/` (regex rules only) and, with a headless Chromium, over every route at 1440 x 900 and 390 x 844 (20 live scans, 86 findings). The scan of the exported HTML files could not resolve the hashed stylesheets and produced one false positive per page (`flat-type-hierarchy`, every heading read as 16 px); only the live scans are counted. |
| Vercel Web Interface Guidelines | The `command.md` ruleset applied by a review agent to the public source and the rendered HTML. 21 findings, eight of them defects.                                                                                                                                                                                                                             |
| Screenshots                     | Hero and full page at 390 and 1440 for the eleven routes, plus crops of the sections the verdicts refer to, in `.screenshots/craft-audit/`. No horizontal overflow and no console errors on any route (the 404 page logs its own 404).                                                                                                                         |

Two notes for the gate in step 5. The avoid-ai-design scanner takes about five
minutes on the eleven line-split pages and never finished on the minified
single-line files; stripping `<script>` blocks before the scan should bring it
under a minute, since scripts are not UI. Impeccable's `detect` on exported HTML
needs the stylesheets next to the files; scan the running server instead.

Scanner totals before any verdict:

| Scanner                          | P0  | P1  | P2  | Notes                                                                                                                                                                                                               |
| -------------------------------- | --- | --- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| avoid-ai-design on `src/`        | 0   | 5   | 21  | 16 of the 21 P2s are in `/styleguide` and the admin, which are not public pages; one P1 is an email template.                                                                                                       |
| avoid-ai-design on rendered HTML | 0   | 7   | 5   | SD6 on three pages, SD5 and SD4 once each, L4 once, SD4d on six pages.                                                                                                                                              |
| Impeccable live scans            |     |     |     | 40 kicker-above-heading, 20 overused-font, 20 cream-palette, 16 hero-eyebrow-chip, 12 numbered-section-labels, 7 line-length, 4 repeating-stripes (advisory), 2 italic-serif-display, 1 tight-leading, 1 straggler. |

---

## 2. The eight suspected tells, judged on screen

Each verdict was taken from the screenshots and the live scans, not from the
scanner alone. KEEP carries the brand reason; CHANGE carries the replacement.
Severity is by who notices: P0 a layperson, P1 a designer or developer, P2
polish.

### 2.1 The lime italic "turn" in every headline · P1 · CHANGE (narrowed)

Where it is: `src/components/ui/display.tsx:69` (`Turn`, Newsreader italic in
`--turn-color`). Used on the home hero (`src/components/sections/home/opening/index.tsx:114`),
the Why Olivia closing line (`opening/index.tsx`, "We exist to bridge these
gaps."), the home close band (`src/components/blocks/close-band.tsx:102`,
"Sustainability is not a choice. _It is a responsibility._") and the footer
tagline on every page (`src/components/sections/site-footer.tsx:95`). Impeccable
flags the close band as `italic-serif-display` at 104 px on 1440 and 52 px on
390; the catalog calls the single accented sentence SD5/T3.

Judged: it is not in every headline. Section H2s are roman. But the close band
on the home page and the footer on every page put an italic lime line in front
of the reader twice per visit, and on the close band it is the second sentence
of a statement, which is exactly the "one accented phrase" move.

Verdict: KEEP the italic in one place only, the client's own two-sentence
tagline ("Powering the transition." / "Inspiring sustainable futures."), on the
home hero and in the footer. The second sentence is the turn of his phrase, not
a decoration added to it. CHANGE everywhere else: the close-band statement is
set roman in full (`close-band.tsx:102-107` drops `Turn`;
`src/content/brand.ts:373` loses `turn`), and the Why Olivia landing line keeps
its lime underline but goes roman. Rule for the system: italic is never a word
or a sentence inside a heading; it is the tagline's second line, and nothing
else.

### 2.2 Tracked eyebrow strings with " · " separators · P1 · CHANGE

Where it is: `src/components/ui/eyebrow.tsx:17-48` and the `label` utility
(`src/app/globals.css:82-90`: 12 px, uppercase, 600, tracking 0.14em) on 40
headings across the ten routes (Impeccable `kicker-above-heading`, 40 hits;
`hero-eyebrow-chip` on every inner-page H1). The middle-dot strings:
`src/content/home.ts:43` ("Energy advisory · Research · Sustainability"),
`:52` ("Op-ed · {topics}"), `:249-250` (role and credentials),
`src/content/about.ts:65,120,125,127`, `src/content/brand.ts:408-415` (cover
labels and the count line), `src/content/site.ts:188`,
`src/content/insights.ts:57,103`, and the `Separated` helper built to wrap them
(`opening/index.tsx:23-41`). The scanner reports SD4d on six rendered pages and
SD4 on the article's tag list (`src/components/insights/share-links.tsx:47`).

Judged: the eyebrow duplicates the heading or the navigation almost every time
("What we do" above "Six services, one energy future.", "Contact" above "Start
a conversation.", "Credits" above "Credits", "Privacy" above "Privacy",
"Research" above "Independent research that informs decisions."). The flame
bullet in front of it is the one brand-specific thing in the row.

Verdict: CHANGE. Remove the eyebrow wherever it restates the heading or the
current nav item (every hero, Services, Who we serve, Our founder, Commentary,
Our values, Four pillars, What makes us different, Credits, Privacy). Keep a
line above a heading only where it carries information the heading does not,
and set it as a sentence in the body face, no tracking, no caps: "11 op-eds,
quoted in 12 BusinessDay reports", "Latest in BusinessDay, 10 Sep 2026",
"Figure, October 2026". Replace every " · " with punctuation or structure: the
hero eyebrow is deleted (the lede says it); the card meta becomes topic chips
without "Op-ed"; the credentials read "PhD, MPS, MBA, PMP, CSM"; the role line
and the footer places become two lines; the cover label reads "BusinessDay, 24
Mar 2026". The flame bullet survives as the list marker it already is in Why
Olivia, Who we serve and the chapters. The `label` utility stays for the two
places uppercase is the convention: table heads and the axis labels of charts.

### 2.3 01 to 06 chapter numbering · P1 · CHANGE (sequence only)

Where it is: `src/content/site.ts:53-91` gives each service a `number`;
`src/content/what-we-do.ts:78-80` builds "01 / 06"; rendered at
`src/components/sections/home/services.tsx:35`, the chapter bar
`src/components/sections/what-we-do/chapter-bar.tsx:121`, the chapter label in
`chapter-parts.tsx`, `src/components/blocks/who-we-serve.tsx:67`,
`src/components/sections/what-we-do/pillars.tsx:47`,
`differentiators.tsx:43`, `src/components/sections/insights/what-we-publish.tsx:103`,
`src/app/(site)/privacy/page.tsx:46`, and even the phone menu
(`src/components/sections/site-header.tsx:499`). SD6 on three rendered pages,
`numbered-section-labels` six times on What we do, and the privacy page's
numbered headings trip SD5 as well.

Judged: services, audiences, pillars, differentiators, formats, privacy
sections and menu items are not sequences. The numbers imitate a report's
rigour without being one. Two places are real sequences: the three steps of
Fig. 2 ("01 Installed, 02 Available, 03 Delivered" is a flow through the grid)
and the years on the research timeline.

Verdict: CHANGE. Drop the numerals from services, audiences, pillars,
differentiators, formats, privacy and the menu. The chapter bar on What we do
shows each service's own glyph and short name instead of its number: the six
glyphs in `src/components/ui/glyphs.ts` were drawn for exactly this job and
are the firm's, not a template's. KEEP the step numbers inside Fig. 2 and the
years on the timeline, which are information.

### 2.4 "Fig. N" labels · P2 · KEEP, restyled

Where it is: `src/components/ui/fig-tag.tsx:4-10` (an outline pill, 12 px
uppercase) on every `FigurePlate` (`src/components/figures/figure-plate.tsx:81`):
home Fig. 1, What we do Fig. 1 and 2, Insights Fig. 1, Research Fig. 1.

Judged: every figure is a real chart of a real series with a title, a reading,
a source line with retrieval date, "View as table" and "Get the data (CSV)".
That is the register of his nine journal articles and the NERC and IEA reports
he cites. A figure number belongs there the way it belongs in a paper. What
reads as chrome is the dress: the pill and the tracking make it a badge.

Verdict: KEEP the numbering (the brand reason is the evidence register the
whole site is built on). CHANGE the dress: "Fig. 1" set in Newsreader at text
size, roman, before the title, no pill, no uppercase, like a journal caption.
Numbering keeps restarting per page. Where the running text can name the
figure ("Fig. 2 shows it"), it should.

### 2.5 Count-up counters · P2 · CHANGE

Where it is: `src/components/ui/animated-number.tsx` (count from 0 over
`--duration-counter`, `src/styles/tokens.css:244`), used by
`src/components/ui/stat.tsx:46`, `src/components/figures/numeral-figure.tsx:81`
(the four home tiles and the six chapter cards),
`src/components/sections/home/founder-band.tsx:152` and
`src/components/sections/about/founder.tsx:178`. The avoid-ai-design scan also
flags the founder band's row of round numbers as L4 (`html-pretty/home.html:359`).

Judged: the numbers are true and sourced, which is the opposite of the "hollow
stat strip" the catalog describes. The count-up is still a default: it
animates the one thing on the tile that does not need animating, while the
glyph beside it (87 dots, a hatched share bar) is the part that carries the
argument.

Verdict: CHANGE. Numerals render final, always. The motion budget on a tile
goes to the glyph: dots fill, bars grow, the hatch draws in after them. The
founder counters stay (they are the record: 9 articles, 200+ citations, 11
op-eds, 12 reports) but as static numerals on a hairline, and the home band
shows two of them, not three, so it stops reading as a stat strip.
`AnimatedNumber` leaves the public bundle.

### 2.6 One shoulder radius on every image and card · P1 · KEEP the shape, CHANGE where it applies

Where it is: tokens `src/styles/tokens.css:204-212` and utilities
`src/app/globals.css:66-78`; applied by `src/components/ui/card.tsx:49`,
`figure-plate.tsx:74`, `numeral-figure.tsx:69`, `shoulder-image.tsx:55-60`,
`src/components/blocks/op-ed-cover.tsx`, `quote-panel.tsx`,
`src/components/sections/contact/contact-message.tsx`,
`research/journal-articles.tsx`, `insights/cover-image.tsx`,
`insights/author-card.tsx`, the audience and pillar tiles, the format tiles,
the latest-op-ed card.

Judged: the shoulder itself is not a default. One large top-right corner cut
from the ring of the mark, with three tight corners, is a shape no template
ships, and it is drawn at three sizes. What makes it read as a kit (K2) is
that every bounded thing on the site gets it: photographs, covers, flood
tiles, figure plates, the contact form, journal cards, format tiles, the
author card. When everything is the brand shape, nothing is.

Verdict: KEEP the shoulder as the firm's shape, on the things that are the
firm's own objects: photographs and flood panels (`shoulder-lg`), op-ed covers,
the four flood tiles and the latest-op-ed card (`shoulder`). CHANGE the
instruments to square 4 px corners: figure plates, numeral cards, the contact
form, inputs, journal cards, format tiles, the author card, the quote panel.
A chart is an instrument; it does not wear the logo. Elevation stays at none
(a 1 px line, or a tonal night plate), which is already right.

### 2.7 Night slab plus a single lime accent · P1 · KEEP, with a rule

Where it is: the night surface `src/app/globals.css:329-364` sets
`--color-primary` to lime; tokens `src/styles/tokens.css:41,45`. Night slabs:
every figure plate, the founder band, the About hero, the latest-op-ed card,
the footer. SD2 by name ("near-black ground plus one acid-green accent").

Judged: three things separate this from the SD2 default. Lime `#88C029` is
the logo's own tongue, not a colour chosen for voltage; night `#06170E` is a
green-black built from the mark's green, not neutral black; and night is one
of five surfaces (paper, green, lime, red, night) that the page moves through,
never the page itself. On the night plates the red hatch and the paper-white
second series are always present, so lime is rarely alone. The footer carries
the mark in all three colours.

Verdict: KEEP. Rule for the system: a night slab is a plate for data, a
portrait or the footer, never for prose; on night, lime never appears without
the red gap or the paper series beside it; and the site never shows two night
slabs in a row. The About hero (night, with the full-colour mark) is the one
exception, because the mark is what it shows.

### 2.8 Identical reveal animation on every section · P2 · CHANGE

Where it is: `src/components/ui/reveal.tsx:84-90` (`variant` defaults to
`fade`). 45 `Reveal` elements in 32 public components; 34 use the default
fade, 4 `draw`, 3 `sweep`, 1 `wipe`, 1 `mask`, plus 20 headings with
`reveal="mask"` and 4 images with `reveal="wipe"`. M1 in the catalog.

Judged: the brief defined seven motions and then applied `fade` to almost
every block: every tile, every list item, every card, every row. Headings mask
up on every section. The reader meets the same lift on each scroll and stops
seeing it.

Verdict: CHANGE, per the motion system in step 3. One signature moment per
page (named in `DESIGN.md`), and three reveals tied to content type: `draw`
for data (chart lines, glyphs, the hatch, the ring), `wipe` for photographs,
and nothing for text. Headings, ledes, lists and cards are static in the
server HTML and stay so. Scroll effects move to native CSS scroll-driven
animations behind `@supports`, with the final state as the fallback, so
`Reveal` shrinks to the two variants that remain.

---

## 3. Other tells found

### P0 · a layperson recognises it

**P0-1 · The template chrome stack.** No single finding above is a P0; the
catalog's rule is to judge combinations, and the combination is what a
stranger sees: a tracked uppercase label above every heading (2.2), two-digit
numbers on things that are not sequences (2.3), an italic phrase set apart in
a statement (2.1), an arrow in a ring on every button (P1-1), and a warm cream
ground (P1-2). Together these are the "tasteful AI" page. The fix is the sum of
the CHANGE verdicts; none of them alone clears it.

### P1 · a designer or developer recognises it

**P1-1 · An arrow on every button and link.** `src/components/ui/button.tsx:11-12,69-75`
(the ring arrow); 30 `arrow` props across the public components: "What we do
→", "Explore →" six times, "All services →", "About our founder →", "All
commentary →", "Read the article →" nine times, "Send message →", "Start a
conversation →" on every close band and in the footer. CP3 in the catalog,
I3 (`ArrowRight`) at `src/components/contact/contact-form.tsx:3` and
`src/components/insights/copy-link-button.tsx:3`. CHANGE: buttons carry their
label and nothing else. The ring survives in one role, the external-link
marker on op-ed covers and journal cards (where the ring already means "the
mark" and the link leaves the site).

**P1-2 · The cream ground.** `--color-paper: #F5F0E4` (`src/styles/tokens.css:47`)
and `--color-paper-deep: #EAE2CE` (`:48`); Impeccable `cream-palette` on all
20 live scans. It is the most recognised second-order default. The brief
chose it for reading, which is a reason but not a brand reason. CHANGE: the
ground takes the mark's green at about five per cent over white, a cool
green-cast field, `#F1F3EA`, with the deep band at `#E6EBDC`. Ink stays
`#0B1F14` (15.4:1), muted ink 6.5:1, flood-green text 4.9:1, red ink 5.7:1; on
the deep band subtle ink drops to 4.5:1, so the deep band keeps using muted
ink as it does today. Every other surface is untouched. This is the one
change that touches every page, and it is why it needs sign-off in step 2.

**P1-3 · Long sentences at display-xl.** Impeccable `oversized-h1`: What we do
(104 px, 51 characters, 55 vh), Research (104 px, 44 characters, 44 vh), About
(72 px, 88 characters, 40 vh). The home H1 at 150 px is two words and is
right. CHANGE: an H1 that is a full sentence takes `display-lg`; `display-xl`
is for statements of six words or fewer. (`src/components/sections/what-we-do/hero.tsx`,
`research/research-hero.tsx`, `about/hero.tsx`.)

**P1-4 · Two identical four-colour tile rows on one page.** What we do shows
"Four pillars" (green, night, lime, red) and then "Who we serve" (green,
night, lime, red) a screen apart (`src/components/sections/what-we-do/pillars.tsx`,
`src/components/blocks/who-we-serve.tsx`), and the home page shows the second
of them again. CHANGE: the pillars become one row of their four glyphs with
their lines on the paper surface; the four flood tiles appear once per page.

**P1-5 · Straight apostrophes in rendered titles.** `src/content/commentary.ts:161,168`
(two mention titles; the `typeset()` helper only runs on editor content) and
`:26,112` in summaries. Typography defect from the Vercel review. CHANGE in the
source data (`supabase/seeds/source/commentary.json`) and regenerate.

### P2 · polish

**P2-1 · Line length on Credits and Privacy.** Impeccable `line-length`: about
106 characters on Credits (`src/app/(site)/credits/page.tsx`, the lede) and 85
to 89 on Privacy (`src/app/(site)/privacy/page.tsx`, several paragraphs; the
68ch cap is on the column, not the paragraphs that sit outside it). CHANGE:
`max-w-text` on the offending blocks.

**P2-2 · The founder anchor is covered by the header.** `src/components/sections/about/founder.tsx:76`
is the only linked anchor without `scroll-mt-header` (Vercel review). CHANGE.

**P2-3 · The contact form's email and message fields.** No `spellCheck={false}`
on the email input (`src/components/contact/contact-form.tsx:258-271`) and no
`autoComplete` on the textarea (`:301-312`). CHANGE.

**P2-4 · One theme-colour for six coloured heroes.** `src/app/layout.tsx:49`
sets `#f5f0e4` for every route, while home, about, what-we-do, insights,
contact and 404 open on night, green, lime, red or a photograph. CHANGE: a
per-route `viewport` export in those pages.

**P2-5 · `touch-action: manipulation` is not set.** Nowhere in the public CSS
(Vercel review). CHANGE: one rule on interactive elements in `globals.css`.

**P2-6 · Body images without dimensions.** `src/components/insights/tiptap-content.tsx:134-135`
renders editor images without width and height when the editor did not store
them. CHANGE: fall back to the stored upload's dimensions, or require them.

**P2-7 · The hatch as a CSS gradient.** `src/components/figures/hatch.tsx:51`
draws the HTML share bars with `repeating-linear-gradient`; Impeccable reports
it as `repeating-stripes-gradient` (advisory) on home and What we do. KEEP: the
hatch is the system's one semantic texture (it means the gap, and nothing
else; `DESIGN.md`, Colours). Record the ignore in step 5 citing that line.

**P2-8 · The faces.** Impeccable `overused-font` on every scan (Instrument Sans
carries 70 to 90 per cent of the text); the catalog's T2 cluster. KEEP: the
pair was chosen against Inter and Fraunces with the reasons in
`src/app/fonts.ts:5-35`, Newsreader carries the identity at display size, and
a face change is a rebuild the brief did not ask for. Record the ignore citing
`DESIGN.md`, Typography.

**P2-9 · `countWords`.** `src/lib/content/format.ts:66-69` spells counts one to
twenty as words in prose ("eleven op-eds"). The Vercel guideline prefers
numerals; the house style is documented. KEEP.

**P2-10 · Admin and styleguide hits.** 16 of the source scan's P2s are
monospace labels in `/styleguide` and the admin, plus `ArrowRight` in the admin
overview and one "WORD, fragment" comment in `src/app/fonts.ts:5`. Not public
UI; left alone.

---

## 4. Vercel Web Interface Guidelines review

21 findings, eight defects and thirteen judgment calls where the site makes a
documented choice. The defects are carried above as P1-5 and P2-2 to P2-6, plus
`countWords` (P2-9, kept). The judgment calls, left as they are: programmatic
focus targets with `outline-none` (`contact-form.tsx:166`, `layout.tsx:33`,
`site-header.tsx:451`); no `beforeunload` guard on a four-field form; reveals
that animate `clip-path` and `stroke-dashoffset` (all collapsed under reduced
motion); `background-size` on the link underline; hand-rolled month names
(`format.ts:35-105`, to avoid ICU's "Sept"); no `translate="no"` on the
wordmark and RC number; no `overscroll-x-contain` on the three horizontal
rails (`category-filter.tsx:65`, `home/services.tsx:82`, `cover-wall.tsx:63`,
minor); unclamped editor titles; sentence case and the first-person voice,
which are the house style.

Everything else the guidelines ask for is already in place: skip link first on
every route, `lang="en-GB"`, heading order on all eleven routes, no duplicate
ids, every icon-only control named, decorative SVGs hidden, live regions on the
readout, the copy button and the form, external links announcing the new tab,
a global `:focus-visible` outline with every `outline-none` paired to a ring,
labels via `htmlFor`, `type="email"` with `inputMode`, inline errors with
first-error focus, no `transition: all`, reduced motion handled globally and
in every gate, fonts self-hosted with swap and preload, hero image eager with
`fetchPriority="high"` and every other image lazy, `text-wrap` balance and
pretty, tabular numerals on tables and stats, `color-scheme` set per surface.

---

## 5. What is already the firm's

For the record, so the rewrite does not touch it: the mark window on the home
page (the photograph surviving inside the logo as the green floods in); the
op-ed covers cut from the mark's own shapes, coloured by topic; the red hatch
that means the gap on every chart; the ring that closes on every close band;
the 14 line glyphs built from the ring, the tongue and the dot; the graded
photographs of Lagos, Abuja, Bayelsa, Tarfaya and the Ethiopia to Kenya line;
the Africa dot map ringing Southwest Nigeria; the figures with their sources,
tables and CSVs; the five-surface page rhythm. The silhouette of the home
page (hero, flood, lime band of numbers, photo grid, four tiles, portrait,
cover wall, red band) is not any other product's page.

---

## 6. Verdict table

| Tell                               | Severity | Verdict                         | Replacement or reason                                                                                     |
| ---------------------------------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Lime italic turn                   | P1       | CHANGE (narrowed)               | Italic only for the tagline's second line (hero, footer); close band and Why Olivia go roman.             |
| Tracked eyebrows and " · "         | P1       | CHANGE                          | Eyebrows removed where they restate the heading; informational lines in sentence case; dots replaced.     |
| 01 to 06 numbering                 | P1       | CHANGE (sequences keep numbers) | Numbers only on Fig. 2's steps and the timeline; chapter bar shows glyphs.                                |
| "Fig. N"                           | P2       | KEEP, restyled                  | Evidence register of his papers and the reports cited; caption style, no pill.                            |
| Count-up counters                  | P2       | CHANGE                          | Final numerals; motion goes to the glyphs; founder band shows two counters.                               |
| One shoulder everywhere            | P1       | KEEP shape, CHANGE scope        | Shoulder for photographs, covers, flood tiles; 4 px for instruments (plates, forms, cards).               |
| Night plus lime                    | P1       | KEEP, with a rule               | The mark's own colours; night is one of five surfaces; never prose, never two in a row, never lime alone. |
| Identical reveal                   | P2       | CHANGE                          | One signature moment per page; draw for data, wipe for photographs, nothing for text.                     |
| Arrow on every button              | P1       | CHANGE                          | Labels only; the ring stays as the external-link marker on covers and journal cards.                      |
| Cream ground                       | P1       | CHANGE (needs sign-off)         | Green-cast field `#F1F3EA`, deep band `#E6EBDC`; contrast holds.                                          |
| Long H1s at display-xl             | P1       | CHANGE                          | Sentences take display-lg; display-xl for six words or fewer.                                             |
| Two four-colour tile rows per page | P1       | CHANGE                          | Pillars become a glyph row; flood tiles once per page.                                                    |
| Straight apostrophes               | P1       | CHANGE                          | Fix in the source data.                                                                                   |
| Hatch as gradient                  | P2       | KEEP                            | The system's one semantic texture.                                                                        |
| The faces                          | P2       | KEEP                            | Decision record in `fonts.ts`; Newsreader carries the identity.                                           |
| Polish (P2-1 to P2-6)              | P2       | CHANGE                          | Line length, anchor offset, form attributes, theme-colour, touch-action, image dimensions.                |

---

## 7. Applied, 6 November 2026

Every CHANGE verdict above and the motion system of `DESIGN.md` were applied in
the working tree the same day (uncommitted), after the direction was approved.
What shipped, in the order of the brief:

- **Motion.** The observer-driven `Reveal` and the route fade are gone. Scroll
  effects are native scroll-driven animations (`src/app/globals.css`,
  "Motion"): `wipe` and `parallax` on photographs, `draw` on glyphs, rings and
  the founder timeline, `sweep`, `hatch` and `pop` on every figure, `assemble`
  on the Insights wall, all behind `@supports (animation-timeline: view())`,
  scripting on and no reduced-motion preference, with the final state as the
  fallback. The What we do grid is pure CSS on named step timelines
  (`chapter-installed.module.css`; `installed-scene.tsx` deleted). The Research
  timeline and the Contact map play once on load from 64rem (`figure-lead`,
  `africa-map.module.css`) and on scroll below it. Routes change through
  React `ViewTransition` (`src/app/(site)/template.tsx`), with the header
  pinned by name and each page's H1 named `page-headline` so one morphs into
  the next. Hover effects run only under `(hover: hover) and (pointer: fine)`
  (the `hover` variant is redefined in `globals.css`). The home scene and the
  About ignition are unchanged in mechanism.
- **The eight tells.** Italic only on the tagline's second line (the close
  band statement and the Why Olivia landing line are roman). Eyebrows removed
  everywhere; the informational lines are sentences in the body face; every
  middle dot in copy became a comma or a line break (the `Separated` helper is
  gone). Numbers only on Fig. 2's three steps and the timeline years; the
  chapter bar shows the six glyphs. "Fig. n" is a Newsreader caption with no
  pill. Numerals are final; the glyphs are what move; the home founder band
  shows two counters. The shoulder stays on photographs, covers, flood tiles
  and the latest-op-ed card; plates, numeral cards, the form, journal cards,
  format tiles, the author card and the quotation panel are square.
- **The other P1s and P2s.** Buttons carry their label only; the ring with a
  diagonal arrow is the external-link marker (`Button external`, the hero
  card, journal cards). The ground is the field, `#F1F3EA` and `#E6EBDC`
  (`tokens.css`; the contrast table in `src/lib/utils/contrast.ts` updated).
  The What we do and Research H1s are display-lg. The pillars are a glyph
  row. Apostrophes fixed in `supabase/seeds/source/commentary.json` and the
  commentary regenerated. Credits and Privacy at `max-w-text`; the founder
  anchor clears the header; the email field has `spellCheck={false}` and the
  message `autoComplete="off"`; each coloured hero exports its own
  `viewport.themeColor`; `touch-action: manipulation` on controls. Editor
  images already take their dimensions from the upload when it knows them
  (`article-editor.tsx`); nothing more can be done for a file without them.
- **Gate.** `npm run slop` (`scripts/slop.mjs`) exports every route in the
  sitemap plus the 404 from a running build, strips scripts, splits tags onto
  lines and runs the detector at `--min=P1`. One ignore, recorded in the
  script with its reason: L4 on the home numbers band (sourced figures, not
  a stat strip; `DESIGN.md`, Do's and Don'ts).
- **Not done here.** The hosted database still holds the two op-ed titles
  with straight apostrophes; the regenerated seed covers a fresh database,
  and the two hosted rows need a one-line update when the next hosted SQL is
  pasted.
