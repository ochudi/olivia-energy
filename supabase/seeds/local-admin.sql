-- =====================================================================
-- Local admin — LOCAL STACK ONLY. Runs on `supabase db reset` (before the
-- starter articles, which credit the first admin) and is deliberately left
-- out of supabase/hosted-setup.sql: the password is public.
--
-- Local login: admin@oliviaenergyandpower.com, password olivia-admin-local.
-- On a hosted project run `node scripts/create-admin.mjs <email> <password>`.
-- =====================================================================
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at,
  updated_at, confirmation_token, email_change, email_change_token_new,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'admin@oliviaenergyandpower.com',
  extensions.crypt('olivia-admin-local', extensions.gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at,
  created_at, updated_at
) values (
  gen_random_uuid(),
  '00000000-0000-4000-8000-000000000001',
  '{"sub":"00000000-0000-4000-8000-000000000001","email":"admin@oliviaenergyandpower.com"}'::jsonb,
  'email',
  '00000000-0000-4000-8000-000000000001',
  now(), now(), now()
)
on conflict do nothing;

insert into olivia_energy.profiles (id, email, role)
values (
  '00000000-0000-4000-8000-000000000001',
  'admin@oliviaenergyandpower.com',
  'admin'
)
on conflict (id) do update set role = 'admin';
