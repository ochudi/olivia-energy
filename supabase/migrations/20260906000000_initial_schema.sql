-- =====================================================================
-- OLIVIA ENERGY — schema
--
-- Everything the site stores lives in its own Postgres schema,
-- `olivia_energy`, so it can share a Supabase project with other
-- applications without touching them. Nothing here creates, alters or
-- revokes anything in `public`, and there is no trigger on auth.users.
-- The only objects outside the schema are one storage bucket
-- (`olivia-energy-media`) and its policies on storage.objects, all named
-- for this site.
--
--   profiles          who may use the admin; role = 'admin' unlocks writes
--   posts             Insights articles (Tiptap JSON body)
--   publications      academic and industry publications
--   settings          key → jsonb (tagline, socials, addresses, phones,
--                     nipex_wording, stats, …)
--   contact_messages  contact-form submissions
--   authors           view: bylines for published posts
--
-- Access model (RLS + table grants):
--   anon           select published posts, publications, settings, authors
--   authenticated  the same, plus everything when the caller has a
--                  profiles row with role = 'admin'. A user of another
--                  application in the same project has no such row.
--   service_role   bypasses RLS (server-only key)
--
-- The Data API must expose the schema: locally `[api] schemas` in
-- supabase/config.toml; hosted, Project Settings → Data API → Exposed
-- schemas. Local: `supabase db reset`. Hosted: see supabase/hosted-setup.sql.
-- =====================================================================

create schema olivia_energy;
comment on schema olivia_energy is
  'Olivia Energy website: content, settings, contact inbox and admin roles.';

grant usage on schema olivia_energy to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type olivia_energy.post_status as enum ('draft', 'published');

-- The seven Insights categories. Rename in place with
--   alter type olivia_energy.post_category rename value 'old' to 'new';
-- and update POST_CATEGORY_LABELS in src/lib/supabase/types.ts.
create type olivia_energy.post_category as enum (
  'market-analysis',
  'policy-regulation',
  'energy-transition',
  'downstream-gas',
  'power',
  'finance-investment',
  'research-notes'
);

-- ---------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- ---------------------------------------------------------------------
create function olivia_energy.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles — admin users are managed in Supabase Auth; this table says
-- which of them may use this site's admin. Rows are written explicitly
-- (the Team page's invite, scripts/create-admin.mjs): an Auth user without
-- a row here, such as a user of another application in the same project,
-- has no access at all.
-- ---------------------------------------------------------------------
create table olivia_energy.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'editor'
    constraint profiles_role_check check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table olivia_energy.profiles is
  'Members of this site''s admin, keyed by Supabase Auth user. role = admin unlocks every write policy; editor is reserved and grants nothing yet.';

create trigger profiles_set_updated_at
  before update on olivia_energy.profiles
  for each row execute function olivia_energy.set_updated_at();

-- is_admin(): true when the calling user has an admin profile.
-- SECURITY DEFINER so policies on profiles do not recurse; STABLE so it is
-- evaluated once per statement; empty search_path per Supabase lint.
create function olivia_energy.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from olivia_energy.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;
revoke execute on function olivia_energy.is_admin() from public;
grant execute on function olivia_energy.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------
create table olivia_energy.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null
    constraint posts_slug_key unique
    constraint posts_slug_format check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120
    ),
  title text not null
    constraint posts_title_length check (char_length(title) between 1 and 200),
  excerpt text
    constraint posts_excerpt_length check (char_length(excerpt) <= 400),
  -- Tiptap document JSON: { "type": "doc", "content": [...] }
  body jsonb not null default '{"type":"doc","content":[]}'::jsonb
    constraint posts_body_is_doc check (body ->> 'type' = 'doc'),
  -- Object path inside the media bucket, e.g. posts/2026/cover.webp, or a
  -- site-relative path such as /images/cover.jpg
  cover_path text,
  category olivia_energy.post_category not null,
  tags text[] not null default '{}',
  status olivia_energy.post_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references olivia_energy.profiles (id) on delete set null,
  seo_title text
    constraint posts_seo_title_length check (char_length(seo_title) <= 70),
  seo_description text
    constraint posts_seo_description_length check (char_length(seo_description) <= 200),
  -- Words in body, maintained by posts_before_write(); reading time derives from it.
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_published_has_date check (
    status = 'draft' or published_at is not null
  )
);
comment on table olivia_energy.posts is 'Insights articles. Public API sees rows with status = published and published_at <= now().';
comment on column olivia_energy.posts.body is 'Tiptap JSON document.';
comment on column olivia_energy.posts.cover_path is 'Object path inside the media storage bucket, or a site-relative path.';

create index posts_published_at_idx
  on olivia_energy.posts (published_at desc)
  where status = 'published';
create index posts_category_idx on olivia_energy.posts (category);
create index posts_tags_idx on olivia_energy.posts using gin (tags);

