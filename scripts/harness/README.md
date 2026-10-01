# Docker-free harness

`start.sh` runs the site's database layer without Docker: Homebrew Postgres 18
with stand-in `auth`, `storage` and `extensions` schemas (`shim.sql`), the
project's migrations and seeds, PostgREST on port 3010, and `proxy.mjs`, which
answers on the Supabase port (54321) with the slice of the API the site uses:
`/rest/v1` (forwarded to PostgREST, JWTs passed through, the `sb_secret_` key
mapped to the service role), password sign-in, session refresh, `GET /user`,
sign-out, the admin user list, and public object storage on disk.

It exists for QA when the real local stack cannot start. It is not a
substitute: invitations, email, real storage rules and the RLS proof
(`npm run db:test`) need `npm run db:start`. State lives in `.harness/`
(ignored by git); delete it to start fresh.
