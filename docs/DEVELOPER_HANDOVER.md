# Developer handover

This document is for the engineer who takes over the Olivia Energy website. It
explains how the site is put together, what it depends on, how to run and
deploy it, and how to move the accounts that host it into the client's hands.
The companion [Admin guide](ADMIN_GUIDE.md) is for the people who publish
content.

## 1. The stack in one paragraph

A Next.js 16 (App Router, React 19.3, TypeScript, Tailwind CSS v4) site, built
and hosted on Vercel. Content lives in a Supabase project (Postgres, Auth,
Storage). Public pages are statically rendered and refreshed on demand through
cache tags, so publishing in the admin reaches the site within a second
without a redeploy. The contact form is protected by Cloudflare Turnstile and
delivers mail through Resend. There is no CMS beyond the site's own `/admin`.

## 2. Repository layout

```
src/app/(site)/        public pages (home, what-we-do, about, insights, publications, contact)
src/app/(guide)/       /styleguide: the design-system contract, noindex
src/app/not-found.tsx, (site)/error.tsx, admin/*/error.tsx, global-error.tsx   the error surfaces (copy in src/content/errors.ts)
src/proxy.ts           the /admin route guard (Next.js 16 name for middleware)
src/app/admin/         /admin: (auth) login and password screens, (app) the sidebar shell
src/app/api/revalidate route called by the Supabase webhook to purge caches
src/app/sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, twitter-image.tsx
src/app/icon.svg, apple-icon.png   favicon and iOS icon, generated from the mark
src/lib/brand/mark.ts  the mark's paths, colours and lockup ratios (the one source); <Logo> renders it
src/components/ui/     design-system primitives (Button, Card, Eyebrow, FormField, Reveal …)
src/components/sections/ page sections (home, about, what-we-do, header, footer)
src/components/insights, publications, contact, seo, admin
src/content/           copy per page, written from the sources in section 9; legal.ts is the privacy notice; images.ts is the photo manifest
public/images/         editorial photographs (Unsplash License; CREDITS.md lists the photographers)
src/lib/supabase/      clients, typed queries with cache tags, revalidation helpers, settings schema
src/lib/admin/         auth guards, server actions, image preparation, upload
src/lib/contact/       schema (zod/mini), Turnstile verification, Resend delivery, server action
src/lib/seo/           per-page metadata helper, JSON-LD graph, URL helpers
src/styles/tokens.css  colour, type, spacing, radius, motion tokens (the only place they are defined)
src/assets/fonts/      the self-hosted serif subset and the TTFs used by social images
supabase/migrations/   schema; supabase/seed.sql and supabase/seeds/ for local data
scripts/               screenshots, Lighthouse, RLS proof, font subsetting, create-admin, brand assets and kit
public/brand/          the mark as SVG and PNG, app icons, the client kit; README.md has the rules
docs/                  this file and the admin guide
```

## 3. How the pieces fit

**Public site.** Every page reads through `src/lib/supabase/queries.ts`. Each
read is wrapped in `unstable_cache` with a tag (`posts`, `post:<slug>`,
`publications`, `settings`) and a one-hour fallback, so pages render at build
time and again only when a tag is purged. Purges come from two places: the
admin's server actions call the helpers in `src/lib/supabase/revalidate.ts`
after every write, and a Supabase Database Webhook can call
`POST /api/revalidate` for writes made outside the admin. Reads use the
anonymous key, so Row Level Security (RLS) decides what is visible: published
posts with a past `published_at`, publications and settings.

**Research data.** `/publications` also reads OpenAlex (a public, keyless
scholarly index) for the founder's citation metrics and per-paper citation
counts: `src/lib/research/openalex.ts`, cached for a day through the Data
Cache and failing soft. The author id sits in `src/content/publications.ts`.

**Admin.** `/admin` is protected three times over: `src/proxy.ts`
redirects any request without a session to the login page (all methods, with
a `next` parameter that only ever points back inside `/admin`); every page
and layout calls `requireAdmin()`, which also checks `profiles.role`; and every
server action calls `assertAdmin()`. Writes go through the cookie-bound server
client, so RLS applies to admins as well. The service-role key is used only
for team management (invite, role change, removal), for minting invitation and
password-reset links, and for writing a contact-form message after Turnstile
has verified it (the public API key cannot insert into `contact_messages`).
Access is a row in `profiles`, never the mere existence of an Auth user, so
the Supabase project can be shared with other applications: their users can
sign in and still reach nothing. Removing a member deletes the row and leaves
the Auth account alone for the same reason.

