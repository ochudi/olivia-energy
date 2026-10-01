import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getPublicSupabaseEnv, getServiceRoleKey } from "./env";
import { DB_SCHEMA } from "./schema";

let client: SupabaseClient<Database> | null = null;

/**
 * Service-role client. Bypasses RLS entirely, so it belongs only in trusted
 * server code: the contact-form handler after bot verification, admin user
 * management, migrations of content. The `server-only` import makes any
 * accidental client-side import a build error.
 */
export function getServiceSupabase(): SupabaseClient<Database> {
  if (client) return client;
  const { url } = getPublicSupabaseEnv();
  client = createClient<Database>(url, getServiceRoleKey(), {
    db: { schema: DB_SCHEMA },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
