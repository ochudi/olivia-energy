"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getPublicSupabaseEnv } from "./env";

/**
 * Browser client (anon key + the user's session cookie). Use in Client
 * Components only: sign-in forms, the admin editor, uploads. `@supabase/ssr`
 * returns one shared instance per page.
 */
export function createBrowserSupabase() {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}
