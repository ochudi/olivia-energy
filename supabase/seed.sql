-- =====================================================================
-- Seed — runs after migrations on `supabase db reset` (local only), before
-- supabase/seeds/*.sql (publications, starter articles).
--
-- Settings defaults. Shapes are validated by src/lib/supabase/types.ts
-- (settingsSchema); every value is editable in Admin → Settings.
-- =====================================================================

insert into public.settings (key, value) values
  -- Footer line; mirrors SITE.tagline in src/content/site.ts
  ('tagline', '"Independent energy advisory, built on evidence."'::jsonb),
  -- Supplied by the client 2026-09-06
  ('contact_email', '"info@oliviaenergyandpower.com"'::jsonb),
  -- Supplied by the client 2026-09-29
  ('socials', '{
    "linkedin": "https://www.linkedin.com/company/olivia-energy-and-power-company-ltd/",
    "instagram": "https://www.instagram.com/olivia.energy/",
    "x": "https://x.com/OliviaEnergy"
  }'::jsonb),
  -- City level only. Fort Worth: the founder's BusinessDay byline (January
  -- 2026). Otta: the company's LinkedIn headquarters.
  ('addresses', '[
    { "country": "United States", "lines": ["Fort Worth, Texas"] },
    { "country": "Nigeria", "lines": ["Otta, Ogun State"] }
  ]'::jsonb),
  -- No public numbers; the contact page lists none while this is empty
  ('phones', '[]'::jsonb),
  -- Footer NIPEX line; the footer hides it while empty
  ('nipex_wording', '""'::jsonb),
  -- The client decides whether to show the stats band
  ('stats_visible', 'false'::jsonb),
  -- Founder's Google Scholar profile, linked from Publications
  ('scholar_url', '"https://scholar.google.com/citations?user=7U3pwDIAAAAJ"'::jsonb),
  -- Sourced figures; mirrors STATS in src/content/home.ts, which gives the
  -- source for each (Brand Spur 2020; OpenAlex, ORCID, Google Scholar 2026)
  ('stats', '[
    { "key": "markets", "value": 2, "label": "Markets", "description": "United States and Nigeria" },
    { "key": "outlets", "value": 2, "label": "Retail outlets", "description": "Opened in Ogun State in 2020" },
    { "key": "articles", "value": 9, "label": "Journal articles", "description": "By the founder and co-authors, 2022 to 2025" },
    { "key": "citations", "value": 130, "suffix": "+", "label": "Citations", "description": "Of the founder''s published papers" }
  ]'::jsonb)
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------
-- First admin (local only: seed.sql runs on `supabase db reset`). On a
-- hosted project run `node scripts/create-admin.mjs <email> <password>`
-- instead. Local login: admin@oliviaenergyandpower.com, password
-- olivia-admin-local — change it after signing in.
-- ---------------------------------------------------------------------
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

-- The trigger created the profile with role editor; promote it.
update public.profiles
  set role = 'admin'
  where id = '00000000-0000-4000-8000-000000000001';
