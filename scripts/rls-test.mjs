/**
 * RLS proof. Runs against a Supabase project with the anon key (what the
 * public site and browser use) and checks that every policy in
 * supabase/migrations behaves as documented. Fixtures are created and
 * removed with the service-role key; an admin and an editor user are
 * created in Auth for the authenticated checks.
 *
 *   npm run db:test            # local stack (reads `supabase status`)
 *   node scripts/rls-test.mjs  # any project via env:
 *     NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *     SUPABASE_SERVICE_ROLE_KEY
 *
 * Exits non-zero if any check fails. Safe to re-run: fixtures are keyed
 * by known slugs / emails and cleaned up at the end.
 */
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

function localEnv() {
  const out = execSync("supabase status -o env", { encoding: "utf8" });
  const env = Object.fromEntries(
    out
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [
          l.slice(0, i).trim(),
          l
            .slice(i + 1)
            .trim()
            .replace(/^"|"$/g, ""),
        ];
      }),
  );
  return {
    url: env.API_URL,
    anonKey: env.ANON_KEY ?? env.PUBLISHABLE_KEY,
    serviceKey: env.SERVICE_ROLE_KEY ?? env.SECRET_KEY,
  };
}

const cfg = process.argv.includes("--local")
  ? localEnv()
  : {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
if (!cfg.url || !cfg.anonKey || !cfg.serviceKey) {
  console.error("Missing Supabase URL / anon key / service-role key.");
  process.exit(2);
}

const noSession = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const service = createClient(cfg.url, cfg.serviceKey, noSession);
const anon = createClient(cfg.url, cfg.anonKey, noSession);

const FX = {
  published: "rls-test-published",
  draft: "rls-test-draft",
  scheduled: "rls-test-scheduled",
  adminEmail: "rls-admin@example.com",
  editorEmail: "rls-editor@example.com",
  password: "rls-test-password-1234",
  messageEmail: "rls-test@example.com",
  object: "rls-test/upload.png",
};

// The media bucket allows images and PDFs only, so fixtures are a 1×1 PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
const png = () => new Blob([PNG], { type: "image/png" });
const PNG_OPTS = { contentType: "image/png", upsert: true };

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`,
  );
}
const codeOf = (error) =>
  error ? `${error.code ?? ""} ${error.message ?? ""}`.trim() : "no error";
const isDenied = (error) =>
  !!error &&
  (error.code === "42501" ||
    /permission denied|row-level security|not authorized|Unauthorized/i.test(
      error.message ?? "",
    ));

async function ensureUser(email, role) {
  const { data: list } = await service.auth.admin.listUsers({ perPage: 1000 });
  for (const u of list?.users ?? [])
    if (u.email === email) await service.auth.admin.deleteUser(u.id);
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: FX.password,
    email_confirm: true,
  });
  if (error) throw error;
  const { error: roleError } = await service
    .from("profiles")
    .update({ role })
    .eq("id", data.user.id);
  if (roleError) throw roleError;
  return data.user;
}

async function signIn(email) {
  const client = createClient(cfg.url, cfg.anonKey, noSession);
  const { error } = await client.auth.signInWithPassword({
    email,
    password: FX.password,
  });
  if (error) throw error;
  return client;
}

async function cleanup() {
  await service
    .from("posts")
    .delete()
    .in("slug", [
      FX.published,
      FX.draft,
      FX.scheduled,
      "rls-test-admin-insert",
      "rls-test-anon-insert",
      "rls-test-editor-insert",
    ]);
  await service.from("contact_messages").delete().eq("email", FX.messageEmail);
  await service.from("settings").delete().eq("key", "rls_test");
  await service.storage
    .from("media")
    .remove([FX.object, "rls-test/anon.png", "rls-test/admin.png"]);
  const { data: list } = await service.auth.admin.listUsers({ perPage: 1000 });
  for (const u of list?.users ?? [])
    if ([FX.adminEmail, FX.editorEmail].includes(u.email))
      await service.auth.admin.deleteUser(u.id);
}

try {
  // ---------------------------------------------------------------- fixtures
  await cleanup();
  const inFuture = new Date(Date.now() + 7 * 86400e3).toISOString();
  const { error: fxError } = await service.from("posts").insert([
    {
      slug: FX.published,
      title: "RLS published",
      category: "research-notes",
      status: "published",
    },
    {
      slug: FX.draft,
      title: "RLS draft",
      category: "research-notes",
      status: "draft",
    },
    {
      slug: FX.scheduled,
      title: "RLS scheduled",
      category: "research-notes",
      status: "published",
      published_at: inFuture,
    },
  ]);
  if (fxError) throw fxError;
  const { error: msgError } = await service.from("contact_messages").insert({
    name: "RLS fixture",
    email: FX.messageEmail,
    message: "fixture",
  });
  if (msgError) throw msgError;
  const admin = await ensureUser(FX.adminEmail, "admin");
  await ensureUser(FX.editorEmail, "editor");
  const { data: adminProfile } = await service
    .from("profiles")
    .select("role")
    .eq("id", admin.id)
    .single();
  check(
    "trigger: profile auto-created for new Auth user with role",
    adminProfile?.role === "admin",
    `role=${adminProfile?.role}`,
  );

  // ------------------------------------------------------------------- anon
  console.log("\n— anon key —");
  {
    const { data, error } = await anon
      .from("posts")
      .select("slug, status, published_at");
    const slugs = (data ?? []).map((r) => r.slug);
    check("anon: select posts succeeds", !error, codeOf(error));
    check("anon: sees the published post", slugs.includes(FX.published));
    check("anon: does not see the draft", !slugs.includes(FX.draft));
    check(
      "anon: does not see the scheduled (future) post",
      !slugs.includes(FX.scheduled),
    );
    check(
      "anon: every visible post is published",
      (data ?? []).every((r) => r.status === "published"),
    );
  }
  {
    const { data, error } = await anon
      .from("posts")
      .select("*")
      .eq("slug", FX.draft)
      .maybeSingle();
    check(
      "anon: draft by slug returns nothing",
      !error && data === null,
      codeOf(error),
    );
  }
  {
    const { error } = await anon.from("contact_messages").select("*");
    check(
      "anon: select contact_messages FAILS",
      isDenied(error),
      codeOf(error),
    );
  }
  {
    // Since the launch-hardening migration the public key cannot write to
    // the inbox at all; the contact form inserts with the service role after
    // Turnstile has verified the sender.
    const { error } = await anon.from("contact_messages").insert({
      name: "Anon",
      email: FX.messageEmail,
      organization: "Test",
      message: "Hello from anon",
    });
    check(
      "anon: insert contact_messages FAILS",
      isDenied(error),
      codeOf(error),
    );
  }
  {
    // The rate-limit trigger runs for every role, the service role included.
    // One message from this address already exists (the fixture); the second
    // and third pass and the fourth trips the trigger.
    const send = (message) =>
      service.from("contact_messages").insert({
        name: "Service",
        email: FX.messageEmail.toUpperCase(),
        message,
      });
    const second = await send("second message");
    const third = await send("third message");
    const fourth = await send("fourth message");
    check(
      "service: second and third messages in an hour succeed",
      !second.error && !third.error,
      codeOf(second.error ?? third.error),
    );
    check(
      "service: fourth message from one address in an hour FAILS with PT429",
      fourth.error?.code === "PT429",
      codeOf(fourth.error),
    );
  }
  {
    const { error } = await service
      .from("contact_messages")
      .insert({ name: "Service", email: "not-an-email", message: "x" });
    check(
      "service: insert with invalid email FAILS (check constraint)",
      !!error && error.code === "23514",
      codeOf(error),
    );
  }
  {
    const { error } = await anon
      .from("contact_messages")
      .update({ read: true })
      .eq("email", FX.messageEmail);
    check(
      "anon: update contact_messages FAILS",
      isDenied(error),
      codeOf(error),
    );
  }
  {
    const { error } = await anon
      .from("posts")
      .insert({ slug: "rls-test-anon-insert", title: "x", category: "power" });
    check("anon: insert posts FAILS", isDenied(error), codeOf(error));
  }
  {
    const { error } = await anon
      .from("posts")
      .update({ title: "hacked" })
      .eq("slug", FX.published);
    check("anon: update posts FAILS", isDenied(error), codeOf(error));
  }
  {
    const { data, error } = await anon.from("publications").select("id");
    check(
      "anon: select publications succeeds",
      !error && Array.isArray(data),
      codeOf(error),
    );
  }
  {
    const { data, error } = await anon.from("settings").select("key, value");
    check(
      "anon: select settings succeeds",
      !error && Array.isArray(data),
      codeOf(error) || `${data?.length} keys`,
    );
  }
  {
    const { error } = await anon
      .from("settings")
      .upsert({ key: "rls_test", value: 1 });
    check("anon: write settings FAILS", isDenied(error), codeOf(error));
  }
  {
    const { error } = await anon.from("profiles").select("*");
    check("anon: select profiles FAILS", isDenied(error), codeOf(error));
  }
  {
    const { error } = await anon.rpc("is_admin");
    check("anon: is_admin() callable and false", !error, codeOf(error));
  }
  {
    const { error } = await anon.storage
      .from("media")
      .upload("rls-test/anon.png", png(), PNG_OPTS);
    check("anon: storage upload to media FAILS", !!error, codeOf(error));
  }
  {
    const { error } = await anon.storage.from("media").list("rls-test");
    check(
      "anon: storage list media succeeds (public read)",
      !error,
      codeOf(error),
    );
  }

  // ------------------------------------------------------- authenticated editor
  console.log("\n— authenticated, role editor —");
  const editor = await signIn(FX.editorEmail);
  {
    const { data, error } = await editor.from("contact_messages").select("id");
    check(
      "editor: select contact_messages returns no rows",
      !error && (data ?? []).length === 0,
      codeOf(error) || `${data?.length} rows`,
    );
  }
  {
    const { error } = await editor.from("posts").insert({
      slug: "rls-test-editor-insert",
      title: "x",
      category: "power",
    });
    check("editor: insert posts FAILS", isDenied(error), codeOf(error));
  }
  {
    const { data } = await editor.from("posts").select("slug");
    check(
      "editor: does not see drafts",
      !(data ?? []).some((r) => r.slug === FX.draft),
    );
  }
  {
    const { data, error } = await editor.from("profiles").select("id, role");
    check(
      "editor: sees only own profile",
      !error && (data ?? []).length === 1 && data[0].role === "editor",
      codeOf(error) || `${data?.length} rows`,
    );
  }
  {
    const { error } = await editor
      .from("profiles")
      .update({ role: "admin" })
      .eq("email", FX.editorEmail);
    const { data } = await service
      .from("profiles")
      .select("role")
      .eq("email", FX.editorEmail)
      .single();
    check(
      "editor: cannot promote self to admin",
      data?.role === "editor",
      codeOf(error) || `role now ${data?.role}`,
    );
  }
  {
    const { error } = await editor.storage
      .from("media")
      .upload("rls-test/anon.png", png(), PNG_OPTS);
    check("editor: storage upload FAILS", !!error, codeOf(error));
  }

  // -------------------------------------------------------- authenticated admin
  console.log("\n— authenticated, role admin —");
  const adminClient = await signIn(FX.adminEmail);
  {
    const { data, error } = await adminClient
      .from("contact_messages")
      .select("id, email");
    check(
      "admin: select contact_messages returns rows",
      !error && (data ?? []).some((r) => r.email === FX.messageEmail),
      codeOf(error) || `${data?.length} rows`,
    );
  }
  {
    const { data, error } = await adminClient.from("posts").select("slug");
    check(
      "admin: sees drafts",
      !error && (data ?? []).some((r) => r.slug === FX.draft),
      codeOf(error),
    );
  }
  {
    const { data, error } = await adminClient
      .from("posts")
      .insert({
        slug: "rls-test-admin-insert",
        title: "Admin insert",
        category: "power",
        status: "published",
        author_id: admin.id,
      })
      .select("published_at, author_id")
      .single();
    check(
      "admin: insert posts succeeds and published_at is stamped",
      !error && !!data?.published_at,
      codeOf(error),
    );
  }
  {
    const { error } = await adminClient
      .from("contact_messages")
      .update({ read: true })
      .eq("email", FX.messageEmail);
    check("admin: mark contact message read succeeds", !error, codeOf(error));
  }
  {
    const { error } = await adminClient
      .from("settings")
      .upsert({ key: "rls_test", value: { ok: true } });
    check("admin: write settings succeeds", !error, codeOf(error));
  }
  {
    const { data, error } = await adminClient.from("profiles").select("id");
    check(
      "admin: sees all profiles",
      !error && (data ?? []).length >= 2,
      codeOf(error) || `${data?.length} rows`,
    );
  }
  {
    const { error } = await adminClient.storage
      .from("media")
      .upload("rls-test/admin.png", png(), PNG_OPTS);
    check("admin: storage upload to media succeeds", !error, codeOf(error));
    const res = await fetch(
      `${cfg.url}/storage/v1/object/public/media/rls-test/admin.png`,
    );
    check(
      "public: media object readable without a key",
      res.ok,
      `HTTP ${res.status}`,
    );
    const { error: delError } = await adminClient.storage
      .from("media")
      .remove(["rls-test/admin.png"]);
    check("admin: storage delete succeeds", !delError, codeOf(delError));
  }
  {
    const { data, error } = await adminClient.rpc("is_admin");
    check("admin: is_admin() is true", !error && data === true, codeOf(error));
  }
} catch (e) {
  console.error("\nTest harness error:", e);
  process.exitCode = 2;
} finally {
  await cleanup();
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`,
);
if (failed.length) process.exitCode = 1;
