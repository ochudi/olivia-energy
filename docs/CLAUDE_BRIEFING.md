# Olivia Energy website: state of the codebase (briefing for Claude)

Written 4 November 2026 from a full read of the repository, a clean production build and a
browser pass over every screen. Use it to understand where the project stands and to write
good prompts for the work that remains. Deeper references are linked at the end.

---

## 1. The project in one paragraph

A marketing and publishing website for **Olivia Energy and Power Company Limited**, a Nigerian
strategic energy advisory, research and sustainability consultancy founded by
**Dr Olugbenga Olaoye** (energy economist, BusinessDay op-ed writer). The site presents the
firm (services, values, founder), publishes Insights articles, lists his journal articles and
BusinessDay op-eds, and takes enquiries through a contact form. It has a private admin at
`/admin` where the client edits articles, publications, site settings, the inbox and the team.
The developer (the user) builds it; the client is Dr Olaoye. Domain:
`oliviaenergyandpower.com` (registered at Hostinger, not yet pointed at the site).

## 2. History, and why the site looks the way it does

| Date       | What happened                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sep 2026   | Version 1 built in a calm, restrained "institutional" style (IEA / RMI / McKinsey register). Declared launch-ready on 29 Sep.                                                                                                                                                                                                                                                                                                                               |
| 1 Oct 2026 | First commits pushed to GitHub (`ochudi/olivia-energy`, public). Database moved into a shared Supabase project under the schema `olivia_energy`. Last commit: "Trigger first deployment".                                                                                                                                                                                                                                                                   |
| 2 Oct 2026 | **The client rejected version 1.** His three complaints: (1) "I didn't see impressive and eye catching graphics which are very essential to a great website"; (2) "you didn't really use the guidelines I shared with you earlier" (his PDF "Reimagining Olivia Energy"; he wants it followed, "not really verbatim, but play around with it"); (3) his **BusinessDay op-eds** on energy transition, energy security and the Dangote Refinery were missing. |
| 3 Oct 2026 | The **"Bridging Light" rebuild** was completed in the working tree and answers all three complaints (see section 4). **It has never been committed, pushed or deployed.**                                                                                                                                                                                                                                                                                   |
| 4 Nov 2026 | This audit. Nothing has changed since 3 Oct: the rebuild still sits uncommitted (about 220 changed, added or deleted files).                                                                                                                                                                                                                                                                                                                                |

**What this means:** whatever the client can see online is still version 1, the one he
rejected, or nothing at all. The rebuild is done and working, but he has not seen it.

## 3. Does it work? Yes

Checked on 4 Nov 2026 on Node 22.12 against the local database harness:

