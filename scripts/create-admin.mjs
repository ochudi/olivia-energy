/**
 * Create (or promote) an admin user. Admin users live in Supabase Auth; the
 * profiles table holds the role that RLS checks. An account that already
 * exists in the project keeps its password and simply gains the role, unless
 * --set-password is passed, which replaces the password with the one given
 * (also the way back in for an admin who forgot theirs before email is set
 * up). On a project shared with other applications that person's password
 * changes for those too.
 *
 *   npm run admin:create -- admin@example.com 'a strong password'         # local stack
 *   node scripts/create-admin.mjs admin@example.com 'a strong password'   # env-configured project
 *   node --env-file=.env.hosted scripts/create-admin.mjs admin@example.com 'a strong password'
 *   node --env-file=.env.hosted scripts/create-admin.mjs admin@example.com 'a new password' --set-password
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or the local
 * stack's values when --local is passed. The service-role key never leaves
 * the machine running this script.
 */
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [email, password] = args;
if (!email) {
  console.error(
    "Usage: node scripts/create-admin.mjs <email> [password] [--local] [--set-password]",
  );
  process.exit(2);
}

let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (process.argv.includes("--local")) {
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
  url = env.API_URL;
  serviceKey = env.SERVICE_ROLE_KEY ?? env.SECRET_KEY;
}
if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or pass --local.",
  );
  process.exit(2);
}

// Mirrors DB_SCHEMA in src/lib/supabase/schema.ts.
const supabase = createClient(url, serviceKey, {
  db: { schema: "olivia_energy" },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// The project may hold other applications' users, so page through all of them.
let user;
for (let page = 1; !user; page += 1) {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page,
    perPage: 1000,
  });
  if (listError) throw listError;
  user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (list.users.length < 1000) break;
}

if (!user) {
  if (!password) {
    console.error("User does not exist; a password is required to create one.");
    process.exit(2);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  user = data.user;
  console.log(`Created Auth user ${email} (${user.id})`);
} else {
  console.log(
    `Auth user ${email} already exists (${user.id}): created ${user.created_at}, last sign-in ${user.last_sign_in_at ?? "never"}.`,
  );
  if (process.argv.includes("--set-password")) {
    if (!password) {
      console.error("--set-password needs the new password as an argument.");
      process.exit(2);
    }
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log("Password replaced with the one given.");
  } else {
    console.log(
      "Their existing password was kept. Pass --set-password to replace it.",
    );
  }
}

const { error: roleError } = await supabase
  .from("profiles")
  .upsert({ id: user.id, email: email.toLowerCase(), role: "admin" });
if (roleError) throw roleError;
console.log(`Profile role set to admin for ${email}`);
