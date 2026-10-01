# Olivia Energy

Marketing site and admin for Olivia Energy, built on Next.js 16 (App Router),
React 19, TypeScript (strict) and Tailwind CSS v4.

## Stack

| Concern           | Library                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router, Turbopack, React 19.3)                             |
| Styling           | Tailwind CSS v4                                                            |
| Animation         | CSS transitions and keyframes (framer-motion only in the styleguide demos) |
| Icons             | lucide-react                                                               |
| Database / Auth   | Supabase (`@supabase/supabase-js`, `@supabase/ssr`)                        |
| Rich text (admin) | Tiptap (`@tiptap/react`, `@tiptap/starter-kit`)                            |
| Email             | Resend                                                                     |
| Validation        | zod                                                                        |
| Bot protection    | Cloudflare Turnstile                                                       |
| Lint / format     | ESLint 9 (flat config) + Prettier                                          |

## Project structure

```
src/
  app/
    (site)/         Public pages: shell layout, page template, routes
    (guide)/        /styleguide, rendered without the site chrome
    admin/          Back office: (auth) sign-in and link screens, (app) sidebar screens
  components/
    ui/             Reusable primitives (buttons, cards, social icons, skip link, ...)
    sections/       Page-level sections and chrome (site-header, site-footer, ...)
    insights/       Article cards, filters, Tiptap renderer, share links
    admin/          Admin shell, form fields, tables, the article editor
  lib/
    supabase/       Supabase client factories (browser, server, service role)
    seo/            Metadata helpers, JSON-LD, sitemap/robots utilities
    utils/          Generic helpers
  content/          Copy per page (site, home, what-we-do, about, insights, publications, contact, legal, seo, errors); images.ts is the photo manifest
```

## Prerequisites

- Node.js 22 (`.nvmrc` and `engines` pin 22.x; run `nvm use`). `npm run dev` and
  `npm run build` refuse older versions (`scripts/check-node.mjs`): the
  `@supabase/supabase-js` client warns on 20 and its scripts need the native
  WebSocket that arrived in 22.
- npm 10 or newer
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account with a verified sending domain
- A [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) widget

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local env file from the example and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The site is served at http://localhost:3000.

## Environment variables

All variables are listed in `.env.example`. Never commit real values.

| Variable                        | Where to find it                                               | Exposed to browser |
| ------------------------------- | -------------------------------------------------------------- | ------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API → Project URL                | Yes                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key            | Yes (RLS applies)  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Project Settings → API → service_role key           | No (server only)   |
| `RESEND_API_KEY`                | Resend → API Keys                                              | No                 |
| `RESEND_FROM_EMAIL`             | Sender for contact-form mail, on a domain verified in Resend   | No                 |
| `TURNSTILE_SITE_KEY`            | Cloudflare → Turnstile → widget → Site key                     | No                 |
| `TURNSTILE_SECRET_KEY`          | Cloudflare → Turnstile → widget → Secret key                   | No                 |
| `REVALIDATE_SECRET`             | Any long random string; bearer for `POST /api/revalidate`      | No (server only)   |
| `NEXT_PUBLIC_SITE_URL`          | Canonical public origin, no trailing slash; optional on Vercel | Yes                |

`SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Only use it in
server-side code (route handlers, server actions) and never ship it to the
client.

## Scripts

| Command                 | What it does                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`           | Start the dev server (Turbopack; writes to `.next/dev`, so it never clobbers a build)   |
| `npm run build`         | Production build                                                                        |
| `npm run start`         | Serve the production build                                                              |
| `npm run lint`          | Run ESLint                                                                              |
| `npm run lint:fix`      | Run ESLint and auto-fix                                                                 |
| `npm run format`        | Format the codebase with Prettier                                                       |
| `npm run format:check`  | Verify formatting without writing                                                       |
| `npm run typecheck`     | Type-check with `tsc --noEmit`                                                          |
| `npm run shots`         | Screenshot a route at 390/768/1440 (see Visual QA)                                      |
| `npm run a11y`          | Lighthouse accessibility audit, mobile and desktop                                      |
| `npm run lighthouse`    | Lighthouse mobile, all four categories, on Home and What We Do                          |
| `npm run db:start`      | Start the local Supabase stack (Docker) and apply migrations                            |
| `npm run db:reset`      | Recreate the local database: the migration, then `seed.sql` and `seeds/*.sql`           |
| `npm run test`          | Vitest: contact and admin actions, route guard, schema guard, SEO helpers, revalidation |
| `npm run db:types`      | Regenerate `src/lib/supabase/database.types.ts` from the local stack                    |
| `npm run db:test`       | RLS proof against the local stack (`scripts/rls-test.mjs`)                              |
| `npm run db:hosted-sql` | Regenerate `supabase/hosted-setup.sql`, the one file a hosted project is set up from    |
| `npm run db:stop`       | Stop the local stack                                                                    |
| `npm run admin:create`  | Create or promote an admin user on the local stack                                      |

