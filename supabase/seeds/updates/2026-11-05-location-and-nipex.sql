-- =====================================================================
-- Settings update, 5 November 2026: location and NIPEX (the client's
-- instructions of 3 October 2026). Not a seed: supabase/seed.sql already
-- carries these values for a new database. This file brings a database
-- that was seeded before 5 November 2026 into line, and is part of
-- supabase/hosted-updates/2026-11-05-location-and-nipex.sql.
--
-- It changes three settings rows in place and nothing else:
--   addresses      the Nigerian office reads "Southwest Nigeria", with no
--                  town or state; the United States office is untouched
--   stats          the retail outlets figure reads "Opened in Southwest
--                  Nigeria in 2020"; the other figures are untouched
--   nipex_wording  the NIPEX vendor ID and categories, only where the line
--                  is still empty (an admin's own wording is kept)
-- Safe to run twice: each statement changes a row only when it still needs
-- the change.
-- =====================================================================

update olivia_energy.settings
set value = (
  select coalesce(
    jsonb_agg(
      case
        when office->>'country' = 'Nigeria'
          then jsonb_set(office, '{lines}', '["Southwest Nigeria"]'::jsonb)
        else office
      end
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(value) as office
)
where key = 'addresses'
  and jsonb_typeof(value) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(value) as office
    where office->>'country' = 'Nigeria'
      and office->'lines' is distinct from '["Southwest Nigeria"]'::jsonb
  );

update olivia_energy.settings
set value = (
  select coalesce(
    jsonb_agg(
      case
        when stat->>'key' = 'outlets'
          then jsonb_set(stat, '{description}', '"Opened in Southwest Nigeria in 2020"'::jsonb)
        else stat
      end
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(value) as stat
)
where key = 'stats'
  and jsonb_typeof(value) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(value) as stat
    where stat->>'key' = 'outlets'
      and stat->>'description' is distinct from 'Opened in Southwest Nigeria in 2020'
  );

-- Mirrors NIPEX_WORDING in src/content/site.ts.
insert into olivia_energy.settings (key, value)
values ('nipex_wording', '"NIPEX Vendor ID S77939994. Categories: Consultancy QA/QC, Petroleum Products Haulage/Logistics, Goods/Materials Haulage."'::jsonb)
on conflict (key) do nothing;

update olivia_energy.settings
set value = '"NIPEX Vendor ID S77939994. Categories: Consultancy QA/QC, Petroleum Products Haulage/Logistics, Goods/Materials Haulage."'::jsonb
where key = 'nipex_wording'
  and (value = '""'::jsonb or jsonb_typeof(value) <> 'string');