**Editor.** Articles are stored as Tiptap JSON in `posts.body` and rendered on
the server by `src/components/insights/tiptap-content.tsx`, which allow-lists
node types and embeds. Images are resized in the browser to at most 1920px on
the long side before upload to the `olivia-energy-media` bucket. A database trigger
maintains `word_count` and stamps `published_at` on first publish.

**Settings.** One table of `key → jsonb`. `settingsSchema` in
`src/lib/supabase/types.ts` validates every read and fills defaults from the
content files, so adding a key is one line in the schema, one field in the
admin form and one line in the seed. Rows are cached; validation runs on every
read, so a new key gets its default even while the cache still holds old rows.

**Contact.** Server action in `src/lib/contact/actions.ts`: honeypot, zod,
Turnstile verified against Cloudflare with the secret key, insert with the
service role, then Resend with Reply-To set to the sender. A `BEFORE INSERT`
trigger refuses a fourth message from one address within an hour (SQLSTATE
`PT429`, HTTP 429). If the database cannot be reached the message still goes
out by email; the visitor sees an error only when it reached neither.

**Design system.** `src/styles/tokens.css` is the only source of colour, type,
spacing, radius and motion values; `/styleguide` renders them and every
primitive. Components use semantic classes (`bg-surface`, `text-ink`,
`border-line`); dark surfaces set `data-tone="inverse"` and every token remaps.
No animation library ships with the public site.

**SEO.** `pageMetadata()` gives each page a title under 60 characters, a
description, canonical URL and social cards; `src/lib/seo/json-ld.ts` builds
the Organization, WebSite and founder Person graph from settings; articles and
publications add their own nodes. `sitemap.ts` includes every published post,
and `/llms.txt` gives language models the same facts as plain Markdown.

## 4. Environment variables

| Variable                        | Where it comes from                                                                               | Exposed to browser |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API → Project URL                                                   | Yes                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon key or `sb_publishable_…` key                                               | Yes (RLS applies)  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → API → service_role or `sb_secret_…` key                                                | Never              |
| `RESEND_API_KEY`                | Resend → API Keys                                                                                 | Never              |
| `RESEND_FROM_EMAIL`             | A sender on a domain verified in Resend, e.g. `Olivia Energy <no-reply@oliviaenergyandpower.com>` | Never              |
| `TURNSTILE_SITE_KEY`            | Cloudflare → Turnstile → widget → Site key (the page passes it to the widget)                     | Indirectly         |
| `TURNSTILE_SECRET_KEY`          | Cloudflare → Turnstile → widget → Secret key                                                      | Never              |
| `REVALIDATE_SECRET`             | Any long random string (`openssl rand -hex 32`); the bearer token for `POST /api/revalidate`      | Never              |
| `NEXT_PUBLIC_SITE_URL`          | The public origin, no trailing slash. Optional on Vercel, which supplies its production domain    | Yes                |

`.env.example` documents each one and lists Cloudflare's Turnstile test keys.
Locally, `.env.local` points at the local Supabase stack and uses the
"always pass" Turnstile keys.

## 5. Running it locally

Prerequisites: Node 22 (`.nvmrc`; `npm run dev`/`build` refuse anything
older), the Supabase CLI, Docker Desktop for the local Supabase stack.

```
npm install
npm run db:start          # local Supabase; prints the URL and keys for .env.local
npm run db:reset          # migration + seed.sql + seeds/*.sql (settings, local admin, publications, articles)
npm run dev               # http://localhost:3000, admin at /admin
```

The local first admin is `admin@oliviaenergyandpower.com` / `olivia-admin-local`
(created by `supabase/seeds/local-admin.sql`, which never runs on a hosted
project). Other commands:

