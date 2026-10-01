-- =====================================================================
-- Launch hardening (2026-09-29).
--
-- 1. contact_messages: the public API key could insert directly, which
--    skipped Turnstile and let anyone fill the inbox. The form's server
--    action now inserts with the service role after Cloudflare verifies the
--    token, so anon needs no insert privilege and the public policy goes.
--    The per-address rate-limit trigger still fires for every role.
-- 2. storage: public buckets serve objects without a SELECT policy, so the
--    "public read" policy only let anyone list the bucket, including cover
--    images for unpublished drafts. Dropped.
-- 3. storage: the upload form accepts GIF; the bucket now does too.
-- =====================================================================

drop policy if exists "contact_messages: public insert" on public.contact_messages;
revoke insert on public.contact_messages from anon;

comment on table public.contact_messages is
  'Contact-form submissions, written by the server action (service role) after Turnstile verification; admins read and manage.';

drop policy if exists "media: public read" on storage.objects;

update storage.buckets
  set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'application/pdf']
  where id = 'media';
