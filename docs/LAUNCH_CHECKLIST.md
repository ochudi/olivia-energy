# Launch checklist

The state of the site on 29 September 2026, when it was declared ready to
deploy, and the steps that only the account owners can take. Tick the second
list off in order; nothing in it needs a code change.

## Verified in this build

**Quality gates.** `npm run typecheck`, `npm run lint`, `npm run format:check`
and `npm test` are clean; `npm run build` succeeds with every public page
static or incrementally regenerated (no page renders per request).

**Lighthouse, mobile, production build** (performance / accessibility / best
practices / SEO). Accessibility, best practices and SEO are 100 on every
route. The performance figures below were measured on a laptop with a load
average above 10 from other work; the same pages scored 97 to 100 earlier
the same day on a quiet machine, and the difference is all in the simulated
largest-contentful-paint (2.6 to 3.5 s here against about 2.4 s quiet).
Measure the live site with PageSpeed Insights after deploy for the figures
that count.

| Route         | Scores               |
| ------------- | -------------------- |
| /             | 96 / 100 / 100 / 100 |
| /what-we-do   | 94 / 100 / 100 / 100 |
| /about        | 91 / 100 / 100 / 100 |
| /insights     | 91 / 100 / 100 / 100 |
| an article    | 91 / 100 / 100 / 100 |
| /publications | 95 / 100 / 100 / 100 |
| /contact      | 94 / 100 / 100 / 100 |
| /privacy      | 97 / 100 / 100 / 100 |

**Every device.** Every public page was captured at twelve viewports (320,
360, 390 and 430 px phones, an 844×390 phone in landscape, 768 and 1024 px
tablets, a 1180 px tablet in landscape, 1280, 1440, 1920 and 2560 px
desktops) plus the open menu at each phone width and the contact form's
error state, and checked automatically for horizontal overflow, tap targets
under 24 px, text under 11 px, broken or distorted images, missing alt text,
a single h1 and console errors, then read by eye.

**Security.**

- Response headers on every route: `Strict-Transport-Security` (two years,
  subdomains), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
  `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`, and in
  production a Content-Security-Policy that confines scripts, connections,
  frames and images to the site, Cloudflare Turnstile, the configured
  Supabase project and the article embed hosts. No `X-Powered-By`.
- The public API key can read published posts, publications and settings
  and nothing else; it cannot write anywhere. Contact messages are written
  by the server after Turnstile has verified the sender, and each address
  is limited to three messages an hour (proved with `psql` as each role).
- `/admin` is guarded in the proxy, in every page, and in every server
  action; the service-role key is confined to server-only modules.
- Admin sign-in and password reset carry Turnstile and verify it server-side
  before Supabase is called; the session cookie is `Secure` in production.
- `POST /api/revalidate` compares its secret in constant time.
- `npm audit --omit=dev`: no vulnerabilities.

**SEO and sharing.** Every public page has a unique title under 60
characters, a description, a canonical URL, Open Graph and Twitter cards
(rendered images at 1200×630), `lang="en-GB"`, one h1 and no skipped heading
levels. `robots.txt` excludes `/admin`, `/api/` and `/styleguide` and admits
every crawler, AI crawlers included; the sitemap lists every public route,
each article and each Insights category that has an article (an empty
category is `noindex`). Structured data (Organization with its legal name
and registration, WebSite, the founder as a Person with his scholarly
profiles, Article, ScholarlyArticle with DOIs, BreadcrumbList) parses on
every page. `/llms.txt` summarises the firm, its pages, articles and papers
for answer engines, and `/insights/feed.xml` is an RSS feed of the articles.

**Accessibility.** Lighthouse accessibility 100 on every route; visible
focus on every control; skip link; labelled form fields with errors
announced; reduced-motion handling in CSS, in the reveal system and in the
hero canvas; every text colour at least 4.5:1 and every input border at
least 3:1 against its surface.

**Privacy.** Public pages set no cookies and load no analytics. The privacy
notice at `/privacy` describes what the contact form collects, the lawful
basis, the processors (Supabase, Resend, Vercel, Cloudflare), retention and
the visitor's rights under the Nigeria Data Protection Act 2023; it is
linked from the footer and the form.

**Content.** No placeholder, TODO or "to follow" text remains. Every factual
claim traces to a source listed in `DEVELOPER_HANDOVER.md`, section 9, which
also lists what the client should confirm.

## Going live

Vercel first, on its own `vercel.app` address; the domain and email follow.
The Supabase project may be one shared with other applications: every step
below leaves them untouched. `.env.hosted` is a git-ignored file in the
project folder holding the production values.

### 1. Database (Supabase dashboard, about five minutes)

