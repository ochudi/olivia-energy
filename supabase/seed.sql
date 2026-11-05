-- =====================================================================
-- Seed — settings defaults. Runs after the migration on `supabase db reset`,
-- before supabase/seeds/*.sql (local admin, publications, starter
-- articles), and is part of supabase/hosted-setup.sql for a hosted project.
-- Shapes are validated by src/lib/supabase/types.ts
-- (settingsSchema); every value is editable in Admin → Settings.
-- =====================================================================

insert into olivia_energy.settings (key, value) values
  -- Footer line; mirrors SITE.tagline in src/content/site.ts
  ('tagline', '"Powering the transition. Inspiring sustainable futures."'::jsonb),
  -- Supplied by the client 2026-09-06
  ('contact_email', '"info@oliviaenergyandpower.com"'::jsonb),
  -- Supplied by the client 2026-09-29
  ('socials', '{
    "linkedin": "https://www.linkedin.com/company/olivia-energy-and-power-company-ltd/",
    "instagram": "https://www.instagram.com/olivia.energy/",
    "x": "https://x.com/OliviaEnergy"
  }'::jsonb),
  -- Fort Worth, city level: the founder's BusinessDay byline (January 2026).
  -- Nigeria, region level only: the client's instruction (3 October 2026)
  -- is that no town or state is named.
  ('addresses', '[
    { "country": "United States", "lines": ["Fort Worth, Texas"] },
    { "country": "Nigeria", "lines": ["Southwest Nigeria"] }
  ]'::jsonb),
  -- No public numbers; the contact page lists none while this is empty
  ('phones', '[]'::jsonb),
  -- Footer NIPEX line; mirrors NIPEX_WORDING in src/content/site.ts (vendor
  -- ID and categories supplied by the client 2026-10-03). The footer hides
  -- it when an admin clears it.
  ('nipex_wording', '"NIPEX Vendor ID S77939994. Categories: Consultancy QA/QC, Petroleum Products Haulage/Logistics, Goods/Materials Haulage."'::jsonb),
  -- The client decides whether to show the stats band
  ('stats_visible', 'false'::jsonb),
  -- Founder's Google Scholar profile, linked from Publications
  ('scholar_url', '"https://scholar.google.com/citations?user=7U3pwDIAAAAJ"'::jsonb),
  -- Sourced figures; mirrors STATS in src/content/home.ts, which gives the
  -- source for each (Brand Spur 2020; OpenAlex, ORCID, Google Scholar 2026)
  ('stats', '[
    { "key": "markets", "value": 2, "label": "Markets", "description": "United States and Nigeria" },
    { "key": "outlets", "value": 2, "label": "Retail outlets", "description": "Opened in Southwest Nigeria in 2020" },
    { "key": "articles", "value": 9, "label": "Journal articles", "description": "By the founder and co-authors, 2022 to 2025" },
    { "key": "citations", "value": 130, "suffix": "+", "label": "Citations", "description": "Of the founder’s published papers" }
  ]'::jsonb)
on conflict (key) do update set value = excluded.value;