| Command                                                | What it does                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `npm run test`                                         | Vitest: contact and admin actions, route guard, schema guard, SEO helpers, revalidation |
| `npm run db:test`                                      | RLS proof against the local stack with the anon key, including the rate-limit trigger   |
| `npm run db:types`                                     | Regenerate `src/lib/supabase/database.types.ts` after a migration                       |
| `npm run typecheck`, `lint`, `format:check`            | The usual; all three are clean at handover                                              |
| `npm run build && npm run start`                       | Production build; required before `lighthouse`                                          |
| `npm run lighthouse`                                   | Lighthouse mobile on Home and What We Do (reports in `.screenshots/`)                   |
| `npm run shots -- /route`                              | Screenshots at 390/768/1440 with overflow and console checks                            |
| `node scripts/create-admin.mjs <email> <password>`     | Create or promote an admin on any project (`--set-password` replaces a password)        |
| `npm run db:hosted-sql`                                | Regenerate `supabase/hosted-setup.sql` from the migration and seeds                     |
| `node --env-file=.env.hosted scripts/check-hosted.mjs` | Read-only check of a hosted project after setup                                         |

Notes: everything runs on Node 22 (the Supabase client needs its native
WebSocket). `next dev` writes to `.next/dev`, so a dev run never clobbers a
production build. Next.js 16 also refuses to optimise images from local IPs;
`next.config.ts` allows them outside production so local Supabase covers work.
If Docker is unavailable, `scripts/harness/start.sh` runs Postgres,
PostgREST and an API stand-in with Homebrew packages; enough for QA, not
for the RLS proof or invitations (see `scripts/harness/README.md`).
Resend can be pointed at a local mock by setting `RESEND_BASE_URL`. The Next
data cache in `.next/cache` persists between runs; `POST /api/revalidate`
purges it.

## 6. Database

Everything lives in one Postgres schema, `olivia_energy`, created by the
single migration in `supabase/migrations/`, so the site can share a Supabase
project with other applications. Nothing is created in `public`, there is no
trigger on `auth.users`, and the only objects outside the schema are the
`olivia-energy-media` storage bucket and its four policies. The two names are
constants in `src/lib/supabase/schema.ts`; every Supabase client passes the
schema (a test fails if one does not), and the Data API must list it under
Exposed schemas.

- `profiles`: who may use the admin (`role` admin or editor). Rows are written
  explicitly by the Team page and `scripts/create-admin.mjs`. An Auth user
  without one, such as a user of another application in the same project, has
  no access.
- `posts`, `publications`, `settings`, `contact_messages`, and the `authors`
  view (names of profiles with a published post, for bylines).
- `is_admin()`, the word-count trigger on posts and the 3-per-hour trigger on
  contact messages.

Seeds: `supabase/seed.sql` (settings), then `supabase/seeds/local-admin.sql`
(local stack only), `publications.sql` and `starter-articles.sql`. All load on
`db reset`. For a hosted project, `supabase/hosted-setup.sql` is the migration
plus the content seeds in one transaction; it is generated, so after changing
a migration or seed run `npm run db:hosted-sql` (`-- --check` fails if the
file is stale).

RLS in one line: anon reads published posts, publications, settings and
bylines; admins do everything; anyone else who is signed in gets what anon
gets and nothing more. Contact messages are written only by the server action
with the service role. `scripts/rls-test.mjs` proves each rule on the local
stack, including a signed-in user with no profile.

## 7. Deploying

The step-by-step is `docs/LAUNCH_CHECKLIST.md`; this section gives the
reasoning.

**Supabase (hosted).** The site is built to live in a project that may be
shared with other applications, so the rule is: change nothing project-wide
except the one setting in step 2.

1. SQL Editor: paste `supabase/hosted-setup.sql` and run it. It creates the
   `olivia_energy` schema, the bucket and the seed content in one transaction
   and refuses to run twice. Never run `supabase link`, `supabase db push` or
   `supabase config push` against a shared project: migration history is kept
   per project, not per application, and `config push` would apply this
   repository's local Auth settings (sign-ups off, a localhost Site URL) to
   every application in it.
2. Project Settings → Data API → Exposed schemas: add `olivia_energy` at the
   end of the list, leaving `public` first (the first entry is the default
   for every other application).
3. Create the first admin with
   `node --env-file=.env.hosted scripts/create-admin.mjs <email> '<password>'`,
   then run `node --env-file=.env.hosted scripts/check-hosted.mjs`, which
   reads only, to confirm the public key, the service role, the bucket and
   the admin. `.env.hosted` is a git-ignored file holding the production
   values. If creating the user fails with "Database error saving new user",
   another application's trigger on `auth.users` is rejecting it.
