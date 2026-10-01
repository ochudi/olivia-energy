import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";

/** Every screen in here needs an admin session; the shell shows who it is. */
export default async function AdminAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();
  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("read", false);
  return (
    <AdminShell email={session.email} unread={count ?? 0}>
      {children}
    </AdminShell>
  );
}
