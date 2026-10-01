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
(rendered images at 1200×630), `lang="en"`, one h1 and no skipped heading
levels. `robots.txt` excludes `/admin`, `/api/` and `/styleguide`; the
sitemap lists every public route including each Insights category and
article. Structured data (Organization, WebSite, Person, Article,
ScholarlyArticle) parses on every page.

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

## Before go-live (account owners)

1. **Supabase project.** Create it (Pro plan: daily backups, no pausing).
   Run the migrations and the seeds (`supabase db push`, then
   `supabase/seed.sql` and `supabase/seeds/*.sql` with `psql`), create the
   first admin with `node scripts/create-admin.mjs`, and complete the Auth
   settings in `DEVELOPER_HANDOVER.md` §7 (email templates for invite and
   recovery, the redirect-URL allow-list, Turnstile CAPTCHA, minimum password
   length 10, leaked-password protection). Add the Database Webhook for
   `posts`, `publications` and `settings` pointing at `/api/revalidate`.
2. **Cloudflare Turnstile.** Create a widget for `oliviaenergyandpower.com`
   and take its site key and secret. The test keys in `.env.local` show
   "For testing only" and must not reach production.
3. **Resend.** Verify the sending domain (SPF, DKIM and a DMARC record at the
   registrar) and create an API key. The sender is
   `no-reply@oliviaenergyandpower.com`; replies go to the person who wrote.
4. **Vercel project.** Pro plan (the site is commercial). Import the code,
   framework preset Next.js, Node 22. Set every variable in `.env.example`
   for Production, with `NEXT_PUBLIC_SITE_URL=https://oliviaenergyandpower.com`
   and `REVALIDATE_SECRET` from `openssl rand -hex 32`. Choose a function
   region near the Supabase region.
5. **Domain.** At Hostinger, point `oliviaenergyandpower.com` at Vercel (the
   A and CNAME records Vercel shows) and add `www` as a redirect to the apex.
   Keep the registrar account in the client's name.
6. **First checks on the live URL.** Sign in at `/admin`, change the admin
   password, save Settings once, send one contact message and confirm it
   reaches the inbox and the email, run `npm run lighthouse` against the
   live URL, and submit the sitemap in Google Search Console.
7. **Change the seeded password.** If the seed was used, the local admin
   password `olivia-admin-local` is public knowledge; set a new one.

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
