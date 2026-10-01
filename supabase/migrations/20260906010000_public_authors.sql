-- =====================================================================
-- Public author names for bylines.
--
-- profiles is closed to the public. This view exposes only id and
-- full_name, and only for users who have at least one published post. It
-- deliberately runs with its owner's rights (security_invoker = false) so
-- the anonymous role can read it while profiles itself stays closed; the
-- Supabase linter flags that pattern, and here it is the intent.
-- =====================================================================
create view public.authors
with (security_invoker = false)
as
  select p.id, p.full_name
  from public.profiles p
  where exists (
    select 1
    from public.posts x
    where x.author_id = p.id
      and x.status = 'published'
      and x.published_at <= now()
  );

comment on view public.authors is
  'Bylines: id and full_name of profiles with a published post. Owner-rights view so anon can read it; profiles stays closed.';

grant select on public.authors to anon, authenticated;
