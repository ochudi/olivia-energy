import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export type AdminSession = {
  userId: string;
  email: string | null;
  profile: Profile | null;
  isAdmin: boolean;
};

/**
 * The signed-in user and their profile, or null. Wrapped in React `cache()`
 * so the layout and every page that also calls `requireAdmin()` share one
 * lookup per request instead of hitting Supabase repeatedly.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
    isAdmin: profile?.role === "admin",
  };
});

/** For pages and layouts: redirects when there is no admin session. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!session.isAdmin) redirect("/admin/no-access");
  return session;
}

/** For server actions: throws when there is no admin session. */
export async function assertAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session?.isAdmin) throw new Error("Not authorised");
  return session;
}
