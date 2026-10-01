import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getPublicSupabaseEnv } from "./env";

/**
 * Server client bound to the request's auth cookies. Use in Server
 * Components, Server Actions and Route Handlers that act as the signed-in
 * user (admin pages). Reads are subject to RLS.
 *
 * Not for the public site: it touches `cookies()`, which opts the route out
 * of static rendering. Public pages use queries.ts instead.
 */
export async function createServerSupabase() {
  // Read cookies first: it marks the route dynamic before any env check
  // can throw during a build.
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();
  return createServerClient<Database>(url, anonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy/middleware refreshes sessions; nothing to do here.
        }
      },
    },
  });
}