1. **SQL Editor → New query.** Paste the whole of `supabase/hosted-setup.sql`
   and run it. The editor may ask you to confirm because the script contains
   `revoke` statements; they apply to the new schema only. The result is one
   row: 9 settings, 9 publications, 4 articles, 1 media bucket. Running it a
   second time changes nothing and says so. If a run stops with an error, run
   `rollback;` on its own before trying again.
2. **Project Settings → Data API → Exposed schemas.** Add `olivia_energy` at
   the end of the list, leave `public` first, save. Change nothing else, and
   nothing under Authentication.
3. **First admin and a check**, in a terminal in the project folder:

   ```bash
   node --env-file=.env.hosted scripts/create-admin.mjs you@example.com 'a strong password'
   node --env-file=.env.hosted scripts/check-hosted.mjs
   ```

   The second command reads only and should end with "All checks passed".

### 2. Bot protection (Cloudflare, free)

4. **Turnstile → Add widget.** Managed mode, hostname
   `oliviaenergyandpower.com`. Put the site key and the secret key into
   `.env.hosted`. The contact form and admin sign-in both need them; the test
   keys used locally do not work on the live site.

### 3. Vercel

5. **Add New → Project → import the GitHub repository.** Leave the detected
   Next.js settings. Copy the variables to the clipboard with
   `grep -v '^#' .env.hosted | grep . | pbcopy`, click into the first Key box
   under Environment Variables and paste (Vercel splits the lines into six
   variables), then Deploy. Do not set `NEXT_PUBLIC_SITE_URL`: the site follows the project's
   production domain by itself. Afterwards, under Settings → Environment
   Variables, edit `SUPABASE_SERVICE_ROLE_KEY` and untick Preview and
   Development so only production builds carry it; and under Settings →
   Functions choose the region nearest the Supabase project's.
6. **Add the Vercel hostname to Turnstile.** Copy the production domain
   Vercel assigned (for example `olivia-energy.vercel.app`) into the widget's
   hostnames. No redeploy is needed. Use that address, not the longer
   per-deployment ones, which Turnstile and the contact form reject.
7. **Check the live address.** Open each page, send one contact message,
   sign in at `/admin` and find the message in Inbox, save Settings once,
   publish a test article and confirm it appears without a redeploy.

### 4. Domain and email (when ready)

8. **Vercel → Settings → Domains.** Add `oliviaenergyandpower.com` and `www`
   (redirecting to the apex). At Hostinger set the A and CNAME records Vercel
   shows. As soon as Vercel marks the domain valid, redeploy: until then the
   contact form on the new domain is rejected, because each deployment knows
   only the address it was built for. Then set the `vercel.app` domain to
   redirect to the apex. Check that the mailbox in Settings → Contact email
   (`info@oliviaenergyandpower.com`) exists.
9. **Resend.** Add the domain, create the SPF, DKIM and DMARC records it
   lists at Hostinger, create an API key, add `RESEND_API_KEY` in Vercel and
   redeploy. From then on contact messages are also emailed, and invitations
   and password resets go out by email. Until then messages wait in the
   Inbox, an invitation shows its link for you to pass on, and a forgotten
   password is replaced with
   `node --env-file=.env.hosted scripts/create-admin.mjs <email> '<new password>' --set-password`.
10. **Search.** Submit the sitemap in Google Search Console and run
    `npm run lighthouse` against the live URL.

### What costs nothing, and the catch in each

- **Vercel Hobby** is free, but its terms limit it to non-commercial use and
  a Hobby project cannot be transferred to a client's team. Pro removes both.
- **Supabase free** pauses a project after a week without requests and keeps
  no backups. A shared project that other applications keep busy will not
  pause; a paused one leaves the public pages up from their last build and
  takes sign-in down.
- **Turnstile** is free. **Resend** is free for one domain and 3,000 emails
  a month.
- **The secret key** of a shared Supabase project reaches every application
  in it. It lives in Vercel's environment variables and `.env.hosted` only,
  and the Vercel project must not be handed to the client while the project
  is shared (`DEVELOPER_HANDOVER.md` §8).

## Recommended after launch

- Google Search Console and Bing Webmaster Tools for the domain.
- A cookieless analytics service if the client wants visitor numbers
  (Vercel Web Analytics or Plausible; both need one line in the layout and
  an update to the privacy notice and the CSP).
- Uptime monitoring on `/` and `/admin/login`.
- Quarterly: `npm outdated`, `npm audit`, a Lighthouse run, and a check that
  the OpenAlex figures on `/publications` still match Google Scholar.
- If the site ever collects more than 200 people's details in six months,
  ask counsel whether registration with the Nigeria Data Protection
  Commission applies.
