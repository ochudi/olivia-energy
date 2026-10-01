-- =====================================================================
-- OLIVIA ENERGY — initial schema
--
-- Applies once to a fresh Supabase project (local: `supabase db reset`;
-- hosted: `supabase db push`). Everything the site stores lives here:
--
--   profiles          one row per Auth user; role = 'admin' unlocks writes
--   posts             Insights articles (Tiptap JSON body)
--   publications      academic and industry publications
--   settings          key → jsonb (tagline, socials, addresses, phones,
--                     nipex_wording, stats)
--   contact_messages  contact-form submissions
--   storage "media"   public-read bucket; admins write
--
-- Access model (RLS + table grants):
--   anon           select published posts, publications, settings;
--                  insert contact_messages; read media objects
--   authenticated  the same, plus everything when profiles.role = 'admin'
--   service_role   bypasses RLS (server-only key)
--
-- Table privileges are revoked from the API roles and re-granted only where
-- a policy could ever allow the operation, so a forbidden request fails with
-- 42501 instead of quietly returning zero rows.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.post_status as enum ('draft', 'published');

-- TODO-CLIENT: the seven Insights categories are defined in CLAUDE.md
-- (Section 0), which has not been supplied. These placeholder values keep
-- the schema, the TypeScript types and the seed consistent. Rename in place
-- with:  alter type public.post_category rename value 'old' to 'new';
create type public.post_category as enum (
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
create or replace function public.set_updated_at()
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
-- profiles — admin users are managed in Supabase Auth; this table holds
-- the role. New Auth users get a profile automatically with role 'editor',
-- which grants nothing; promote to 'admin' (scripts/create-admin.mjs).
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'editor'
    constraint profiles_role_check check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is
  'One row per Supabase Auth user. role = admin unlocks every write policy; editor is reserved and grants nothing yet.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- is_admin(): true when the calling user has an admin profile.
-- SECURITY DEFINER so policies on profiles do not recurse; STABLE so it is
-- evaluated once per statement; empty search_path per Supabase lint.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------
create table public.posts (
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
  -- Object path inside the "media" bucket, e.g. posts/2026/cover.webp
  cover_path text,
  category public.post_category not null,
  tags text[] not null default '{}',
  status public.post_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references public.profiles (id) on delete set null,
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
comment on table public.posts is 'Insights articles. Public API sees rows with status = published and published_at <= now().';
comment on column public.posts.body is 'Tiptap JSON document.';
comment on column public.posts.cover_path is 'Object path inside the media storage bucket.';

create index posts_published_at_idx
  on public.posts (published_at desc)
  where status = 'published';
create index posts_category_idx on public.posts (category);
create index posts_tags_idx on public.posts using gin (tags);

-- Plain text of a Tiptap JSON document (every "text" value, in order).
create or replace function public.tiptap_text(node jsonb)
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
      acc := acc || public.tiptap_text(item) || ' ';
    end loop;
    return acc;
  elsif jsonb_typeof(node) = 'object' then
    return coalesce(node ->> 'text', '') || ' ' || public.tiptap_text(node -> 'content');
  end if;
  return '';
end;
$$;

-- Word count of a Tiptap JSON document.
create or replace function public.tiptap_word_count(node jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when btrim(t) = '' then 0
    else array_length(regexp_split_to_array(btrim(t), '\s+'), 1)
  end
  from public.tiptap_text(node) as t;
$$;

-- Stamp published_at the first time a post is published; keep updated_at
-- and word_count honest.
create or replace function public.posts_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  new.word_count = public.tiptap_word_count(new.body);
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_before_write
  before insert or update on public.posts
  for each row execute function public.posts_before_write();

-- ---------------------------------------------------------------------
-- publications
-- ---------------------------------------------------------------------
create table public.publications (
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
comment on table public.publications is 'Publications list. Ordered by featured, then sort, then year desc.';

create index publications_order_idx
  on public.publications (featured desc, sort asc, year desc);

create trigger publications_set_updated_at
  before update on public.publications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- settings — key/value. Keys in use: tagline, socials, addresses, phones,
-- nipex_wording, stats (see src/lib/supabase/types.ts for the value shapes).
-- ---------------------------------------------------------------------
create table public.settings (
  key text primary key
    constraint settings_key_format check (key ~ '^[a-z][a-z0-9_]*$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
comment on table public.settings is 'Site settings as key → jsonb. Public-readable; admins write.';

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------
create table public.contact_messages (
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
comment on table public.contact_messages is 'Contact-form submissions. Public can insert (read = false); admins read and manage.';

create index contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.publications enable row level security;
alter table public.settings enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: a user sees their own row; admins see and manage every row.
create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles: admin write"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- posts: the public sees published rows; admins see and manage everything.
create policy "posts: public read published"
  on public.posts for select
  to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "posts: admin all"
  on public.posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- publications: public read; admin write.
create policy "publications: public read"
  on public.publications for select
  to anon, authenticated
  using (true);

create policy "publications: admin all"
  on public.publications for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- settings: public read; admin write.
create policy "settings: public read"
  on public.settings for select
  to anon, authenticated
  using (true);

create policy "settings: admin all"
  on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- contact_messages: anyone may submit (never pre-marked as read);
-- only admins may read, update or delete.
create policy "contact_messages: public insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (read = false);

create policy "contact_messages: admin all"
  on public.contact_messages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Table privileges for the API roles. Supabase grants ALL by default; we
-- narrow anon to exactly what its policies permit so that, for example,
-- `select * from contact_messages` as anon is a hard 42501 error.
-- authenticated keeps full privileges on these tables and RLS decides.
-- ---------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

grant select on public.posts, public.publications, public.settings to anon;
grant insert on public.contact_messages to anon;

grant select, insert, update, delete
  on public.profiles, public.posts, public.publications, public.settings, public.contact_messages
  to authenticated;

-- ---------------------------------------------------------------------
-- Storage: bucket "media" — public read, admin write.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "media: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
