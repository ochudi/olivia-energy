# October 2026 rebuild: handover for the developer

This is the note for pushing the "Bridging Light" rebuild live. Read sections 1 and 3 first.
Section 4 is the list of manual steps, in order. Section 5 is how to run the site on your machine.

Nothing here has been committed or pushed. The working tree holds every change; review it, commit it and push it yourself.

## 1. What changed

The first version was rejected by the client for three reasons: no impressive, eye-catching graphics; his brand guideline was not used; his BusinessDay publications were missing. The rebuild answers each one on every page, and keeps the stack, the admin and the database layer as they were.

### Pages

| Route                                               | What it is now                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                 | A graded photograph of Third Mainland Bridge under large type, with the latest BusinessDay op-ed as a card on the first screen. On scroll the brand green floods in and the photograph survives only inside the Olivia mark (the "mark window"), while the lines of "Why Olivia?" light one by one. Then evidence, services, who we serve, the founder, a wall of op-ed covers and the closing band |
| `/what-we-do`                                       | The six services as numbered chapters with a sticky chapter bar, the solar price figure, a pinned figure on the Nigerian grid (installed against available capacity), the six differentiators, the four pillars and who we serve                                                                                                                                                                    |
| `/about`                                            | Story, who we are, vision and mission, five values, the founder with a dated credentials timeline and counters, where the company started. On eligible desktops the mark ignites from a small canvas (`IgnitionLazy`); phones and reduced motion get the static mark                                                                                                                                |
| `/insights`                                         | Hero figure, the op-ed shelf "In BusinessDay" and the "Quoted in BusinessDay" list placed above the article archive, the eight Insights formats (two in print, six marked "coming"), category pages that now also show his related op-eds, articles with related op-eds at the foot                                                                                                                 |
| `/research`                                         | New. Replaces `/publications`, which redirects with a 308. The timeline figure "In print, 2022 to 2026", nine journal articles, eleven op-eds, profile links                                                                                                                                                                                                                                        |
| `/contact`                                          | Red hero with the Africa dot map, the existing form (Turnstile, Resend, stored in `contact_messages`) and details                                                                                                                                                                                                                                                                                   |
| `/credits`                                          | New. Every photograph with author, licence and source, all thirteen data series, the map and the typefaces                                                                                                                                                                                                                                                                                          |
| `/privacy`, 404, `/llms.txt`, sitemap, social cards | Updated to the new copy and the new routes                                                                                                                                                                                                                                                                                                                                                          |
| `/styleguide`                                       | The design system on one page (tokens, type, glyphs, figures, covers, surfaces). It is kept for reference, is not linked from the site and is disallowed in `robots.txt`                                                                                                                                                                                                                            |
| `/admin`                                            | Publications gain a kind (journal article, op-ed, mention, report, talk), a publication date, topics, a pull quote and a syndication flag; the article editor gains a Format select. Both fall back safely if the SQL in section 4 step 1 has not been run                                                                                                                                          |

### Design system

The full reference is `docs/design/2026-10-bridging-light.md`. In short:

- Colour as a stage: green is the stage, lime is the evidence, flame red is the gap, paper is for reading, night is used one slab at a time. Lime is never set on red or green; the header maps itself to the surface behind it.
- Type: Newsreader (weight 400) for headlines, numerals and quotations, with its italic used only for the single "turn" in a headline; Instrument Sans for body, labels and navigation. Fonts are self-hosted and subset (121.8 KB on first load).
- Shape: the "shoulder" corner taken from the logo, a family of 14 line glyphs, and covers drawn in the mark's colours.
- Motion is hand-written CSS and a few small client components; no animation library. Reduced motion and no-JavaScript render the final state, and every line of copy is in the server HTML.
- Tokens live in `src/app/globals.css`; the components are under `src/components/{ui,blocks,figures,sections}`.

### Figures