Before opening a PR or deploying, run:

```bash
npm run lint && npm run typecheck && npm run build
```

## Design system

`/styleguide` is the contract for the build: every token, typeface and
component the site may use, with usage notes. Its sources:

- `src/styles/tokens.css` — the single token file (colour, type, spacing,
  radii, shadows, motion). Tailwind reads it as `@theme`; the styleguide
  parses it directly, so the page cannot drift from what ships.
- `src/app/fonts.ts` — typeface pair and the decision record.
- `src/components/ui/` — Button, Container, SectionHeading, Eyebrow, Card,
  Stat, Tag, Divider, AnimatedNumber, Reveal, Prose.

### Visual QA

With a server running (`npm run dev`, or `npm run build && npm run start`):

```bash
npm run shots                                  # /styleguide at 390, 768, 1440
npm run shots -- / --widths=390,1440           # another route, custom widths
npm run shots -- /styleguide --reduced-motion  # emulate prefers-reduced-motion
BASE_URL=http://localhost:3001 npm run shots   # non-default port
```

Screenshots land in `.screenshots/` (git-ignored). The script drives the
locally installed Google Chrome through `playwright-core`, so there is no
browser download, and it reports console errors, horizontal overflow and
loaded fonts for each width.

## Site shell

Public pages live under `src/app/(site)/` and share one layout: skip link,
fixed header, `<main id="content">`, footer. `/styleguide` sits in the
`(guide)` group and renders without the chrome.

- **Header** (`src/components/sections/site-header.tsx`). Fixed and solid
  canvas by default (no blur). When a page's first section carries `data-hero="light"` or
  `data-hero="dark"`, the header is transparent until the page scrolls; over
  a dark hero it switches to light text. The switch is CSS (`globals.css`);
  JavaScript only reports scroll position. A hero should also pull itself
  under the header with `-mt-header pt-header`.
- **Mobile menu**. Full-screen dialog below `lg` with a staggered reveal.
  Focus is trapped, the rest of the page is `inert`, Escape closes and
  returns focus to the toggle. It closes on navigation.
- **Inverse tone**. Add `data-tone="inverse"` to any dark surface and every
  semantic colour token remaps inside it, so components need no dark
  variants. The footer, the menu and the home hero use it.
- **Page transition** (`src/app/(site)/template.tsx`). A 200ms fade and 8px
  lift on every navigation, opacity and transform only (no layout shift),
  collapsed under `prefers-reduced-motion`.
- **Content** (`src/content/site.ts`). Navigation, services, the contact
  email, social profiles and the legal line. The email and profiles are
  defaults; Admin → Settings overrides them.
- **Privacy notice** (`src/app/(site)/privacy/page.tsx`, copy in
  `src/content/legal.ts`). Linked from the footer and the contact form; it
  describes what the form collects and which providers process it, so keep
  it in step with the code if that changes.
- **Error pages**. `src/app/not-found.tsx` renders the full shell for any
  unknown URL (with a "where to next" index); `(site)/insights/[slug]/not-found.tsx`
  is the article variant with the latest posts; `(site)/error.tsx`,
  `admin/(app)/error.tsx` and `admin/(auth)/error.tsx` are the route error
  boundaries with a retry button and the error digest; `global-error.tsx`
  covers a failure of the root layout itself; `admin/(app)/loading.tsx` is the
  admin skeleton. Copy lives in `src/content/errors.ts`. When the database is
  unreachable the thrown error explains how to start the local stack.
