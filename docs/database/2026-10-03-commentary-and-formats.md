# Database update, 3 October 2026: commentary and formats

The rebuilt site lists Dr Olugbenga Olaoye's BusinessDay op-eds and the
BusinessDay reports that quote him beside his journal articles, and labels
each Insights article with one of eight formats. This update adds the columns
and rows for that. It is additive: nothing is dropped, renamed or relaxed, and
it touches only the `olivia_energy` schema.

The site works before and after the update. Until it is pasted, the pages
show the same op-eds and mentions from `src/content/commentary.ts`, and
Insights shows no format labels.

## What changes

| Table          | New column     | Meaning                                                                                                                                          |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `publications` | `kind`         | `journal` (default; every existing row), `op-ed`, `mention`, `report`, `talk`                                                                    |
| `publications` | `published_on` | Full publication date. Commentary is ordered by it; journals keep using `year`                                                                   |
| `publications` | `topics`       | Topic chips for an op-ed: Dangote Refinery, Energy security, Energy transition, Downstream, Oil and gas, Power, Climate and ESG, Policy, Economy |
| `publications` | `pull_quote`   | One sentence from the piece                                                                                                                      |
| `publications` | `syndication`  | True for a copy of a BusinessDay report on another site. Listed, not counted                                                                     |
| `posts`        | `format`       | One of the eight Insights formats, or empty                                                                                                      |

Also one index (`publications_kind_published_on_idx`) and two check
constraints (`publications_kind_check`, `posts_format_check`). Row-level
security and grants are per table, so the new columns inherit them: the public
reads, admins write.

`syndication` is one column more than the original plan. It is how the one
syndicated copy (Parrot Nigeria, which republishes BusinessDay's report of 27
March 2026) stays listed without being counted as a second report.

The update inserts 24 rows: the 11 op-eds and 13 mentions (12 BusinessDay
reports and the Parrot Nigeria copy). A row is inserted only if no publication
already has its URL, so running it again adds nothing and never overwrites an
edit made in Admin. Left out on purpose: two Clinton School of Public Service
pages (a student placement list) and a Conquest Magazine report of a webinar
(not energy commentary, not written by him).

## Paste order

On the hosted project, which already ran `supabase/hosted-setup.sql`:

1. Supabase dashboard, SQL Editor, New query.
2. Paste the whole of `supabase/hosted-updates/2026-10-03-commentary-and-formats.sql`
   and Run. It runs in one transaction, and the last statement prints the
   check below. It is safe to run twice.
3. No change under Project Settings, Data API: the schema is already exposed.
   The file ends its migration with `notify pgrst, 'reload schema'`, so the
   Data API sees the new columns at once.
4. Either wait up to an hour for the site's data cache, or purge it now:
   `POST /api/revalidate` with `Authorization: Bearer <REVALIDATE_SECRET>` and
   the body `{"table":"publications"}`, then again with `{"table":"posts"}`.
   Saving anything in Admin purges the cache too.

A new project instead takes `supabase/hosted-setup.sql` alone (it already
contains this update's migration and seed, and refuses to run twice).

## Check

```sql
select kind, count(*) from olivia_energy.publications group by kind order by kind;
```

Expected:

| kind    | count |
| ------- | ----- |
| journal | 9     |
| mention | 13    |
| op-ed   | 11    |

A project where the update has not run yet fails this query with
`column "kind" does not exist`.

## Undoing

There is nothing to undo: the columns are additive and harmless if unused. To
take a piece off the site, delete its row in Admin, Publications. The site
falls back to the built-in list only when the database returns none at all, so
deleting some rows removes them from the site.

## How the site reads it

`src/lib/supabase/queries.ts` (cache tags `publications` and `posts`):

- `getOpEds()`, `getLatestOpEd()`: rows with `kind = 'op-ed'`, newest first.
- `getMentions()`: rows with `kind = 'mention'`, newest first.
- `getJournalArticles()` and `getPublications()`: rows whose `kind` is
  `journal` (or empty, on a database without the column).
- `getCommentaryCounts()`: op-eds, BusinessDay reports (syndications excluded),
  journal articles, and the first and last op-ed dates.
- `getFormatCounts()`: published posts per format; `{}` while the column is
  missing.

None of the commentary reads throws. A query error (missing column, PostgREST
schema cache, network), no rows and an unconfigured Supabase all give the
static data in `src/content/commentary.ts`. `getPublications()` keeps the old
behaviour of failing loudly when a configured database is unreachable.

## Admin fields (for the admin screens)

- Publications: Kind (select), Published on (date), Topics (multi-select from the
  nine), Pull quote, Syndicated copy (checkbox, shown for mentions). Titles of
  op-eds are kept as published. Op-ed rows use the outlet as `venue`, `year` from
  the date, and `authors` as the author named in the closing note.
- Posts: Format (select: none, or one of the eight).

## Changing the data

The op-ed and mention lists come from one source file,
`supabase/seeds/source/commentary.json`. After editing it:

```
node scripts/build-commentary.mjs     # rewrites src/content/commentary.ts and supabase/seeds/commentary.sql
npm run db:hosted-sql                 # rewrites supabase/hosted-setup.sql and the hosted update
```

`node scripts/build-commentary.mjs --check` and
`node scripts/hosted-sql.mjs --check` exit 1 when an output is stale.

## The tagline

`supabase/seed.sql` now carries "Powering the transition. Inspiring sustainable
futures." for new projects. The live project keeps the row it has: this update
does not change it. Set it in Admin, Settings, when the new site goes live, or
paste this, which changes the row only while it still holds the old default:

```sql
update olivia_energy.settings
set value = '"Powering the transition. Inspiring sustainable futures."'::jsonb
where key = 'tagline'
  and value = '"Independent energy advisory, built on evidence."'::jsonb;
```
