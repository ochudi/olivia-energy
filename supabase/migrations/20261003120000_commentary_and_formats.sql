-- =====================================================================
-- OLIVIA ENERGY — commentary and formats (3 October 2026)
--
-- Additive and idempotent: every statement is `if not exists` or guarded,
-- so it is safe to run twice and on a database that already has it. It
-- creates, alters or drops nothing outside the olivia_energy schema, and
-- it never drops, renames or relaxes anything that exists.
--
-- publications gains what the Research and Insights pages need to list the
-- founder's BusinessDay commentary beside his journal articles:
--   kind          'journal' (every existing row), 'op-ed', 'mention',
--                 'report' or 'talk'
--   published_on  full publication date; year stays as it is
--   topics        chips for an op-ed (see OpEdTopic in src/types/contracts.ts)
--   pull_quote    one sentence from the piece
--   syndication   true for a copy of a report on another site; listed, not counted
-- posts gains
--   format        one of the eight Insights formats, or null
--
-- RLS and grants are untouched: the existing policies and table grants are
-- per table, not per column, so the new columns inherit them (public read;
-- admin write).
-- =====================================================================

alter table olivia_energy.publications
  add column if not exists kind text not null default 'journal';
alter table olivia_energy.publications
  add column if not exists published_on date;
alter table olivia_energy.publications
  add column if not exists topics text[] not null default '{}';
alter table olivia_energy.publications
  add column if not exists pull_quote text;
alter table olivia_energy.publications
  add column if not exists syndication boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'publications_kind_check'
      and conrelid = 'olivia_energy.publications'::regclass
  ) then
    alter table olivia_energy.publications
      add constraint publications_kind_check
      check (kind in ('journal', 'op-ed', 'mention', 'report', 'talk'));
  end if;
end
$$;

comment on column olivia_energy.publications.kind is
  'journal (default), op-ed, mention, report or talk. Journals list on Research; op-eds and mentions are the founder''s commentary.';
comment on column olivia_energy.publications.published_on is
  'Full publication date; used to order commentary newest first.';
comment on column olivia_energy.publications.topics is
  'Topic chips for an op-ed: Dangote Refinery, Energy security, Energy transition, Downstream, Oil and gas, Power, Climate and ESG, Policy, Economy.';
comment on column olivia_energy.publications.pull_quote is
  'One sentence from the piece, shown on the commentary cards.';
comment on column olivia_energy.publications.syndication is
  'True for a copy of a BusinessDay report on another site. Listed, not counted.';

create index if not exists publications_kind_published_on_idx
  on olivia_energy.publications (kind, published_on desc);

alter table olivia_energy.posts
  add column if not exists format text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'posts_format_check'
      and conrelid = 'olivia_energy.posts'::regclass
  ) then
    alter table olivia_energy.posts
      add constraint posts_format_check
      check (
        format is null or format in (
          'energy-transition-briefing',
          'downstream-market-outlook',
          'african-energy-outlook',
          'esg-insight',
          'policy-brief',
          'executive-commentary',
          'research-paper',
          'webinar-podcast'
        )
      );
  end if;
end
$$;

comment on column olivia_energy.posts.format is
  'Insights format, or null. Mirrors POST_FORMAT_LABELS in src/lib/supabase/types.ts.';

-- Tell PostgREST about the new columns (a no-op where nothing listens).
notify pgrst, 'reload schema';