- **Photography** (`src/content/images.ts`, `public/images/`). Editorial
  photographs used on Home, About, What We Do and as the starter-article
  covers, each with intrinsic size, alt text, caption, credit and a blur
  placeholder. All are Unsplash License (free for commercial use);
  `public/images/CREDITS.md` lists the photographers. Replace one by dropping
  a file of the same name into the folder and updating the manifest.

### Home page

`src/app/(site)/page.tsx` composes five sections from
`src/components/sections/home/`: the hero, the numbered services index,
Heritage (opened by a photograph and a timeline), Latest Insights and the
closing call to action.

The hero fills the first viewport with one statement over **Currents**
(`hero-currents.tsx`): a canvas of thin streamlines drifting slowly along
one coherent vector field in the mark's greens, the way a wind map moves.
A mouse pointer parts the field gently; the field thins to a quarter behind
the text block, which carries `data-currents-avoid`. Each streamline is
redrawn from a short buffer of positions after a full clear every frame, so
nothing accumulates. It has no dependency, costs about 1 ms a frame, runs
only while the hero is on screen and the tab is visible, caps the pixel
ratio at 1.5 and the frame rate at 60, and draws a single still frame under
`prefers-reduced-motion`, Data Saver or on a two-core device. The canvas is
`aria-hidden` and absolutely positioned, so the h1 stays the LCP element and
nothing shifts. A sixth, the
figures band, renders only when "Show the figures on the homepage" is ticked
in Admin → Settings. All copy lives in `src/content/home.ts` (services in
`src/content/site.ts`). The heritage dates and the figures come from the
company record and the founder's publication history; the sources are listed
in `docs/DEVELOPER_HANDOVER.md`, section 9.

### What we do and About

`src/app/(site)/what-we-do/page.tsx` composes `src/components/sections/what-we-do/`:
the positioning statement, six anchored service-line sections (each `id` is
the service slug from `src/content/site.ts`, so the home grid and the footer
link straight to them), a "Who we serve" grid and a "What makes us different"
list. On `lg` and up the in-page nav (`service-nav.tsx`) is sticky under the
header and follows the section whose top has passed it; below `lg` it is a
two-column list at the top of the section. Copy lives in
`src/content/what-we-do.ts`.

`src/app/(site)/about/page.tsx` composes `src/components/sections/about/`:
story, vision and mission, five values, the philosophy block (the one place
the serif italic is used, so that face loads only here), the founder section
and registrations. Copy lives in `src/content/about.ts`. The founder portrait
is `public/founder/dr-olugbenga-olaoye.png`, cropped to 4:5 by the section;
replace the file to change it. Registrations renders the rows in
`REGISTRATIONS` (currently the Nigerian company, RC 1662525); add a row there
when a United States entity or NIPEX number is available.

