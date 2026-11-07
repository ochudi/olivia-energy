/**
 * Builds the founder's commentary data from one source file, so the static
 * fallback and the database seed can never disagree:
 *
 *   src/content/commentary.ts          OPEDS, MENTIONS, OPED_TOPICS, isEnergyOpEd
 *   supabase/seeds/commentary.sql      the same rows as idempotent inserts
 *
 *   node scripts/build-commentary.mjs [--source path/to/opeds.json] [--check]
 *
 * The default source is supabase/seeds/source/commentary.json, the verified
 * research list trimmed to the fields used here (the full research file also
 * holds editorial notes). The same selection rules apply to either file:
 *
 *   authored   every row with founder_role "author" (op-eds in BusinessDay)
 *   mentions   BusinessDay reports that quote him, plus the one syndicated
 *              copy of a BusinessDay report (Parrot Nigeria,
 *              syndication: true)
 *   excluded   the Clinton School pages (a student placement, not
 *              commentary) and the Conquest Magazine webinar report (not
 *              energy; not written by him)
 *
 * Titles, summaries and pull quotes are copied verbatim. The slug is the
 * last segment of the URL path. Run `npm run db:hosted-sql` afterwards: the
 * hosted paste files embed the seed.
 *
 * --check exits 1 when either output differs from what the source produces.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const sourceArg = args.indexOf("--source");
const sourcePath =
  sourceArg >= 0
    ? path.resolve(args[sourceArg + 1])
    : path.join(root, "supabase/seeds/source/commentary.json");
const check = args.includes("--check");

const TS_OUT = path.join(root, "src/content/commentary.ts");
const SQL_OUT = path.join(root, "supabase/seeds/commentary.sql");

/** Mirrors OpEdTopic in src/types/contracts.ts. */
const TOPICS = [
  "Dangote Refinery",
  "Energy security",
  "Energy transition",
  "Downstream",
  "Oil and gas",
  "Power",
  "Climate and ESG",
  "Policy",
  "Economy",
];

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

function slugFromUrl(url) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);
  const last = decodeURIComponent(segments.at(-1) ?? "");
  return last
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "BusinessDay (BusinessDay Pro)" -> "BusinessDay". Pro is a section of the same outlet. */
function outletName(raw) {
  return raw.replace(/\s*\(.*\)\s*$/, "").trim();
}

function requireTopics(row) {
  for (const topic of row.topics) {
    if (!TOPICS.includes(topic)) {
      throw new Error(`Unknown topic "${topic}" on ${row.url}`);
    }
  }
  return row.topics;
}

const byNewest = (a, b) =>
  b.publishedOn.localeCompare(a.publishedOn) ||
  Number(a.syndication ?? false) - Number(b.syndication ?? false) ||
  a.title.localeCompare(b.title);

const opeds = source.authored
  .filter((row) => row.founder_role === "author")
  .map((row) => ({
    slug: slugFromUrl(row.url),
    title: row.title,
    outlet: outletName(row.outlet),
    url: row.url,
    publishedOn: row.published,
    topics: requireTopics(row),
    summary: row.summary,
    ...(row.pull_quote ? { pullQuote: row.pull_quote } : {}),
  }))
  .sort(byNewest);

const mentionRows = source.mentions.filter((row) => {
  const outlet = outletName(row.outlet);
  const syndication = /syndicat/i.test(row.outlet);
  const businessday = /^businessday$/i.test(outlet);
  const parrot = /^parrot nigeria$/i.test(outlet) && syndication;
  return row.founder_role === "quoted" && (businessday || parrot);
});

const mentions = mentionRows
  .map((row) => ({
    title: row.title,
    outlet: outletName(row.outlet),
    url: row.url,
    publishedOn: row.published,
    syndication: /syndicat/i.test(row.outlet),
    // Database-only detail, not part of the Mention type.
    _row: { ...row, topics: requireTopics(row) },
  }))
  .sort(byNewest);

if (opeds.length !== 11)
  throw new Error(`Expected 11 op-eds, got ${opeds.length}`);
if (mentions.length !== 13)
  throw new Error(`Expected 13 mentions, got ${mentions.length}`);
if (mentions.filter((m) => m.syndication).length !== 1) {
  throw new Error("Expected exactly one syndicated mention");
}
const urls = new Set([...opeds, ...mentions].map((r) => r.url));
if (urls.size !== opeds.length + mentions.length)
  throw new Error("Duplicate URL in source");
const slugs = new Set(opeds.map((o) => o.slug));
if (slugs.size !== opeds.length) throw new Error("Duplicate op-ed slug");

/* ------------------------------------------------------------------ */
/* src/content/commentary.ts                                           */
/* ------------------------------------------------------------------ */

const publicMentions = mentions.map((mention) => ({
  title: mention.title,
  outlet: mention.outlet,
  url: mention.url,
  publishedOn: mention.publishedOn,
  syndication: mention.syndication,
}));

const tsSource = `/**
 * The founder's commentary: his BusinessDay op-eds and the BusinessDay reports
 * that quote him. GENERATED by scripts/build-commentary.mjs from
 * supabase/seeds/source/commentary.json; edit that file and re-run
 * \`node scripts/build-commentary.mjs\`, not this one.
 *
 * This is the static fallback. The site reads the same rows from the
 * database (src/lib/supabase/queries.ts) and falls back to these when the
 * database is unconfigured, unreachable, not yet migrated, or empty.
 * supabase/seeds/commentary.sql holds the identical rows.
 */
import type { Mention, OpEd, OpEdTopic } from "@/types/contracts";

/** Op-eds written by Dr Olugbenga Olaoye, newest first. */
export const OPEDS: readonly OpEd[] = ${JSON.stringify(opeds, null, 2)};

/**
 * BusinessDay reports that quote him, newest first, and one syndicated copy
 * of such a report (syndication: true), which is listed but not counted.
 */
export const MENTIONS: readonly Mention[] = ${JSON.stringify(publicMentions, null, 2)};

/** Every topic an op-ed can carry, in the order the topic chips list them. */
export const OPED_TOPICS: readonly OpEdTopic[] = ${JSON.stringify(TOPICS, null, 2)};

/** False when every topic is Policy or Economy: commentary outside energy. */
export function isEnergyOpEd(oped: OpEd): boolean {
  return oped.topics.some((topic) => topic !== "Policy" && topic !== "Economy");
}
`;

