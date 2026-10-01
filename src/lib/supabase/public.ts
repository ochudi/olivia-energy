import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getPublicSupabaseEnv } from "./env";
import { DB_SCHEMA } from "./schema";

let client: SupabaseClient<Database> | null = null;

/**
 * Anonymous client with no session and no cookies. This is what the public
 * site reads through: it sees exactly what RLS grants `anon` (published
 * posts, publications, settings), and it is safe inside `unstable_cache`.
 */
export function getPublicSupabase(): SupabaseClient<Database> {
  if (client) return client;
  const { url, anonKey } = getPublicSupabaseEnv();
  client = createClient<Database>(url, anonKey, {
    db: { schema: DB_SCHEMA },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
