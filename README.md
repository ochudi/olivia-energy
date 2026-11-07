# Olivia Energy

The marketing site and admin for Olivia Energy and Power Company Limited, a
strategic energy advisory and research firm. It publishes the firm's pages,
its founder's articles, op-eds and research, and a contact form, with a
back office at `/admin` for articles, publications, settings and the inbox.

## Stack

| Concern         | Choice                                                     |
| --------------- | ---------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack), React 19               |
| Language        | TypeScript (strict)                                        |
| Styling         | Tailwind CSS v4, design tokens in `src/styles`             |
| Data and auth   | Supabase (Postgres, Auth, Storage), schema `olivia_energy` |
| Rich text       | Tiptap (admin editor and renderer)                         |
| Email           | Resend                                                     |
| Bot protection  | Cloudflare Turnstile                                       |
| Validation      | zod                                                        |
| Tests           | Vitest                                                     |
| Lint and format | ESLint 9 (flat config), Prettier                           |

## Getting started

Requirements: Node.js 22 (`.nvmrc`; `npm run dev` and `npm run build` refuse
older versions), npm 10 or newer, and Docker for the local Supabase stack.

```bash
nvm use
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run db:start               # local Supabase stack (Docker), applies migrations
npm run db:reset               # migrations, then the seed content
npm run dev                    # http://localhost:3000
```

`supabase status` prints the local API URL and keys for `.env.local`. The
design system is at `/styleguide`; the back office is at `/admin`.

**First admin.** `supabase/seeds/local-admin.sql` creates
`admin@oliviaenergyandpower.com` with password `olivia-admin-local` on the
local stack only. On a hosted project run
`node --env-file=.env.hosted scripts/create-admin.mjs <email> <password>`
once, then invite others from Team.

## Environment variables

Every variable is listed in `.env.example`. Never commit real values.

| Variable                        | Purpose                                                      | Browser |
| ------------------------------- | ------------------------------------------------------------ | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                         | Yes     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (publishable) key; Row Level Security applies         | Yes     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Secret key; bypasses RLS, server code only                   | No      |
| `RESEND_API_KEY`                | Resend API key                                               | No      |
| `RESEND_FROM_EMAIL`             | Sender for contact-form mail, on a domain verified in Resend | No      |
| `TURNSTILE_SITE_KEY`            | Turnstile widget site key                                    | No      |
| `TURNSTILE_SECRET_KEY`          | Turnstile widget secret key                                  | No      |
| `REVALIDATE_SECRET`             | Bearer token for `POST /api/revalidate`                      | No      |
| `NEXT_PUBLIC_SITE_URL`          | Canonical origin, no trailing slash; optional on Vercel      | Yes     |

On Vercel leave `NEXT_PUBLIC_SITE_URL` unset and the site follows the
project's production domain. Elsewhere set it to the served origin: a
production build with neither fails on purpose rather than putting localhost
into canonical URLs.

## Scripts

| Command                 | What it does                                                                     |
| ----------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`           | Dev server (writes to `.next/dev`, so it never clobbers a build)                 |
| `npm run build`         | Production build                                                                 |
| `npm run start`         | Serve the production build                                                       |
| `npm run lint`          | ESLint (`lint:fix` to auto-fix)                                                  |
| `npm run format`        | Prettier (`format:check` to verify)                                              |
| `npm run typecheck`     | `tsc --noEmit`                                                                   |
| `npm run test`          | Vitest                                                                           |
| `npm run shots`         | Screenshot a route at 390, 768 and 1440 px into `.screenshots/`                  |
| `npm run a11y`          | Lighthouse accessibility audit against a running server                          |
| `npm run lighthouse`    | Lighthouse, all four categories, Home and What we do on mobile                   |
| `npm run db:start`      | Start the local Supabase stack                                                   |
| `npm run db:stop`       | Stop it                                                                          |
| `npm run db:reset`      | Recreate the local database from the migrations and seeds                        |
| `npm run db:types`      | Regenerate `src/lib/supabase/database.types.ts` from the local stack             |
| `npm run db:test`       | Row Level Security proof against the local stack                                 |
| `npm run db:hosted-sql` | Regenerate `supabase/hosted-setup.sql`, the file a hosted project is set up from |
| `npm run admin:create`  | Create or promote an admin user on the local stack                               |

`a11y`, `lighthouse` and `shots` need a server on `BASE_URL` (default
`http://localhost:3000`) and a local Chrome, or `CHROME_PATH`. Before a pull
request or a deploy run:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## Project layout

```
src/
  app/            Routes: (site) public pages, (guide) /styleguide, admin, api
  components/     ui primitives, page sections, figures, insights, admin
  content/        All page copy and photo/credit manifests
  lib/            Supabase clients and queries, SEO and JSON-LD, admin actions
  styles/         Design tokens
scripts/          Database, brand-asset, photo and audit tooling
supabase/         Config, migrations, seeds and the hosted setup SQL
public/           Images, brand kit, data files
docs/             Handover, admin guide and launch checklist
```

`DESIGN.md` describes the visual system and its rules.

## Deploying

**Vercel (recommended).** Import the repository, add every variable from
`.env.example` to the project (keep `SUPABASE_SERVICE_ROLE_KEY` to the
Production environment), and deploy. The framework preset, build command
(`next build`) and output directory are detected. Add the custom domain under
Project, Settings, Domains.

**Self-hosted.** Any host that runs Node 22 can serve it: `npm ci`,
`npm run build`, provide the environment variables, `npm run start -- --port 3000`,
and put a reverse proxy (nginx, Caddy) in front for TLS and caching. For
containers, set `output: "standalone"` in `next.config.ts` and copy
`.next/standalone`, `.next/static` and `public` into the image.

Hosted database setup, Turnstile, Resend, DNS and the first checks on the live
site are in the launch checklist.

## Documentation

- [Developer handover](docs/DEVELOPER_HANDOVER.md): architecture, environment,
  database, deployment and transferring ownership.
- [Admin guide](docs/ADMIN_GUIDE.md): writing and publishing, publications,
  settings, the inbox and the team.
- [Launch checklist](docs/LAUNCH_CHECKLIST.md): going live, step by step.
