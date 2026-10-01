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
client, so RLS applies to admins as well. The service-role key is used in
four places only: inviting a team member, changing a role, removing a member,
and writing a contact-form message after Turnstile has verified it (the
public API key cannot insert into `contact_messages`).

**Editor.** Articles are stored as Tiptap JSON in `posts.body` and rendered on
the server by `src/components/insights/tiptap-content.tsx`, which allow-lists
node types and embeds. Images are resized in the browser to at most 1920px on
the long side before upload to the `media` bucket. A database trigger
maintains `word_count` and stamps `published_at` on first publish.

**Settings.** One table of `key → jsonb`. `settingsSchema` in
`src/lib/supabase/types.ts` validates every read and fills defaults from the
content files, so adding a key is one line in the schema, one field in the
admin form and one line in the seed. Rows are cached; validation runs on every
read, so a new key gets its default even while the cache still holds old rows.

**Contact.** Server action in `src/lib/contact/actions.ts`: honeypot, zod,
Turnstile verified against Cloudflare with the secret key, insert as the
anonymous role, then Resend with Reply-To set to the sender. A `BEFORE INSERT`
trigger refuses a fourth message from one address within an hour (SQLSTATE
`PT429`, HTTP 429), so the limit also covers direct API calls.

**Design system.** `src/styles/tokens.css` is the only source of colour, type,
spacing, radius and motion values; `/styleguide` renders them and every
primitive. Components use semantic classes (`bg-surface`, `text-ink`,
`border-line`); dark surfaces set `data-tone="inverse"` and every token remaps.
No animation library ships with the public site.

**SEO.** `pageMetadata()` gives each page a title under 60 characters, a
description, canonical URL and social cards; `src/lib/seo/json-ld.ts` builds
the Organization, WebSite and founder Person graph from settings; articles and
publications add their own nodes. `sitemap.ts` includes every published post.

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
| `REVALIDATE_SECRET`             | Any long random string (`openssl rand -hex 32`); shared with the Supabase webhook                 | Never              |
| `NEXT_PUBLIC_SITE_URL`          | The public origin, no trailing slash; canonical URLs, sitemap, social cards, invite links         | Yes                |

`.env.example` documents each one and lists Cloudflare's Turnstile test keys.
Locally, `.env.local` points at the local Supabase stack and uses the
"always pass" Turnstile keys.

## 5. Running it locally

Prerequisites: Node 22 (`.nvmrc`; `npm run dev`/`build` refuse anything
older), the Supabase CLI, Docker Desktop for the local Supabase stack.

```
npm install
npm run db:start          # local Supabase; prints the URL and keys for .env.local
npm run db:reset          # migrations + seed.sql + seeds/*.sql (settings, first admin, starter drafts)
npm run dev               # http://localhost:3000, admin at /admin
```

The local first admin is `admin@oliviaenergyandpower.com` / `olivia-admin-local`
(created by `supabase/seed.sql`; change it after signing in). Other commands:

| Command                                            | What it does                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm run test`                                     | Vitest: contact action, admin route guard, revalidation helpers and route             |
| `npm run db:test`                                  | RLS proof against the local stack with the anon key, including the rate-limit trigger |
| `npm run db:types`                                 | Regenerate `src/lib/supabase/database.types.ts` after a migration                     |
| `npm run typecheck`, `lint`, `format:check`        | The usual; all three are clean at handover                                            |
| `npm run build && npm run start`                   | Production build; required before `lighthouse`                                        |
| `npm run lighthouse`                               | Lighthouse mobile on Home and What We Do (reports in `.screenshots/`)                 |
| `npm run shots -- /route`                          | Screenshots at 390/768/1440 with overflow and console checks                          |
| `node scripts/create-admin.mjs <email> <password>` | Create or promote an admin on any project                                             |

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

Three migrations in `supabase/migrations/`:

1. `initial_schema` — `profiles` (one per Auth user, `role` admin or editor,
   created by a trigger on `auth.users`), `posts`, `publications`, `settings`,
   `contact_messages`, the `media` bucket, RLS policies, narrowed grants, the
   `is_admin()` function and the word-count trigger.
2. `public_authors` — a view exposing only the names of profiles with a
   published post, for bylines.
3. `contact_rate_limit` — the 3-per-hour trigger.

`supabase/seed.sql` holds settings defaults, one draft and the local admin;
`supabase/seeds/starter-articles.sql` holds the four starter drafts. Both load
on `db reset`; on an existing database run the file with `psql`.

RLS in one line: anon reads published posts, publications and settings and may
insert contact messages (never pre-marked read); admins do everything; editors
see only their own profile. `scripts/rls-test.mjs` proves each rule.

## 7. Deploying

**Supabase (hosted).**

1. Create a project; note the URL and keys.
2. `supabase link --project-ref <ref>` then `supabase db push` to apply the
   migrations. Do not push `seed.sql` to production; create the first admin
   with `node scripts/create-admin.mjs <email> '<password>'` using the
   production env, then invite others from Team.
3. Authentication → URL Configuration: set Site URL to the public origin and
   add `https://oliviaenergyandpower.com/admin/auth/callback` to Redirect
   URLs (invite and reset links land there). Disable public sign-ups (the
   local config already does).