The positioning copy (services, who we serve, values, vision, mission,
philosophy) was written for the brief; the factual lines (dates, outlets,
the founder's degrees, memberships and papers) come from the sources listed
in `docs/DEVELOPER_HANDOVER.md`, section 9. Edit the content files directly;
nothing on these pages is read from the database except the settings noted
above.

### Insights

`/insights` and `/insights/[slug]` read from the cached data layer, so both
are served from the Data Cache and refreshed by tag.

- **Index** (`src/app/(site)/insights/page.tsx`): the latest article set
  large, then the grid. The category filter is a set of static routes,
  `/insights/category/[category]` (one per `post_category` value, each with
  its own title and canonical URL), rendered from the same cached list by
  `src/components/insights/insights-archive.tsx`, so every Insights page is
  static and refreshed by the `posts` tag; there is no client-side fetch. Cards show
  category, serif title, excerpt, date and reading time (from `word_count`,
  which a trigger maintains from the Tiptap body).
- **Article**: category eyebrow, display title, standfirst, byline row
  (author from the `authors` view), share links, cover, the Tiptap JSON body
  rendered on the server by `src/components/insights/tiptap-content.tsx`
  (headings, marks, lists, pull quotes, images, YouTube and allow-listed
  iframes, tables), tags, "More from Olivia Insights", and a schema.org
  Article JSON-LD block. Published slugs are pre-rendered; new ones render on
  demand; drafts and future-dated posts 404.
- **Social image**: `opengraph-image.tsx` renders a 1200×630 card with
  `next/og` (the `@vercel/og` engine) using the vendored TTFs in
  `src/assets/fonts/`, and the one-colour mark from `src/lib/brand/mark.ts`
  beside the wordmark. Keep those paths as string literals.
- **Brand**: the mark is the client's legacy mark redrawn as vector geometry
  in `src/lib/brand/mark.ts`; `<Logo>` (`src/components/ui/logo.tsx`) renders
  it inline. `node scripts/brand-assets.mjs` regenerates the SVG and PNG
  files, app icons and favicon from that file; rules and the file list are in
  `public/brand/README.md` and in the Brand section of `/styleguide`.
- **Revalidation**: `POST /api/revalidate` with
  `Authorization: Bearer $REVALIDATE_SECRET` purges the right tags. Point a
  Supabase Database Webhook (insert, update, delete on `posts`,
  `publications`, `settings`) at it so publishing reaches the site at once;
  the same endpoint accepts `{ "table": "posts", "slug": "…" }` by hand.
  Without a purge, pages refresh within an hour.
- **Home** "Latest insights" reads the three newest posts through the same
  layer and hides itself while there are none.

Inline images and covers come from the `olivia-energy-media` bucket;
`next.config.ts` allows that bucket on the configured Supabase host (and
localhost outside production) as an image source. Add your own domain there
if the bucket sits behind a custom hostname.

### Fonts and performance

Only the roman weights of Newsreader and Instrument Sans are preloaded. Each
italic is a separate `next/font` family with `preload: false`, exposed as
`--font-display-italic` / `--font-sans-italic` (utilities
`font-display-italic`, `font-sans-italic`), so the ~160 KB of italics load
only on pages that set them (prose emphasis, pull quotes). Use those tokens
together with `italic`; never rely on a synthesised slant.

The page transition runs on client-side navigations only, so the first paint
is never faded in and Largest Contentful Paint is measured on the real hero.

### Lighthouse audits

With a server running:

```bash
npm run a11y                    # accessibility, / at mobile and desktop
npm run a11y -- / /about        # more routes
npm run a11y -- / --categories=performance,accessibility
```

The script drives the local Google Chrome through Lighthouse, prints each
category score (plus FCP, LCP, CLS and TBT when performance is audited) with
any failing audits, writes the JSON reports to `.screenshots/`, and exits
non-zero if a score is below 95. Mobile runs use Lighthouse's simulated
slow 4G; desktop runs use its dense 4G preset.

## Tests and QA

`npm run test` runs Vitest (Node 22): the contact server action (validation,
Turnstile rejection, the PT429 rate limit, honeypot, mail failure), the admin
route guard (proxy redirects for every method, public paths, the
post-login redirect allow-list, `assertAdmin` and `requireAdmin`), and the
revalidation helpers and `POST /api/revalidate`. `npm run db:test` proves the
RLS policies and the rate-limit trigger against the real local stack.

For visual QA, `npm run shots -- /route` captures a route at 390, 768 and
1440 and reports overflow and console errors; `npm run lighthouse` audits the
production build. `docs/` holds the [Admin guide](docs/ADMIN_GUIDE.md) and
the [Developer handover](docs/DEVELOPER_HANDOVER.md).

## SEO and performance

### Security headers

`next.config.ts` sends the same header set on every route: HSTS for two years
with subdomains (no `preload`, a one-way door the client should choose
knowingly), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy`
that turns off camera, microphone, geolocation, payment and USB,
`Cross-Origin-Opener-Policy: same-origin`, and no `X-Powered-By`. Production
builds also send a Content-Security-Policy that confines scripts to the site
and Cloudflare Turnstile, connections and images to the site and the Supabase
project named in `NEXT_PUBLIC_SUPABASE_URL`, and frames to Turnstile and the
article embed hosts in `src/lib/insights/embed-hosts.json` (the Tiptap
renderer reads the same file, so the two lists cannot drift). Inline scripts
stay allowed because Next.js hydrates with them and a per-request nonce would
force every page to render dynamically. Vercel preview deployments skip the
CSP so the preview toolbar works.

**Metadata.** Every public page exports `generateMetadata = pageMetadata(...)`
(`src/lib/seo/metadata.ts`) with its entry in `src/content/seo.ts`: a title under 60 characters that leads
with the target terms (energy advisory, energy economics, energy transition,
United States and Nigeria), a description under 160, the canonical URL, and
Open Graph and Twitter card copy. The root layout supplies `metadataBase`,
the site name, the default social image (`src/app/opengraph-image.tsx`, with a
`twitter-image` alias) and `robots: index, follow`. Article titles keep the
site suffix only while the whole line stays under 60 characters. The style
guide and the admin are `noindex`.

**Structured data.** `src/lib/seo/json-ld.ts` builds one `@graph` for every
public page from settings: `Organization` (both addresses, contact email,
`sameAs` for any social URL that is a real profile), `WebSite`, and the
founder as `Person` with `hasCredential` for each credential and the Google
Scholar profile as `sameAs`. Articles add an `Article` that points at those
nodes by `@id`; Publications adds a `CollectionPage` plus one
`ScholarlyArticle` per paper. Types come from `schema-dts`, so a wrong
property is a compile error.

**Sitemap and robots.** `src/app/sitemap.ts` lists the static pages and
every published article (refreshed with the `posts` tag);
`src/app/robots.ts` allows everything except `/admin`, `/api/` and
`/styleguide` and points at the sitemap.

**Answer engines.** `/llms.txt` (`src/app/llms.txt/route.ts`, built by
`src/lib/seo/llms.ts`) is a plain Markdown summary for language models and
the search products built on them: who the firm is, its services, and a link
to every page, article and paper. It is generated from the content files and
the database and refreshes with the same cache tags as the pages. `robots.txt`
allows every crawler, AI crawlers included, since being quoted is the point.

**Typography in content.** Editors type straight quotation marks; the read
layer and the article renderer set them as typographic ones (`typeset()` in
`src/lib/insights/text.ts`), leaving code untouched.

**Performance budget.** Lighthouse mobile targets are 95+ performance and
100 for accessibility, best practices and SEO on Home, What We Do and an
article. `npm run build && npm run start`, then `npm run lighthouse`
(JSON and HTML reports in `.screenshots/`). What keeps the pages inside it:

- The display serif is a self-hosted subset of Newsreader (weights 400–500,
  optical sizes 20–72, still variable): 65 KB instead of 132 KB, preloaded.
  Regenerate with `scripts/font-subset.py` (see `src/assets/fonts/README.md`).
- No animation library ships with the public site: reveals use
  IntersectionObserver, the counter a requestAnimationFrame tween, the
  mobile menu CSS keyframes (`src/lib/utils/use-motion.ts`, `motion.ts`,
  `globals.css`). framer-motion remains for the style guide's demos only.
- The contact form validates with `zod/mini` in the browser, so the schema
  costs kilobytes rather than the whole library (which was also being
  prefetched from every page that links to Contact).
- Priority images (article covers) are preloaded and carry
  `fetchpriority="high"`; every image sets `sizes`; below-the-fold images
  lazy-load through `next/image` defaults.
- `browserslist` in `package.json` targets current browsers, so no legacy
  transforms are emitted.

## Contact form

`/contact` is a split page: on the left the invitation, one block per office
address, the contact email, phone numbers (when set) and the social links,
all from settings; on the right the form. Submissions go through a Server
Action (`src/lib/contact/actions.ts`) in this order:

1. **Honeypot.** A hidden `website` field; a filled one gets a fake success
   and nothing is stored.
2. **zod** (`src/lib/contact/schema.ts`), shared with the client so the
   inline messages before submit match the server's.
3. **Cloudflare Turnstile, verified server-side** against `siteverify` with
   the secret key. The widget is rendered explicitly and reset after every
   rejection, because a token verifies once. If the widget cannot load (a
   content blocker), the form says so and offers the email address.
4. **Insert into `contact_messages`** with the service role (the public key
   has no privilege on the table). A `BEFORE INSERT` trigger rejects a fourth
   message from the same address within an hour with SQLSTATE `PT429`, which
   PostgREST turns into HTTP 429; the form shows a rate-limit state.
5. **Email through Resend** to `settings.contact_email` with `Reply-To` set
   to the sender, so replying from any mail client answers them. The message
   has to reach the inbox or the mailbox: a failure of one is logged, a
   failure of both is shown.

**Env.** `TURNSTILE_SITE_KEY` (handed to the widget by the page, no
`NEXT_PUBLIC_` prefix needed), `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` and
`RESEND_FROM_EMAIL` (a sender on a domain verified in Resend). Cloudflare's
test keys, listed in `.env.example`, exercise the pass, block and
token-spent paths without a real site; `.env.local` ships with the
"always pass" pair.

## Publications

`/publications` renders entirely from the database: nothing on the page is
hardcoded except the furniture in `src/content/publications.ts`.

- **Featured papers** (`featured = true`) appear as cards at the top with
  venue, year, authors, summary and an outbound link. **All papers** follow,
  grouped by year (newest first, undated last), in the admin's sort order.
- **Outbound links** open in a new tab with `rel="noopener noreferrer"`. The
  label reads "Read on Google Scholar" for Scholar URLs and "Read the paper"
  for anything else (DOI, publisher).
- **Research profile**: a panel beside the heading with the number of listed
  papers and the founder's citation count, h-index and i10-index, plus the
  Google Scholar link. Google Scholar has no API, so the figures come from
  OpenAlex (`src/lib/research/openalex.ts`, author id in
  `src/content/publications.ts`), fetched on the server and cached for a day;
  each paper with a DOI also shows "Cited N times" from the same source. If
  OpenAlex is unreachable the page renders without the numbers.
- **Scholar profile**: the founder's Google Scholar URL lives in settings
  (`scholar_url`, editable under Admin → Settings); leave it empty to hide
  the link.
- **JSON-LD**: a `CollectionPage` about the founder (`Person`, with the
  Scholar profile as `sameAs`) plus one `ScholarlyArticle` per paper.
- **Caching**: reads go through the `publications` and `settings` tags, so an
  admin save or the revalidate webhook refreshes the page at once.

## Admin (`/admin`)

A small, dense back office on the same tokens as the site: sidebar
navigation, tables, and one editor. Every route under `/admin` is guarded
by `src/proxy.ts`: no session redirects to `/admin/login?next=…`, and
the `(app)` layout plus every server action then require
`profiles.role = 'admin'` (`src/lib/admin/auth.ts`). The site has no sign-up
of its own, and it does not rely on sign-up being closed in Supabase: access
is a `profiles` row, so an Auth user without one (including a user of another
application sharing the project) signs in to a "no access" page.

| Screen       | What it does                                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview     | Counts of published, drafts and unread messages; recently edited                                                                                                                          |
| Articles     | List with status filter; **New article** creates a draft and opens the editor                                                                                                             |
| Editor       | Title and slug, standfirst, Tiptap body (headings, bold, italic, pull quote, lists, links, images, divider), cover, category, tags, SEO fields; Save draft / Publish / Unpublish / Delete |
| Publications | Table with drag (or arrow) reordering, featured toggle, add and edit forms; saving purges the public page                                                                                 |
| Settings     | Tagline, contact email, NIPEX wording, social links, the founder's Google Scholar profile, addresses, phones, homepage stats                                                              |
| Inbox        | Contact-form messages, unread first; expand, reply via your mail client, mark read, delete                                                                                                |
| Team         | Members and roles; invite an admin by email (service role)                                                                                                                                |

**Publishing** saves the article, sets `published_at` on first publish, and
calls the revalidation helpers, so the article, the Insights index and the
home page update within a second; no redeploy. Unpublishing removes the
page (404) the same way.

**Images** are resized in the browser to at most 1920px on the long side
(WebP, or PNG when the source is PNG) before upload to the
`olivia-energy-media` bucket;
inline images keep their measured width and height so the site can reserve
space. Covers are stored as bucket paths.

**First admin.** `supabase/seeds/local-admin.sql` creates
`admin@oliviaenergyandpower.com` with password `olivia-admin-local` on the
local stack only. On the hosted project run
`node --env-file=.env.hosted scripts/create-admin.mjs <email> <password>`
once, then invite others from Team.

**Invitations and password resets** are the site's own: it mints a one-time
link with the service role and mails it through Resend
(`src/lib/admin/links.ts`), and the link opens `/admin/auth/confirm`, whose
button verifies it and continues to the set-password screen (a page load
alone spends nothing, so a mail scanner or a link preview cannot use it up). Supabase's built-in emails, templates, Site URL
and redirect list are not involved. Without Resend configured, an invitation
shows its link for the admin to pass on, and a forgotten password is replaced
with `scripts/create-admin.mjs <email> <password> --set-password`. Inviting an
address that already has an account grants it access and leaves its password
alone; removing a member revokes access and leaves the account in place.

**Env.** The admin needs the same Supabase variables as the site plus
`SUPABASE_SERVICE_ROLE_KEY` (team management, the links above and the contact
form) and the Resend pair.

## Database (Supabase)

Everything lives in its own Postgres schema, `olivia_energy`, created by the
one migration in `supabase/migrations/`, so the site can share a Supabase
project with other applications: nothing is created in `public` and nothing
hangs off `auth.users`. The schema must be listed under the project's exposed
schemas (locally `supabase/config.toml` does it). `supabase/seed.sql` adds the
settings defaults and `supabase/seeds/` the local admin, the publications and
the four starter articles.

| Table              | Purpose                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `profiles`         | Who may use the admin; `role` is `admin` or `editor` (checked)                                         |
| `posts`            | Insights articles: Tiptap JSON `body`, `category` enum, `tags`, status                                 |
| `publications`     | Title, authors, venue, year, URL (Scholar or DOI), summary, featured, sort                             |
| `settings`         | `key` → `jsonb`: tagline, contact_email, socials, addresses, phones, nipex_wording, stats, scholar_url |
| `contact_messages` | Contact-form submissions with `read` flag and optional bot score                                       |
| storage bucket     | `olivia-energy-media`: public read by URL for covers and documents; admins write                       |

**Access.** RLS is on for every table. `anon` can select published posts
(`status = published` and `published_at <= now()`), publications, settings
and bylines. Signed-in users with `profiles.role = 'admin'` can do everything;
the `is_admin()` function backs those policies. Any other signed-in user gets
what `anon` gets. `contact_messages` is written only by the contact form's
server action, with the service role. Table privileges are also narrowed, so a
forbidden operation as `anon` (for example reading `contact_messages`) fails
with `42501` rather than returning an empty set. The service-role key bypasses
RLS and is used only server-side (`src/lib/supabase/service.ts`, which is
`server-only`).

**Admin users** are Supabase Auth users with a `profiles` row. Nothing
creates that row automatically; the Team page's invite writes it, and so does:

```bash
npm run admin:create -- admin@example.com 'a strong password'   # local
node --env-file=.env.hosted scripts/create-admin.mjs admin@example.com 'a strong password'  # hosted
```

**Local stack.** Requires Docker and the Supabase CLI.

```bash
npm run db:start      # first run pulls images; prints the local URL and keys
npm run db:reset      # apply migrations + seed from scratch
npm run db:types      # regenerate the TypeScript types after a migration
npm run db:test       # RLS proof with the anon key (see below)
npm run db:stop
```

Put the printed `API URL` and keys into `.env.local` as
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY`.

**Hosted project.** Paste `supabase/hosted-setup.sql` into the Supabase SQL
Editor and run it, then add `olivia_energy` to Project Settings → Data API →
Exposed schemas. The file is the migration plus the content seeds in one
transaction; it touches nothing outside the schema and the site's own bucket,
and refuses to run twice. It is generated: after changing a migration or seed,
run `npm run db:hosted-sql`. `supabase db push` is not used, because the
project may be shared and migration history is per project. Check the result
with `node --env-file=.env.hosted scripts/check-hosted.mjs` (read-only).

**RLS proof.** `scripts/rls-test.mjs` creates fixtures with the service-role
key (a published, a draft and a future-dated post, a contact message, and
three users: an admin, an editor and one with no profile at all), then checks
with the anon key that only the published post is visible, that reading and
writing `contact_messages` both fail, and that every write is refused; then
repeats the checks as the user with no profile (what another application's
user looks like), the editor (no rights) and the admin (full rights, including
a storage upload that is publicly readable). It cleans up after itself and
exits non-zero on any failure.

**Data layer** (`src/lib/supabase/`):

- `queries.ts` — the public read layer. Every function is wrapped in
  `unstable_cache` with tags `posts`, `post:[slug]`, `publications` and
  `settings` (and a one-hour fallback), so pages that call them render
  statically and refresh on demand: `getPublishedPosts`, `getPostBySlug`,
  `getPublishedPostSlugs`, `getPublications`, `getSettings`, `getMediaUrl`.
- `revalidate.ts` — `revalidatePosts(slug?)`, `revalidatePost(slug)`,
  `revalidatePublications()`, `revalidateSettings()`,
  `revalidateAllContent()`. Call from a Server Action or Route Handler after
  a write.
- `types.ts` — row types (`Post`, `Publication`, ...), `POST_CATEGORY_LABELS`
  (must name every enum value, enforced by the type), and `settingsSchema`, a
  zod schema that validates `settings` rows and fills defaults from
  `src/content`.
- `client.ts`, `server.ts`, `public.ts`, `service.ts` — browser,
  cookie-bound server, anonymous and service-role clients. Public pages use
  `queries.ts` (anonymous client, cacheable); admin pages will use
  `server.ts`.
- `database.types.ts` — generated; do not edit by hand.

The seven `post_category` values were chosen for the brief. Rename one in a
new migration with
`alter type olivia_energy.post_category rename value 'old' to 'new'` and update
`POST_CATEGORY_LABELS`.

## Deploying

### Vercel (recommended)

Vercel is the zero-config target for Next.js. This project is deployed from
the local working directory using the Vercel CLI, so no git remote is
required.

1. Install the CLI and log in:

   ```bash
   npm i -g vercel
   vercel login
   ```

2. Link the directory to a Vercel project (first time only):

   ```bash
   vercel link
   ```

3. Add every variable from `.env.example` to the project. Either use the
   dashboard (Project → Settings → Environment Variables) or the CLI:

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   # repeat for each variable
   ```

   Leave `NEXT_PUBLIC_SITE_URL` unset: on Vercel the site follows the
   project's production domain. Keep `SUPABASE_SERVICE_ROLE_KEY` to the
   Production environment.

4. Deploy:

   ```bash
   vercel          # preview deployment
   vercel --prod   # production deployment
   ```

5. Add your custom domain under Project → Settings → Domains and point DNS at
   Vercel as instructed.

If you prefer Git-based deploys, connect the repository under Project →
Settings → Git and Vercel will build on every push. The framework preset,
build command (`next build`) and output directory are detected automatically.

### Self-hosted (Node.js)

Any host that runs Node 22+ can serve the app.

1. On the server, install dependencies and build:

   ```bash
   npm ci
   npm run build
   ```

2. Provide the environment variables (systemd unit, `.env.production`,
   container env, etc.).

3. Start the server:

   ```bash
   npm run start -- --port 3000
   ```

4. Put a reverse proxy (nginx, Caddy) in front of it for TLS and caching.

For container deploys, set `output: "standalone"` in `next.config.ts` and copy
`.next/standalone` plus `.next/static` and `public` into the image, then run
`node server.js`.

### Launch checklist

`docs/LAUNCH_CHECKLIST.md` records what was verified in the final build and
the steps only the account owners can take: the database setup in Supabase,
Turnstile and Resend keys, the Vercel project and its variables, DNS at the
registrar, and the first checks on the live URL. The
essentials, if you read nothing else:

- Run `supabase/hosted-setup.sql` in the Supabase SQL Editor and expose the
  `olivia_energy` schema. Change nothing under Authentication.
- Add every hostname the site is served from to the Turnstile widget.
- Verify the Resend sending domain and that `RESEND_API_KEY` belongs to it.
- On Vercel leave `NEXT_PUBLIC_SITE_URL` unset and the site follows the
  project's production domain; elsewhere set it to the served origin, since a
  production build without either fails on purpose rather than baking
  localhost into canonical URLs.