4. Authentication: leave every setting as it is. Invitations and password
   resets do not use Supabase's emails. The site mints a one-time link with
   the service role and mails it through Resend (`src/lib/admin/links.ts`),
   so nothing depends on the project's Site URL, redirect allow-list, email
   templates or SMTP. The link opens `/admin/auth/confirm` and is verified
   only when its button is pressed, so a mail scanner or a link preview that
   fetches the URL cannot spend it. Do not enable CAPTCHA protection: the sign-in form
   verifies Turnstile itself, and a project-wide CAPTCHA would break sign-in
   here and in every other application in the project.
5. Until Resend is configured no email goes out. An invitation then shows its
   link for the admin to pass on, and a forgotten password is replaced with
   `scripts/create-admin.mjs <email> '<new password>' --set-password`.
6. Keys: a publishable key and a secret key. On a shared project the secret
   key can read and write every application's data, so it belongs in Vercel's
   environment variables and nowhere else. Prefer a secret key created for
   this site alone (Project Settings → API Keys), which can be revoked
   without touching the others.
7. Database webhooks are not needed: the admin purges the cache on every
   save. `POST /api/revalidate` exists for edits made outside the admin and
   refuses payloads from any schema but `olivia_energy`.
8. Plan: a free project pauses after a week without requests and keeps no
   backups. While it is paused the public pages keep serving their last
   built copy, the contact form falls back to email, and admin sign-in
   fails. Pro removes pausing and adds daily backups (Storage objects are
   not included; copy the bucket separately).

**Vercel.**

1. Import the GitHub repository. Framework preset Next.js; defaults for build
   and output; Node.js 22 (pinned by `engines`).
2. Add the variables from §4 for Production. Leave `NEXT_PUBLIC_SITE_URL`
   unset: the site then uses Vercel's production domain
   (`VERCEL_PROJECT_PRODUCTION_URL`), which becomes the custom domain once
   one is attached, so canonical URLs, the sitemap and the contact form's
   Turnstile hostname check follow the domain. Set the variable only to force
   a particular origin.
3. Add the custom domain and point DNS at Vercel (the domain is registered at
   Hostinger; change its A and CNAME records there and add `www` as a redirect
   to the apex), then redeploy so the static pages pick up the new origin.
4. Images and the CSP are confined to the project in
   `NEXT_PUBLIC_SUPABASE_URL`, and images to the `olivia-energy-media` bucket
   within it; nothing to add unless a custom storage domain is used, in which
   case edit `next.config.ts`.
5. Set the function region to match the Supabase region.
6. Plan: Hobby costs nothing, but its terms restrict it to non-commercial
   use and a Hobby project cannot be transferred to a team. Pro removes both
   limits.

**Resend.** Verify the sending domain (SPF and DKIM records), create an API
key restricted to sending, set `RESEND_FROM_EMAIL` to an address on that
domain. Contact-form mail goes to the address in Settings → Contact email with
Reply-To set to the sender; invitations and password resets use the same
sender. Verification needs the domain's DNS, so it comes after the domain is
connected.

**Cloudflare Turnstile.** Create a widget in managed mode and add every
hostname the site is served from: the `vercel.app` production hostname and
the custom domain (apex and `www`). Sign-in and the contact form both require
it, and the contact form also checks that the token was solved on the site's
own hostname.

**After the first deploy.** Sign in at `/admin`, set Settings (addresses,
phones, socials, Scholar profile), submit the contact form once and confirm
the message reaches the inbox (and the mailbox once Resend is set up), publish
a test article and confirm it appears without a redeploy, submit the sitemap
in Google Search Console, and run the Rich Results Test on the live URL (its
code-paste mode requires a Google login; the URL mode does not).

## 8. Transferring ownership

**Repository.** The code lives in a GitHub repository under the developer's
account. Transfer it from the repository's Settings → General → Danger Zone →
Transfer ownership to the client's GitHub organisation (GitHub redirects the
old URL), then connect it to Vercel if Git-based deploys are wanted.
`.gitignore` already excludes `node_modules`, `.next`, every `.env*` file
except `.env.example`, `.screenshots` and the local harness state.

**Supabase.** At launch the data lives in a Supabase project the developer
shares with other applications. That project cannot be transferred, and its
secret key reaches every application in it, so neither the key nor a Vercel
project that holds it may be handed over. To give the client the data, create
a project of their own and move into it:

1. Run `supabase/hosted-setup.sql` there and expose the schema (§7).
2. Copy the content:
   `pg_dump --data-only -n olivia_energy --exclude-table-data=olivia_energy.profiles`
   from the shared project, restored after emptying the seeded tables and
   with `posts.author_id` set to null, plus the objects in the
   `olivia-energy-media` bucket. Profiles are left out because they point at
   Auth users, which do not move between projects.