Every page carries a figure: access to electricity in Nigeria, Sub-Saharan Africa and the world (home), people without electricity since 2000 (Insights), the solar module price 1975 to 2024 and installed against available grid capacity (What we do), the publication timeline (Research), the Africa dot map (Contact, credited on `/credits`). The data figures have their source on their face, a "View as table" toggle and a "Get the data (CSV)" link. The thirteen series are copies of verified files under `src/content/data/series/` and are served as CSV from `/data`. Facts are in `src/content/data/facts.ts`; no number is typed into a component. Each figure's markup is held to 15 KB by a test.

### Op-eds

The company's BusinessDay presence was missing. It is now on the home hero (latest op-ed), the home cover wall, the Insights shelf, the Research timeline and list, and the related-op-eds rail on every category and article page. There are 11 op-eds (June 2025 to September 2026) and 13 mention rows (12 BusinessDay reports quoting him, plus one syndicated copy on Parrot Nigeria that is listed but not counted). Until the SQL in section 4 is run, the pages read the same rows from `src/content/commentary.ts`; afterwards they read the database, and new op-eds are added in Admin.

### Removed

The old home sections, the old Publications page, three unused photographs (`about-lagos-power.jpg`, `home-lagos-depot.jpg`, `what-we-do-refinery-night.jpg`), unused content exports and the old Newsreader italic subset. `npm run knip` baseline: see section 3.

## 2. Where things are

| Need                          | Where                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Page copy                     | `src/content/*.ts` (home, what-we-do, about, insights, contact, credits, seo, brand)                                     |
| Op-ed and mention rows (code) | `src/content/commentary.ts`, generated from `supabase/seeds/source/commentary.json` by `scripts/build-commentary.mjs`    |
| Figures and their data        | `src/components/figures`, `src/lib/figures`, `src/content/data`, `public/data`                                           |
| Photographs and credits       | `src/content/images.ts`, `src/content/credits.ts`, `public/images/photos`, `public/images/CREDITS.md`                    |
| Database update               | `supabase/hosted-updates/2026-10-03-commentary-and-formats.sql` and `docs/database/2026-10-03-commentary-and-formats.md` |
| Design system reference       | `docs/design/2026-10-bridging-light.md`                                                                                  |

## 3. Measured results

Production build (`npm run build`, Next 16.3.7, Turbopack, CSP on) served by `next start` against the local harness; Lighthouse mobile (simulated slow 4G, 4x CPU, 390 x 844 at DPR 3), Chrome for Testing 1228, median of three. Every row of the budget table was checked; the lines that matter:

