/**
 * Read-only check of a hosted project after supabase/hosted-setup.sql has
 * been run and the schema exposed. It reads with the public key (what the
 * site uses) and with the service-role key, and writes nothing, so it is
 * safe on a project shared with other applications.
 *
 *   node --env-file=.env.hosted scripts/check-hosted.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
 * SUPABASE_SERVICE_ROLE_KEY. Exits non-zero if any check fails.
 */
import { createClient } from "@supabase/supabase-js";

// Mirrors src/lib/supabase/schema.ts.
const DB_SCHEMA = "olivia_energy";
const MEDIA_BUCKET = "olivia-energy-media";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  console.error("Missing Supabase URL / public key / service-role key.");
  process.exit(2);
}

const options = {
  db: { schema: DB_SCHEMA },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const anon = createClient(url, anonKey, options);
const service = createClient(url, serviceKey, options);

let failed = 0;
function check(name, ok, detail = "") {
  if (!ok) failed += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`,
  );
}
const codeOf = (error) =>
  error ? `${error.code ?? ""} ${error.message ?? ""}`.trim() : "";
const isDenied = (error) =>
  !!error &&
  (error.code === "42501" || /permission denied/i.test(error.message ?? ""));

const first = await anon.from("settings").select("key");
if (first.error?.code === "PGRST106") {
  console.error(
    `FAIL  the ${DB_SCHEMA} schema is not exposed. Supabase dashboard → Project Settings → Data API → Exposed schemas → add ${DB_SCHEMA}, save, then run this again.`,
  );
  process.exit(1);
}
check(
  "public key reads settings",
  !first.error && first.data.length > 0,
  codeOf(first.error) || `${first.data?.length} keys`,
);
{
  const { data, error } = await anon.from("publications").select("id");
  check(
    "public key reads publications",
    !error && data.length > 0,
    codeOf(error) || `${data?.length} rows`,
  );
}
{
  const { data, error } = await anon.from("posts").select("slug, status");
  check(
    "public key reads published articles only",
    !error && data.length > 0 && data.every((p) => p.status === "published"),
    codeOf(error) || `${data?.length} rows`,
  );
}
{
  const { error } = await anon.from("contact_messages").select("id").limit(1);
  check("public key cannot read the inbox", isDenied(error), codeOf(error));
}
{
  const { error } = await anon.from("profiles").select("id").limit(1);
  check("public key cannot read profiles", isDenied(error), codeOf(error));
}
{
  const { error } = await anon.rpc("tiptap_text", { node: {} });
  check(
    "public key cannot call the helper functions",
    isDenied(error),
    codeOf(error),
  );
}
{
  const { error, count } = await service
    .from("contact_messages")
    .select("id", { count: "exact", head: true });
  check(
    "service role reads the inbox",
    !error,
    codeOf(error) || `${count} messages`,
  );
}
{
  const { data, error } = await service.storage.getBucket(MEDIA_BUCKET);
  check(
    `storage bucket ${MEDIA_BUCKET} exists and is public`,
    !error && data?.public === true,
    codeOf(error),
  );
}
{
  const { data, error } = await service
    .from("profiles")
    .select("email")
    .eq("role", "admin");
  check(
    "at least one admin exists",
    !error && data.length > 0,
    codeOf(error) ||
      (data?.length
        ? data.map((p) => p.email).join(", ")
        : "none yet: node --env-file=.env.hosted scripts/create-admin.mjs <email> '<password>'"),
  );
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
if (failed) process.exitCode = 1;