3. Recreate the admins with `scripts/create-admin.mjs`.
4. Replace the three Supabase variables in Vercel, redeploy, then drop the
   schema, the bucket and the four storage policies from the shared project.

**Vercel project.** Only after the Supabase move above. From the project:
Settings → General → Transfer Project, choose the client's team (they need a
Vercel team; a Hobby project cannot be transferred). Environment variables,
domains and deployments move with it. Rotate `REVALIDATE_SECRET` and confirm
the DNS records still point at Vercel afterwards.

**Resend and Cloudflare.** These are account-bound rather than transferable.
Create them under the client's accounts, re-verify the sending domain, create
a new Turnstile widget, and replace the four related variables in Vercel.

**Domain.** Keep the registrar under the client's name; only the DNS records
point at Vercel.

## 9. Facts, sources and what the client should confirm

Every factual line on the site traces to one of these sources (checked
29 September 2026):

- **Company record.** Olivia Energy and Power Company Limited, RC 1662525,
  incorporated 26 February 2020 (Corporate Affairs Commission record as
  republished by an aggregator; confirm against the certificate).
- **Company LinkedIn page.** Self-description as a technology-driven fuel
  retailer; headquarters Otta, Ogun State; founded 2020.
- **Brand Spur, 22 June 2020 and 5 November 2020.** The Sango Ota service
  station (designed for more than 1,000 customers a day) and the Oju Ore,
  Otta outlet; the "every litre dispensed" line.
- **BusinessDay, 6 January 2026 (author biography) and 27 March 2026
  (quote).** The founder's degrees (Ph.D. Economics, Covenant University;
  Master of Public Service, Clinton School of Public Service, University of
  Arkansas; executive MBA, Lagos Business School), USAEE membership, Fort
  Worth, and the oil-price quote.
- **Crossref, OpenAlex (author A5091615039), ORCID (0000-0003-2658-916X)
  and Google Scholar.** The nine papers in `supabase/seeds/publications.sql`
  and the citation count behind "130+".
- **Supplied by the client.** The email address, the three social profile
  URLs, the logo and the portrait.

Removed until the client confirms them, because nothing online does:
"registered in the United States and Nigeria" and "a NIPEX-registered
partner", both from the client's brief. If confirmed, restore them in the
What We Do positioning and third differentiator
(`src/content/what-we-do.ts`) and the About description
(`src/content/seo.ts`); the NIPEX line also has a field in Admin → Settings.
The site otherwise carries only sourced facts (incorporation in 2020, the
founder's name and field, the two cities).

**The client should confirm or supply:**

- The RC number and incorporation date against the certificate.
- The United States entity (name, state, number) and the NIPEX registration
  number, or the removal of those two claims. A confirmed row goes in
  `REGISTRATIONS` (`src/content/about.ts`); the NIPEX wording goes in
  Admin → Settings and appears in the footer.
- The founder's title ("Founder and Chief Executive Officer") and whether
  Fort Worth, Texas may stand as the United States location on the contact
  page (Admin → Settings → addresses).
- Street addresses and phone numbers, if any are to be published (none are).
- Whether to show the figures band on the homepage (Admin → Settings).
  The four figures are true as seeded.
- The positioning copy: services, who we serve, values, vision, mission and
  philosophy were written for the brief, not taken from a source.
- The four Insights articles, published under the founder's byline with a
  Sources section each; unpublish any he does not want to stand behind.

**Other notes**

- The brand mark is the client's legacy mark redrawn as vector geometry
  (`src/lib/brand/mark.ts`, rendered by `<Logo>`; files and rules in
  `public/brand/README.md`).
- Invitation and reset emails go through Resend (`src/lib/admin/links.ts`)
  and have been exercised in unit tests only; send one real invitation once
  the Resend domain is verified.
- Turnstile runs on Cloudflare's always-pass test keys in `.env.local`; the
  hosted site needs the real site and secret keys (the widget shows "For
  testing only" until then).
- The photographs are licensed stock chosen to fit the firm's markets; the
  client may swap in their own (see `public/images/CREDITS.md`).
- Adding an Insights category means adding an enum value in a migration and a
  label in `POST_CATEGORY_LABELS` (the type makes a missing label a compile
  error).