-- Plain text of a Tiptap JSON document (every "text" value, in order).
create function olivia_energy.tiptap_text(node jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  acc text := '';
  item jsonb;
begin
  if node is null then
    return '';
  end if;
  if jsonb_typeof(node) = 'array' then
    for item in select value from jsonb_array_elements(node) loop
      acc := acc || olivia_energy.tiptap_text(item) || ' ';
    end loop;
    return acc;
  elsif jsonb_typeof(node) = 'object' then
    return coalesce(node ->> 'text', '') || ' ' || olivia_energy.tiptap_text(node -> 'content');
  end if;
  return '';
end;
$$;

-- Word count of a Tiptap JSON document.
create function olivia_energy.tiptap_word_count(node jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when btrim(t) = '' then 0
    else array_length(regexp_split_to_array(btrim(t), '\s+'), 1)
  end
  from olivia_energy.tiptap_text(node) as t;
$$;

-- The two helpers above exist for the trigger below. Functions are
-- executable by everyone by default, which would make them callable through
-- the Data API by anyone holding the public key.
revoke execute on function olivia_energy.tiptap_text(jsonb) from public;
revoke execute on function olivia_energy.tiptap_word_count(jsonb) from public;

-- Stamp published_at the first time a post is published; keep updated_at
-- and word_count honest. SECURITY DEFINER so it may call the helpers
-- whoever is writing the row.
create function olivia_energy.posts_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  new.word_count = olivia_energy.tiptap_word_count(new.body);
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_before_write
  before insert or update on olivia_energy.posts
  for each row execute function olivia_energy.posts_before_write();

-- ---------------------------------------------------------------------
-- publications
-- ---------------------------------------------------------------------
create table olivia_energy.publications (
  id uuid primary key default gen_random_uuid(),
  title text not null
    constraint publications_title_length check (char_length(title) between 1 and 300),
  -- One entry per author, in citation order.
  authors text[] not null default '{}',
  venue text,
  year integer
    constraint publications_year_range check (year between 1900 and 2100),
  -- Google Scholar or DOI link.
  url text
    constraint publications_url_scheme check (url ~* '^https?://'),
  summary text,
  featured boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table olivia_energy.publications is 'Publications list. Ordered by featured, then sort, then year desc.';

create index publications_order_idx
  on olivia_energy.publications (featured desc, sort asc, year desc);

create trigger publications_set_updated_at
  before update on olivia_energy.publications
  for each row execute function olivia_energy.set_updated_at();

-- ---------------------------------------------------------------------
-- settings — key/value. See src/lib/supabase/types.ts for the keys and
-- the shape of each value.
-- ---------------------------------------------------------------------
create table olivia_energy.settings (
  key text primary key
    constraint settings_key_format check (key ~ '^[a-z][a-z0-9_]*$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
comment on table olivia_energy.settings is 'Site settings as key → jsonb. Public-readable; admins write.';

create trigger settings_set_updated_at
  before update on olivia_energy.settings
  for each row execute function olivia_energy.set_updated_at();

-- ---------------------------------------------------------------------
-- contact_messages — written only by the contact form's server action
-- (service role) after Cloudflare Turnstile has verified the request; the
-- public API key has no privilege on the table.
-- ---------------------------------------------------------------------
create table olivia_energy.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null
    constraint contact_messages_name_length check (char_length(name) between 1 and 120),
  email text not null
    constraint contact_messages_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  organization text
    constraint contact_messages_organization_length check (char_length(organization) <= 160),
  message text not null
    constraint contact_messages_message_length check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now(),
  read boolean not null default false,
  -- Bot-check score recorded by the form handler (0–1), if any.
  turnstile_score real
    constraint contact_messages_turnstile_score_range check (turnstile_score between 0 and 1)
);
comment on table olivia_energy.contact_messages is
  'Contact-form submissions, written by the server action (service role) after Turnstile verification; admins read and manage.';

create index contact_messages_created_at_idx
  on olivia_energy.contact_messages (created_at desc);
create index contact_messages_email_recent_idx
  on olivia_energy.contact_messages (lower(email), created_at desc);

-- Rate limit: a sender may create at most 3 messages per rolling hour; the
-- fourth insert fails with SQLSTATE PT429, which PostgREST returns as HTTP
-- 429 (supabase-js: error.code = 'PT429'). A BEFORE INSERT trigger, so it
-- holds for every role, the service role included.
create function olivia_energy.contact_messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
begin
  select count(*) into recent
  from olivia_energy.contact_messages
  where lower(email) = lower(new.email)
    and created_at > now() - interval '1 hour';
  if recent >= 3 then
    raise exception 'rate_limited: more than 3 messages from this address in the last hour'
      using errcode = 'PT429',
            hint = 'Wait an hour before sending another message.';
  end if;
  return new;
end;
$$;
comment on function olivia_energy.contact_messages_rate_limit() is
  'Rejects a 4th contact message from the same email within an hour (SQLSTATE PT429 → HTTP 429).';

-- Trigger functions run without an EXECUTE check; revoking keeps the
-- function from being called directly.
revoke all on function olivia_energy.contact_messages_rate_limit() from public, anon, authenticated;

create trigger contact_messages_rate_limit
  before insert on olivia_energy.contact_messages
  for each row execute function olivia_energy.contact_messages_rate_limit();

-- ---------------------------------------------------------------------
-- authors — public bylines. profiles is closed to the public; this view
-- exposes only id and full_name, and only for members with a published
-- post. It deliberately runs with its owner's rights
-- (security_invoker = false) so the anonymous role can read it while
-- profiles stays closed; the Supabase linter flags that pattern, and here
-- it is the intent.
-- ---------------------------------------------------------------------
create view olivia_energy.authors
with (security_invoker = false)
as
  select p.id, p.full_name
  from olivia_energy.profiles p
  where exists (
    select 1
    from olivia_energy.posts x
    where x.author_id = p.id
      and x.status = 'published'
      and x.published_at <= now()
  );

comment on view olivia_energy.authors is
  'Bylines: id and full_name of profiles with a published post. Owner-rights view so anon can read it; profiles stays closed.';

-- ---------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------
alter table olivia_energy.profiles enable row level security;
alter table olivia_energy.posts enable row level security;
alter table olivia_energy.publications enable row level security;
alter table olivia_energy.settings enable row level security;
alter table olivia_energy.contact_messages enable row level security;

-- profiles: a member sees their own row; admins see and manage every row.
create policy "profiles: read own or admin"
  on olivia_energy.profiles for select
  to authenticated
  using (id = (select auth.uid()) or olivia_energy.is_admin());

create policy "profiles: admin write"
  on olivia_energy.profiles for all
  to authenticated
  using (olivia_energy.is_admin())
  with check (olivia_energy.is_admin());

-- posts: the public sees published rows; admins see and manage everything.
create policy "posts: public read published"
  on olivia_energy.posts for select
  to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "posts: admin all"
  on olivia_energy.posts for all
  to authenticated
  using (olivia_energy.is_admin())
  with check (olivia_energy.is_admin());

-- publications: public read; admin write.
create policy "publications: public read"
  on olivia_energy.publications for select
  to anon, authenticated
  using (true);

create policy "publications: admin all"
  on olivia_energy.publications for all
  to authenticated
  using (olivia_energy.is_admin())
  with check (olivia_energy.is_admin());

-- settings: public read; admin write.
create policy "settings: public read"
  on olivia_energy.settings for select
  to anon, authenticated
  using (true);

create policy "settings: admin all"
  on olivia_energy.settings for all
  to authenticated
  using (olivia_energy.is_admin())
  with check (olivia_energy.is_admin());

-- contact_messages: only admins may read, update or delete. There is no
-- insert policy: the server action writes with the service role.
create policy "contact_messages: admin all"
  on olivia_energy.contact_messages for all
  to authenticated
  using (olivia_energy.is_admin())
  with check (olivia_energy.is_admin());

-- ---------------------------------------------------------------------
-- Table privileges for the API roles, scoped to this schema. anon gets
-- exactly what its policies permit, so `select * from contact_messages`
-- with the public key is a hard 42501 error rather than zero rows.
-- authenticated gets the four verbs and RLS decides.
-- ---------------------------------------------------------------------
revoke all on all tables in schema olivia_energy from anon, authenticated;

grant select
  on olivia_energy.posts, olivia_energy.publications, olivia_energy.settings, olivia_energy.authors
  to anon;

grant select, insert, update, delete
  on olivia_energy.profiles, olivia_energy.posts, olivia_energy.publications,
     olivia_energy.settings, olivia_energy.contact_messages
  to authenticated;
grant select on olivia_energy.authors to authenticated;

grant all on all tables in schema olivia_energy to service_role;
-- Tables added by a later migration reach the service role without a
-- separate grant. anon and authenticated always need an explicit one.
alter default privileges in schema olivia_energy
  grant all on tables to service_role;

-- ---------------------------------------------------------------------
-- Storage: bucket "olivia-energy-media" — public read of objects by URL,
-- admin write. A public bucket serves objects without a SELECT policy, so
-- the only SELECT policy is the admins' (it is what lets them replace and
-- delete); nobody else can list the bucket.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'olivia-energy-media',
  'olivia-energy-media',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

create policy "olivia_energy media: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'olivia-energy-media' and olivia_energy.is_admin());

create policy "olivia_energy media: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'olivia-energy-media' and olivia_energy.is_admin());

create policy "olivia_energy media: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'olivia-energy-media' and olivia_energy.is_admin())
  with check (bucket_id = 'olivia-energy-media' and olivia_energy.is_admin());

create policy "olivia_energy media: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'olivia-energy-media' and olivia_energy.is_admin());