| Check                                       | Result                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`, `format:check`, `typecheck` | exit 0                                                                                                                   |
| `npm test`                                  | 36 files: 462 pass, 13 skip (the research comparison, which needs `RESEARCH_DIR`), exit 0                                |
| `npx --yes knip@5`                          | exit 1 with the 11 known findings (`sharp`, `postcss`, `markSvg`, `faviconSvg` and seven exported types); nothing new    |
| `npm run build`                             | exit 0, no errors or warnings                                                                                            |
| Lighthouse Performance                      | Home 93, What we do 95, About 95, Insights 96, Research 96, Contact 94 (budget 90)                                       |
| Accessibility, Best Practices, SEO          | 100, 100, 100 on all six routes; `npm run a11y` 100 at mobile and desktop                                                |
| LCP                                         | Home 3.16 s, What we do 2.86, About 2.86, Insights 2.79, Research 2.71, Contact 3.01 (target 2.5 s, ceiling 3.0 s)       |
| TBT, CLS                                    | 18 to 86 ms; 0.000 on every page                                                                                         |
| First-load JavaScript                       | Home 161.4 KB gzip (budget 170); the other public routes 153 to 169 KB; `/contact` 185.8 KB (form and Turnstile wrapper) |
| Fonts on first load                         | 121.8 KB (budget 140)                                                                                                    |

Also within budget: CSS 27.9 KB on the home first load (limit 30), home first load on a phone 494 KB in 31 requests (limit 600 KB, 40), home full scroll 640 KB on a phone and 769 KB on desktop, DOM at most 1,052 nodes (limit 1,500), photographs at most 117 KB on phones and 87 KB on desktop.

Two budget rows are over, and both were reviewed and accepted at the final review:

1. **Home LCP, simulated: 3.0 to 3.7 s against a 3.0 s ceiling** (Contact 2.87 to 3.01 s). The LCP element is the 150 px headline. It paints in the fallback serif at first paint (1.4 s simulated, under 0.2 s observed), and the simulated LCP is the moment Newsreader swaps in, so runs land either near 3.0 s or near 3.6 s whatever else changes. Performance stays between 89 and 94 (floor 90 on the median). After the review the phone hero was capped at about 2x density (`PHONE_SIZES` in `src/components/sections/home/opening/hero-picture.tsx`): a 390 px phone now downloads 15.9 KB instead of 33.4 KB, which is real data saved on every phone visit even though it cannot move a font-bound LCP. Check field LCP after launch (Vercel Speed Insights or CrUX).
2. **Home HTML 347 KB uncompressed against a 220 KB budget** (45 KB gzip on the wire). Half of it is the RSC payload, which Next sends as a second copy of the page. Reaching 220 KB needs structural work, not polish; the transfer size is what phones pay for, and it is small.

Decisions taken at the final review: "In BusinessDay" moved up to the second section of `/insights` (brief 4.4 had it fourth) so the client's op-eds start about two screens down on a phone instead of seven and a half; the op-ed covers keep the small label tab cut into their art, so no art crosses a date.

Checked in a browser: no horizontal overflow at 360, 390, 768, 1024 and 1440 on 11 routes; WebKit 26 (Playwright) at 390 and 1440, including the phone menu; reduced motion; JavaScript off. The contact form was submitted end to end on a production build with Resend pointed at a local stub (three submissions, three stub requests, three rows in the local database, no real email sent). One look on a real iPhone is still worth doing.

## 4. Manual steps, in order

1. **Paste the SQL first.** In the hosted Supabase project's SQL editor, paste `supabase/hosted-updates/2026-10-03-commentary-and-formats.sql` and run it. Run it a second time: it must finish without errors and change nothing. Then paste and run `supabase/hosted-updates/2026-11-05-location-and-nipex.sql` the same way (it rewrites three settings rows: the Nigerian location, the outlets figure, the NIPEX line). Then run

   ```sql
   select kind, count(*) from olivia_energy.publications group by kind;
   ```

   and expect journal 9, op-ed 11, mention 13. The file touches only the `olivia_energy` schema, which is how it stays safe on a project shared with other applications. It is generated: change `supabase/migrations/20261003120000_commentary_and_formats.sql` or `supabase/seeds/commentary.sql` and run `npm run db:hosted-sql`, never the output.

2. **Then push.** Review the diff, commit and push yourself (the build never commits). The site also works if step 1 is skipped: it falls back to the op-eds in code, but the admin cannot save the new fields (it says so and saves the rest).
3. **After the deploy**:
   - In Admin, Settings, set the Tagline to "Powering the transition. Inspiring sustainable futures." (it shows in the footer, and the site's own default is the same pair).
   - Purge the caches, or wait an hour. Saving the settings in Admin already purges settings. For the rest, call `POST /api/revalidate` with `Authorization: Bearer <REVALIDATE_SECRET>` and the body `{"table":"publications"}`, then `{"table":"posts"}`, then `{"table":"settings"}`.
   - Open `/`, `/what-we-do`, `/about`, `/insights`, `/research`, `/contact` and `/credits` on a phone.
4. **Licences.** Read the CC BY-SA notes on `/credits` once. Five photographs listed there are CC BY-SA (Solasly, TEDxTarfaya, OgbuefiPascal, Rod Waddington, Marc Lacoste); four appear on pages and the fifth, Noor III, is a spare cover that is credited but not shown. The graded versions are offered under the same licence, and `/credits` says so.
5. **Hosting.** Vercel Hobby is for non-commercial use and a Hobby project cannot be transferred to a team. Decide whether to move this client to Pro before launch.
6. **Ask the client** (send as one message):
   1. A portrait of at least 1600 px on the long side.
   2. His own photographs or footage (the Sango Ota and Oju Ore stations, events, fieldwork), with permission to publish.
   3. Confirmation of the tagline pair "Powering the transition. Inspiring sustainable futures."
   4. Sign-off on Who we serve naming institution types only, and whether any engagement may be named.
   5. Any talks, panels, webinars or podcasts with dates and links, so "speaker" can return.
   6. The year of his Master of Public Service, and confirmation of the credential timeline and of "a focus on energy and environmental economics".
   7. Approval of the op-ed selection on the home page, the two pull quotes, and the "Quoted in BusinessDay" list.
   8. Which Insights format he will publish first, and when.
   9. His LinkedIn URL and any other social profiles to show.
   10. Confirmation that the 2020 fuel retail origin may be told on About.
   11. What "MavenCode" on his LinkedIn title refers to (it stays off the site until he explains).
   12. Approval of the four starter articles on Insights, which carry his byline (two are dated before the September launch), or replacements; edit or unpublish them in Admin, Articles.

   Answered by the client on 3 October 2026 and applied on 5 November 2026, so no longer asked: the United States entity (Olivia Group LLC, registration ID 805857089, formed 14 January 2025, shown on About beside the Nigerian company), the NIPEX registration (vendor ID S77939994 and three categories, the default of the NIPEX wording setting and the footer line), his title (Founder/CEO) and the Nigerian location, which reads "Southwest Nigeria" everywhere and is marked on the Contact map as a region, not a town. Fort Worth, Texas stays as the United States location. The hosted database takes these through `supabase/hosted-updates/2026-11-05-location-and-nipex.sql`.

### Smaller items left for you

- Two hero images, `public/images/photos/lagos-third-mainland-828.webp` and `-1920.webp`, are no longer used. They can go with the `HEROES` block of `scripts/grade-photos.mjs` and the `heroes` entries of `public/images/photos/manifest.json`.
- The generator scripts read their source folders from the environment, not from a machine path: `scripts/build-figure-data.mjs` uses `--from` or `RESEARCH_DIR` (otherwise the copies in the repo), `scripts/africa-dots.mjs` uses `--source` or `NE_COUNTRIES_GEOJSON`, `scripts/grade-photos.mjs` needs `PHOTO_SRC_AFRICA` and `PHOTO_SRC_FIRST`, and the research comparison in `src/content/data/series.test.ts` runs only when `RESEARCH_DIR` is set (13 tests skip without it).
- The `/insights/[slug]/opengraph-image.tsx` alt text is generic ("Olivia Energy Insights article"). A per-article alt needs `generateImageMetadata`, which changes the image URL.
- After launch, check field LCP (Vercel Speed Insights or CrUX) on `/` and `/contact`.

## 5. Running the site locally

Node 22 is required (`.nvmrc`; `npm run dev` and `npm run build` refuse anything older).

```bash
export PATH=$HOME/.nvm/versions/node/v22.12.0/bin:$PATH   # or: nvm use
npm install
npm run db:start      # local Supabase in Docker, then paste its URL and keys into .env.local
npm run dev           # http://localhost:3000, admin at /admin
```

Without Docker, the harness runs Postgres, PostgREST and a small API proxy on the same ports (54321 for the API, 54322 for Postgres):

```bash
brew install postgresql@18 postgrest      # once
scripts/harness/start.sh                  # starts and seeds; state lives in .harness/ (ignored by git)
npm run dev                               # or: npm run build && npm run start
scripts/harness/start.sh stop
```

`.env.local`'s defaults (`http://127.0.0.1:54321` and the `sb_*` keys it carries) work with both. The harness is for QA: invitations, email, real storage rules and the RLS proof (`npm run db:test`) need `npm run db:start`. To check Resend without sending, set `RESEND_BASE_URL` to a local stub. Turnstile uses Cloudflare's always-pass test keys locally.

Checks, all on Node 22:

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
npx --yes knip@5                          # exit 1 with the 11 known findings
npm run build && npm run start            # then, for Lighthouse: BASE_URL=http://localhost:3000 npm run a11y
npm run shots -- / --widths=390,1440      # screenshots and overflow check (needs Chrome; see scripts/screenshot.mjs)
```

`npm run shots` and `npm run a11y` look for Google Chrome. If it is not installed, set `CHROME_PATH` to any Chromium build, for example the Chrome for Testing that Playwright caches under `~/Library/Caches/ms-playwright/`.