| Check                                 | Result                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`                   | pass                                                                                                   |
| `npm run lint`                        | pass                                                                                                   |
| `npm run format:check`                | pass                                                                                                   |
| `npm test` (Vitest)                   | 36 files, 462 tests pass, 13 skipped (they need an external research folder, by design)                |
| `npm run build` (Next 16.3.7)         | success, 41 pages generated, no errors or warnings once the database is running                        |
| Public pages in a browser (1440, 390) | all 10 routes return 200, no JavaScript errors, no sideways scroll; the 404 page returns 404 correctly |
| Admin                                 | sign-in works (Turnstile test key), all 9 admin screens load and render data, no JavaScript errors     |
| Secrets                               | no keys found in files git would see; `.env.local` and `.env.hosted` are git-ignored                   |

Notes:

- If the build runs **without** a database, it still succeeds from cached data but prints
  "Supabase is not reachable" messages. That is expected and harmless.
- Lighthouse results recorded at the rebuild (3 Oct): Performance 93 to 96, Accessibility,
  Best Practices and SEO 100 on all six main routes. Two budget overruns were reviewed and
  accepted: home LCP around 3.0 to 3.7 s simulated (font swap of the 150 px headline) and home
  HTML 347 KB raw (45 KB gzipped). Do not reopen these without real-user field data.
- The live domain does not serve the site: DNS still points at Hostinger's parking server.

## 4. How the rebuild answered the client

| Client complaint           | What the rebuild did                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No eye-catching graphics   | Bold colour surfaces (green, lime, red, night), graded photographs of real African places, a scroll animation on the home page where the photo survives only inside the Olivia logo mark, data figures on every page (line charts, waffle charts, bar gaps, a pinned grid figure, an Africa dot map, a publication timeline), drawn op-ed covers, a WebGL "ignition" of the mark on About |
| His guideline PDF not used | His document is now the content source: his tagline ("Powering the transition. Inspiring sustainable futures."), vision, mission, five values, six services with his names, who we serve, six differentiators, brand story, "We believe" philosophy, four pillars, "Why Olivia?", founder points and the eight Insights formats, all reworded lightly                                     |
| BusinessDay op-eds missing | 11 op-eds (June 2025 to September 2026) and 13 "quoted in BusinessDay" mentions appear on the home hero (latest op-ed card), the home cover wall, the Insights shelf, the Research page, and under every category and article page                                                                                                                                                        |

## 5. Stack and architecture

- **Next.js 16.3 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS v4.** This
  Next version differs from older training data: route guarding is in `src/proxy.ts` (not
  `middleware.ts`), `revalidateTag` takes `{ expire: 0 }`, and `next dev` writes to
  `.next/dev`. Read `node_modules/next/dist/docs/` before writing Next-specific code.
- **Supabase** (Postgres, Auth, Storage) through `@supabase/ssr`. All tables live in the
  schema `olivia_energy`; uploads go to the bucket `olivia-energy-media`. The hosted project
  is **shared with the developer's other clients**, so SQL may only touch `olivia_energy`, and
  project-wide Auth settings must never be changed.
- **Resend** sends contact-form email, invitations and password resets. **Cloudflare
  Turnstile** protects the contact form and admin sign-in.
- **Tiptap** is the article editor in the admin. **Zod** validates forms.
- Motion on the public site is hand-written CSS plus a few small client components; no
  animation library ships to visitors (framer-motion is used only by the `/styleguide` demos).
  Reduced motion and no-JavaScript both render the final state.
- Public pages are statically generated and revalidated hourly, or at once when the admin
  saves (cache tags in `src/lib/supabase/tags.ts`, `POST /api/revalidate`).
- Hosting target: **Vercel** (Hobby or Pro is still undecided; Hobby is non-commercial only).

### Where things are

| Need                                | Location                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Page routes                         | `src/app/(site)/*` (public), `src/app/admin/*`, `src/app/(guide)/styleguide`                                   |
| Page sections                       | `src/components/sections/{home,what-we-do,about,insights,research,contact}`                                    |
| Shared building blocks              | `src/components/blocks` (close band, cover wall, op-ed cover, who we serve, quote panel)                       |
| Data figures                        | `src/components/figures`, `src/lib/figures`                                                                    |
| UI primitives                       | `src/components/ui` (button, chip, glyph, section, display, reveal, shoulder image, ...)                       |
| **All copy**                        | `src/content/*.ts` (home, what-we-do, about, insights, contact, credits, seo, brand, legal)                    |
| Facts and numbers                   | `src/content/data/facts.ts` / `facts.json`; 13 data series in `src/content/data/series/`                       |
| Op-eds and mentions (fallback copy) | `src/content/commentary.ts`, generated from `supabase/seeds/source/commentary.json`                            |
| Photos and credits                  | `public/images/photos`, `src/content/images.ts`, `src/content/credits.ts`                                      |
| Design tokens                       | `src/styles/tokens.css` (single source); surface rules in `src/app/globals.css`                                |
| Database queries                    | `src/lib/supabase/queries.ts`                                                                                  |
| Admin server actions                | `src/lib/admin/actions/*`                                                                                      |
| Migrations and seeds                | `supabase/migrations`, `supabase/seeds`; hosted SQL in `supabase/hosted-setup.sql`, `supabase/hosted-updates/` |

## 6. Rules any prompt for this repo must respect

1. **Never commit.** Claude must not run `git init`, `git add` or `git commit` in this repo.
   The developer commits and pushes by hand; give them the commands instead.
2. **Node 22.** `npm run dev` and `npm run build` refuse older Node. On this machine:
   `export PATH=~/.nvm/versions/node/v22.12.0/bin:$PATH`.
3. **Shared database.** SQL for the hosted project touches only the `olivia_energy` schema.
   Hosted changes are applied by the developer pasting generated SQL into the Supabase SQL
   editor (`npm run db:hosted-sql` builds it). Never edit the generated output by hand.
4. **Credentials.** The repo is public. Never print, copy or commit keys; never open `.env*`
   files in subagent work.
5. **Honesty in copy.** No invented clients, partners, team sizes, years of experience or
   numbers. Every number comes from `facts.ts`, a data series or the publication data, with
   its source shown. The brief's "Never write" list (section 6 of
   `docs/design/2026-10-bridging-light.md`) is binding.
6. **Copy lives in `src/content`**, not in components. British spelling, no em or en dashes.
7. **The client's guideline document is the content source of truth**; bold design is
   wanted, restraint for its own sake is not.
8. **Ports:** 3000 and 3001 belong to other projects on this machine; run this project's
   servers on 3002 or higher.
9. **Local database without Docker:** `scripts/harness/start.sh` (and `... stop`). Seeded
   admin: `admin@oliviaenergyandpower.com` / `olivia-admin-local` (local only).
10. **Screenshots:** Google Chrome is not installed. Use
    `CHROME_PATH=~/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
    for `npm run shots` and `npm run a11y`.

## 7. The UI, screen by screen

Visual language ("Bridging Light"): **green is the stage, lime is the evidence, flame red is the
gap, paper is for reading, night (near-black green) is used one slab at a time.** Headlines are
in Newsreader (a serif) at large sizes, with one italic "turn" per headline in lime; body and
labels are in Instrument Sans. Images and cards use the "shoulder" shape: one large rounded
corner taken from the logo. Small flame glyphs act as bullets. Every page ends with a **red
close band** (a big statement, the ring of the logo drawing itself shut, a "Start a
conversation" button) followed by the **night footer** (tagline, company details, RC 1662525,
Fort Worth and Southwest Nigeria, the NIPEX line, service and company links, photo credits).

The **header** is a slim bar: logo, What we do, About, Insights, Research, and a pill button
"Start a conversation". It recolours itself to match the surface beneath it. On phones it
collapses to a "Menu" button.

### Home `/`

1. **Hero (photo):** graded sunset photograph of Lagos's Third Mainland Bridge; eyebrow
   "Energy advisory · Research · Sustainability"; 150 px headline "Powering the transition."
   with the lime italic line "Inspiring sustainable futures."; positioning paragraph; buttons
   "What we do" and "Read the commentary"; a dark card "Latest in BusinessDay" showing his
   newest op-ed ("Turning Nigerians from consumers into owners", 10 Sep 2026).
2. **"Why Olivia?" scroll scene (green):** on scroll the green floods in, the photograph
   survives only inside the Olivia flame-and-ring mark, and nine lines ("Energy is changing.
   Policies are evolving. ...") light up one by one, landing on "We exist to bridge these
   gaps."
3. **"Driven by evidence." (lime):** four big numbers, each with a GAP or OPENING tag and a
   small graphic: 87 million Nigerians without electricity (dot grid), 32.6% of grid capacity
   available (bar), 2% of clean-energy investment against 20% of population (bars), 7× rise in
   petroleum exports after Dangote (bars). Each shows its source. Below: **Fig. 1**, a dark
   line chart of the share of people with electricity, 2000 to 2024 (World, Nigeria,
   Sub-Saharan Africa), with the 29.4-point gap hatched in red, "View as table" and "Get the
   data (CSV)".
4. **"Six services, one energy future." (paper):** six numbered cards with shoulder-shaped
   photos, an icon, a title, a short description and "Explore".
5. **"For the institutions that shape energy systems.":** four coloured cards (Governments,
   Private sector, Development partners, Academia) listing institution types.
6. **Founder (night):** portrait, "Dr Olugbenga Olaoye", "PhD · MPS · MBA · PMP · CSM", bio,
   counters (9 journal articles, 200+ citations, 11 op-eds), "About our founder".
7. **"On the record, in BusinessDay.":** a wall of drawn op-ed covers (one large lime cover for
   the latest, smaller red, night and paper covers) with topic chips; a pull quote ("Nations
   that fail to refine what they produce will always import the consequences of global
   instability."); a row listing the eight Insights formats being built.
8. **Close band (red):** "We believe" lines and "Sustainability is not a choice. It is a
   responsibility."

### What we do `/what-we-do`

Green hero "Research, strategic advice and practical solutions." beside **Fig. 1**, the solar
module price from 1975 to 2024 (log scale, "99.8% cheaper"). A sticky **chapter bar** (01
Transition to 06 Projects) tracks the six services. Each service is a chapter: shoulder photo,
title, one-line promise taken from his "We believe" lines, description, flame-bullet list of
offerings, and a fact card (for example 277 GW target, 83% gas flaring, 2.2 billion people,
85%+ debt service). Chapter 2 holds a **pinned night scene, Fig. 2: "Installed is not
delivered"**, a grid of squares showing Nigeria's installed 13,625 MW against 4,458 MW
available and 4,113 MWh delivered, which fills as you scroll. Then "Practical advice, informed
by real operations." (the six differentiators, green), "Four pillars." (Research, Advisory,
Innovation, Impact as coloured cards), who we serve in full, and the red close band.

### About `/about`

Night hero "Powering Africa's energy future through knowledge, innovation and sustainable
solutions." with the large logo mark (it ignites from a small WebGL canvas on capable desktops;
phones and reduced motion get the static mark). A sunset street-light photo band carries "Our
story". Then "One of the defining challenges of our time." (who we are), vision (green) and
mission (lime) panels, "What we hold ourselves to." (the five values with glyphs), the founder
section (portrait, ORCID and Google Scholar chips, credential list, a dated credentials
timeline 2000 to 2025, counters 9 / 200+ / 11 / 12), "Real-world operations, since 2020." (the
2020 fuel-retail origin and a registration table: name, RC number, incorporation date,
locations), and the red close band "We exist to bridge these gaps."

### Insights `/insights`

Lime hero "Knowledge drives transformation." beside a figure of people without electricity
since 2000. Second section **"On the record."**: the op-ed cover wall (all eleven, newest
first) and **"Quoted in BusinessDay"**, a two-column dated list of the twelve reports quoting
him (plus a note about one syndicated copy). Then **"Articles"** with category filter chips and
the four starter articles (one large feature, three cards with photos), **"Eight formats, one
standard of evidence."** (eight format cards; two marked as already published, six "first
issue coming"), and the red close band.

- **Article page `/insights/[slug]`:** breadcrumb, category chip, large headline, standfirst,
  byline and reading time, shoulder cover photo, a narrow reading column with headings, lists
  and a long Sources list, tags, share links (LinkedIn, X, email, copy link), an author card,
  "On the record." related op-eds, "More insights", and the close band.
- **Category page `/insights/category/[category]`:** the articles in that category plus his
  related op-eds. Seven categories are generated.
- **RSS** at `/insights/feed.xml`.

### Research `/research` (replaces `/publications`, which redirects with 308)

Paper hero "Independent research that informs decisions." beside a night timeline figure "In
print, 2022 to 2026" (journal articles and op-eds per year), counters 9 and 200+, the pull
quote, **"Journal articles"** (nine cards: journal, year, title, authors, "Read the article"),
**"In BusinessDay"** (dated list of the eleven op-eds with topic chips and outbound links),
"Find the record" (ORCID and Google Scholar), and the red close band.

### Contact `/contact`

Red hero "Start a conversation." with a dotted Africa map ringing Southwest Nigeria as a region, and a note
"And in Fort Worth, Texas, United States". Below: the "Send a message" card (Name, Email,
Organisation optional, Message, Turnstile, "Send message") and a details column (email, the
two addresses, company name and RC number). Messages are stored in the database and emailed
through Resend.

### Other public screens

- **Credits `/credits`:** every photograph with author, licence and source; all 13 data
  series; the map; the typefaces. Five photos are CC BY-SA and must stay credited.
- **Privacy `/privacy`:** privacy notice.
- **404:** branded not-found page.
- **`/styleguide`:** the whole design system on one page (tokens, type, glyphs, figures,
  covers, surfaces). Not linked and blocked in `robots.txt`; keep it as the reference.
- Also generated: sitemap, robots, `llms.txt`, web manifest, favicon, Open Graph and Twitter
  images per page and per article, JSON-LD structured data.

### Admin `/admin` (calm, functional, cream and green; sidebar layout)

- **Sign in**, **Forgot password / Reset**, **Set password** (from invitations), **No access**.
  Access is by invitation only; Turnstile on sign-in.
- **Overview:** counts of published articles, drafts and unread messages; recently edited.
- **Articles:** table with All / Drafts / Published filters; **Editor** with Tiptap toolbar,
  standfirst, cover image upload, category, **Format** (new), tags, SEO title and description,
  Save, Publish / Unpublish, Delete.
- **Publications:** table filtered by kind (All, Journal articles, Op-eds, Mentions) with a
  Featured toggle; **Add / Edit publication** with Kind, Title, Authors, Venue, Year,
  Publication date, Link, Summary, Featured; for op-eds and mentions the form also shows
  Topics, Pull quote and Syndicated copy.
- **Inbox:** contact messages with All / Unread / Read filters.
- **Settings:** tagline, contact email, NIPEX wording, social profile links, addresses, phone
  numbers, and the homepage stats band (switched off).
- **Team:** members and roles; invite an admin by email.

The admin did not change in look during the rebuild; it gained the new publication and format
fields, which fall back safely until the database update below has been applied.

## 8. What is still outstanding

### Developer steps (nothing reaches the client until these are done)

1. Paste `supabase/hosted-updates/2026-10-03-commentary-and-formats.sql` into the hosted
   Supabase SQL editor, run it twice, check `journal 9, op-ed 11, mention 13`.
   (Unknown whether this has been done; ask the developer.)
2. Review the diff, commit and push (the developer does this by hand).
3. Deploy on Vercel; decide Hobby or Pro; set production env vars and Turnstile keys.
4. Point the domain's DNS at Vercel (it is still on Hostinger parking).
5. After deploy: set the Admin tagline to "Powering the transition. Inspiring sustainable
   futures.", purge caches via `/api/revalidate`, check every page on a real phone.
6. Full go-live steps: `docs/LAUNCH_CHECKLIST.md` and `docs/launch/2026-10-rebuild.md` §4.

### Questions waiting on the client (send as one message)

Portrait at 1600 px or more; his own photographs (stations, events, fieldwork) with
permission; sign-off on the tagline; sign-off on "Who we serve" naming institution types only;
talks, panels, webinars or podcasts with dates and links; the year of his Master of Public
Service and confirmation of the credentials timeline; approval of the home op-ed selection,
pull quotes and the "Quoted in BusinessDay" list; which Insights format he will publish first;
his LinkedIn URL and other profiles; permission to tell the 2020 fuel-retail origin; what "MavenCode" on his
LinkedIn refers to; approval of the four starter articles that carry his byline.

### Things that have aged since 3 October

- **Op-ed data is a snapshot to 10 September 2026.** He writes regularly, so there are
  likely newer BusinessDay op-eds and mentions. Update
  `supabase/seeds/source/commentary.json`, run `node scripts/build-commentary.mjs` and
  `npm run db:hosted-sql`, or add them in Admin after launch.
- Facts and series were retrieved on 2 October 2026; they are fine for launch but each
  carries its retrieval date.

### Small cleanups noted in the handover

Two unused hero images (`public/images/photos/lagos-third-mainland-828.webp`, `-1920.webp`);
generic alt text on article social images; 11 known `knip` findings (unused exports and
dependencies, none new).

## 9. Suggested next prompts

In rough priority order:

1. **Ship the rebuild:** "Walk me through committing and deploying the October rebuild: give
   me the exact git commands, the Vercel env vars to set, and the post-deploy checks. Do not
   commit anything yourself."
2. **Refresh his BusinessDay record:** "Find Dr Olugbenga Olaoye's BusinessDay op-eds and
   mentions published after 10 September 2026, verify each URL and date, add them to
   `supabase/seeds/source/commentary.json`, regenerate with `scripts/build-commentary.mjs` and
   `npm run db:hosted-sql`, and run the tests."
3. **Draft the client message:** "Write a short WhatsApp message to Dr Olaoye introducing the
   new site link and listing the 12 questions from `docs/launch/2026-10-rebuild.md` §4.6 in
   plain language."
4. **When the client sends assets:** "Replace the founder portrait and add his own
   photographs: grade them with `scripts/grade-photos.mjs`, update `src/content/images.ts` and
   `src/content/credits.ts`, and check the pages at 390 and 1440."
5. **After client feedback on the rebuild:** paste his feedback verbatim and ask Claude to map
   each point to the affected files in `src/content` and `src/components/sections`, propose
   changes, then implement them while keeping the rules in section 6.

Any prompt that changes the UI should ask Claude to verify with `npm run lint`,
`npm run typecheck`, `npm test`, `npm run build`, and screenshots at 390 and 1440 against a
server on port 3002 or higher.

## 10. Further reading in the repo

- `docs/launch/2026-10-rebuild.md`: rebuild handover, measured results, manual steps.
- `docs/design/2026-10-bridging-light.md`: the creative brief and design system, page by
  page, including the exact copy and the "Never write" list.
- `docs/database/2026-10-03-commentary-and-formats.md`: the pending database update.
- `docs/DEVELOPER_HANDOVER.md`, `docs/LAUNCH_CHECKLIST.md`, `docs/ADMIN_GUIDE.md`, `README.md`.
- Screenshots from this audit (git-ignored): `.screenshots/briefing/` (page contact sheets,
  home at desktop, the home scroll scene at desktop and phone, all admin screens).
