-- Minimal stand-in for the parts of a Supabase database the migrations touch.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create role authenticator noinherit login password 'postgres';
grant anon, authenticated, service_role to authenticator;

create schema extensions;
create extension if not exists pgcrypto with schema extensions;
grant usage on schema extensions to public;

create schema auth;
create table auth.users (
  instance_id uuid,
  id uuid primary key default gen_random_uuid(),
  aud text, role text,
  email text unique,
  encrypted_password text,
  email_confirmed_at timestamptz, invited_at timestamptz,
  confirmation_token text, confirmation_sent_at timestamptz,
  recovery_token text, recovery_sent_at timestamptz,
  email_change_token_new text, email_change text, email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb, raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  phone text, deleted_at timestamptz
);
create table auth.identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  identity_data jsonb, provider text, provider_id text,
  last_sign_in_at timestamptz, created_at timestamptz, updated_at timestamptz,
  unique (provider, provider_id)
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;
create function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '')
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.role(), auth.jwt() to anon, authenticated, service_role;

create schema storage;
create table storage.buckets (
  id text primary key, name text unique not null, owner uuid,
  public boolean default false, file_size_limit bigint, allowed_mime_types text[],
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text, owner uuid, metadata jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated, service_role;
grant select on storage.buckets, storage.objects to anon, authenticated;
grant all on storage.buckets, storage.objects to service_role;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on functions to service_role;
alter default privileges in schema public grant all on sequences to service_role;