/* ------------------------------------------------------------------ */
/* supabase/seeds/commentary.sql                                       */
/* ------------------------------------------------------------------ */

const q = (text) => `'${text.replaceAll("'", "''")}'`;
const textOrNull = (text) => (text ? `${q(text)}::text` : "null::text");
const textArray = (items) =>
  items.length ? `array[${items.map(q).join(", ")}]::text[]` : "'{}'::text[]";

function sqlRow({
  kind,
  title,
  authors,
  outlet,
  url,
  publishedOn,
  topics,
  summary,
  pullQuote,
  syndication,
}) {
  return `    (
      ${q(kind)}::text,
      ${q(title)}::text,
      ${textArray(authors)},
      ${q(outlet)}::text,
      ${Number(publishedOn.slice(0, 4))}::integer,
      date ${q(publishedOn)},
      ${q(url)}::text,
      ${textArray(topics)},
      ${textOrNull(summary)},
      ${textOrNull(pullQuote)},
      ${syndication}::boolean
    )`;
}

const rows = [
  ...opeds.map((o) =>
    sqlRow({
      kind: "op-ed",
      title: o.title,
      authors: ["Olugbenga Olaoye"],
      outlet: o.outlet,
      url: o.url,
      publishedOn: o.publishedOn,
      topics: o.topics,
      summary: o.summary,
      pullQuote: o.pullQuote,
      syndication: false,
    }),
  ),
  ...mentions.map((m) =>
    sqlRow({
      kind: "mention",
      title: m.title,
      authors: m._row.byline ? [m._row.byline] : [],
      outlet: m.outlet,
      url: m.url,
      publishedOn: m.publishedOn,
      topics: m._row.topics,
      summary: m._row.summary,
      pullQuote: m._row.pull_quote,
      syndication: m.syndication,
    }),
  ),
];

const sqlSource = `-- =====================================================================
-- Commentary — Dr Olugbenga Olaoye's BusinessDay op-eds (kind 'op-ed',
-- ${opeds.length} rows) and the BusinessDay reports that quote him (kind 'mention',
-- ${mentions.length} rows, one of them a syndicated copy). GENERATED by
-- scripts/build-commentary.mjs from supabase/seeds/source/commentary.json;
-- edit that file and re-run the script, not this one.
--
-- Runs on \`supabase db reset\` (via config.toml sql_paths, after the
-- migration that adds the columns used here) and can be run by hand:
--   psql "$DATABASE_URL" -f supabase/seeds/commentary.sql
-- Idempotent: a row is inserted only if no publication already has its URL,
-- so re-running it never duplicates a row or overwrites an admin's edits.
--
-- Titles, summaries and pull quotes are copied verbatim from the published
-- pages (checked 2 October 2026). For an op-ed, authors holds the author
-- named in the closing note of the piece (the page byline is the BusinessDay
-- house account); for a mention it holds the reporter's byline. Mentions
-- carry the topics and summary of the report and, in pull_quote, the passage
-- that names him.
--
-- Not included: two Clinton School of Public Service pages (a student
-- placement list, not commentary) and a Conquest Magazine report of a
-- webinar (not energy commentary; not written by him).
-- =====================================================================

insert into olivia_energy.publications
  (kind, title, authors, venue, year, published_on, url, topics, summary, pull_quote, syndication)
select v.kind, v.title, v.authors, v.venue, v.year, v.published_on, v.url, v.topics, v.summary, v.pull_quote, v.syndication
from (
  values
${rows.join(",\n")}
) as v(kind, title, authors, venue, year, published_on, url, topics, summary, pull_quote, syndication)
where not exists (
  select 1 from olivia_energy.publications p where p.url = v.url
);
`;

/* ------------------------------------------------------------------ */

async function formatTs(code) {
  try {
    const prettier = await import("prettier");
    const options = (await prettier.resolveConfig(TS_OUT)) ?? {};
    return await prettier.format(code, { ...options, filepath: TS_OUT });
  } catch {
    return code;
  }
}

const tsFinal = await formatTs(tsSource);

if (check) {
  const stale = [];
  if (!fs.existsSync(TS_OUT) || fs.readFileSync(TS_OUT, "utf8") !== tsFinal)
    stale.push("src/content/commentary.ts");
  if (!fs.existsSync(SQL_OUT) || fs.readFileSync(SQL_OUT, "utf8") !== sqlSource)
    stale.push("supabase/seeds/commentary.sql");
  if (stale.length) {
    console.error(
      `Out of date: ${stale.join(", ")}. Run node scripts/build-commentary.mjs.`,
    );
    process.exit(1);
  }
  console.log("Commentary outputs are up to date.");
} else {
  fs.writeFileSync(TS_OUT, tsFinal);
  fs.writeFileSync(SQL_OUT, sqlSource);
  console.log(
    `Wrote src/content/commentary.ts and supabase/seeds/commentary.sql (${opeds.length} op-eds, ${mentions.length} mentions).`,
  );
}
