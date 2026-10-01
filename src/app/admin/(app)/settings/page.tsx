import type { Metadata } from "next";
import { Notice, PageHeader } from "@/components/admin";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { parseSettings } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Settings" };

export default async function Page() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("settings").select("key, value");
  const settings = parseSettings(data ?? []);
  return (
    <>
      <PageHeader
        title="Settings"
        description="Site-wide details: footer, social links, contact points and the homepage figures."
      />
      {error ? (
        <Notice tone="error" className="mb-4">
          {error.message}
        </Notice>
      ) : null}
      <SettingsForm initial={settings} />
    </>
  );
}