4. Authentication → Email Templates. Supabase's default invite and recovery
   templates put the token in the URL fragment, which a server route cannot
   read, so replace the link in both with a `token_hash` link to the callback
   (the route accepts both types and shows "That sign-in link is invalid or
   has expired" for a bad one). Invite user:

   ```html
   <h2>You have been invited</h2>
   <p>
     You have been invited to administer Olivia Energy. Follow this link to
     accept the invitation and set your password:
   </p>
   <p>
     <a
       href="{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=invite&next=/admin/set-password"
       >Accept the invitation</a
     >
   </p>
   ```

   Reset password:

   ```html
   <h2>Reset your password</h2>
   <p>
     Follow this link to set a new password for your Olivia Energy admin
     account:
   </p>
   <p>
     <a
       href="{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/admin/set-password"
       >Reset password</a
     >
   </p>
   <p>If you did not request this, ignore this email.</p>
   ```

   Leave the other templates as shipped; the admin area never sends them.

5. Authentication → Attack Protection: enable CAPTCHA protection with
   provider Turnstile and the same secret as `TURNSTILE_SECRET_KEY` (the
   sign-in and reset forms already send the token and verify it themselves
   first, so they work before and after this is switched on); set the
   minimum password length to 10; enable leaked-password protection.
6. Authentication → SMTP: configure a sender (Resend works) or invite and
   reset emails will not go out.
7. Storage: the migration creates the `media` bucket (public read of
   objects, admin write, images and PDFs up to 10 MB; listing is not public).
8. Database → Webhooks: on insert, update and delete of `posts`,
   `publications` and `settings`, `POST https://<domain>/api/revalidate` with
   header `Authorization: Bearer <REVALIDATE_SECRET>`.
9. Plan: Pro. Free projects pause after a week without traffic and keep no
   backups; Pro takes daily backups (seven days) and point-in-time recovery
   is an add-on. Backups do not include Storage objects: export the `media`
   bucket periodically alongside `supabase db dump`.

**Vercel.**

1. Import the repository (see §8 for creating it). Framework preset Next.js;
   defaults for build and output; Node.js 22 (pinned by `engines`). Plan:
   Pro, since the Hobby plan is for non-commercial use.
2. Add every variable from §4 for Production (and Preview if wanted).
   `NEXT_PUBLIC_SITE_URL` must be the public origin; a production build
   without it fails on purpose.
3. Add the custom domain and point DNS at Vercel (the domain is registered at
   Hostinger; change its A and CNAME records there and add `www` as a redirect
   to the apex), then redeploy.
4. Images and the CSP are confined to the project in
   `NEXT_PUBLIC_SUPABASE_URL`; nothing to add unless a custom storage domain
   is used, in which case edit `next.config.ts`.
5. Set the function region to match the Supabase region.

**Resend.** Verify the sending domain (SPF and DKIM records), create an API
key restricted to sending, set `RESEND_FROM_EMAIL` to an address on that
domain. Contact-form mail goes to the address in Settings → Contact email with
Reply-To set to the sender.

**Cloudflare Turnstile.** Create a widget for the production hostname (and
`localhost` for previews if desired), managed mode, and copy the site and
secret keys.

**After the first deploy.** Sign in at `/admin`, change the password, set
Settings (addresses, phones, socials, Scholar profile), submit the contact
form once and confirm the message reaches both the inbox and the mailbox,
publish a test article and confirm it appears without a redeploy, submit the
sitemap in Google Search Console, and run the Rich Results Test on the live
URL (its code-paste mode requires a Google login; the URL mode does not).

## 8. Transferring ownership

**Repository.** The code lives in a GitHub repository under the developer's
account. Transfer it from the repository's Settings → General → Danger Zone →
Transfer ownership to the client's GitHub organisation (GitHub redirects the
old URL), then connect it to Vercel if Git-based deploys are wanted.
`.gitignore` already excludes `node_modules`, `.next`, every `.env*` file
except `.env.example`, `.screenshots` and the local harness state.

**Vercel project.** From the project: Settings → General → Transfer Project,
choose the client's team (they need a Vercel team; Hobby accounts cannot own
team projects). Environment variables, domains and deployments move with it.
Confirm the DNS records still point at Vercel afterwards.

**Supabase project.** From the project: Settings → General → Transfer Project
to another organisation. The client must first create an organisation and
accept the transfer; the project keeps its URL and keys, so nothing in Vercel
changes. Move billing to the client's organisation at the same time. After
the transfer, rotate the service-role key and `REVALIDATE_SECRET`, update
them in Vercel and in the webhook, and remove the handover engineer's Auth
user from Team.

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

Kept as the client's brief states them, because nothing online confirms
them: "registered in the United States and Nigeria" and "a NIPEX registered
partner". They appear in the positioning statement and the third
differentiator on What We Do, and in the About page's search description.
The hero's credentials line carries only sourced facts (incorporation in
2020, the founder's name and field, the two cities).

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
- Invite emails have not been exercised against a real Supabase Auth SMTP
  configuration; the code follows the documented flow.
- Turnstile runs on Cloudflare's always-pass test keys in `.env.local`; the
  hosted site needs the real site and secret keys (the widget shows "For
  testing only" until then).
- The photographs are licensed stock chosen to fit the firm's markets; the
  client may swap in their own (see `public/images/CREDITS.md`).
- Adding an Insights category means adding an enum value in a migration and a
  label in `POST_CATEGORY_LABELS` (the type makes a missing label a compile
  error).
