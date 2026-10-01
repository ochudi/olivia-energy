"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/auth";
import type { Json } from "@/lib/supabase/database.types";
import { revalidateSettings } from "@/lib/supabase/revalidate";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  SETTINGS_KEYS,
  settingsSchema,
  type SiteSettings,
} from "@/lib/supabase/types";

export type SettingsResult =
  { ok: true; message: string } | { ok: false; message: string };

/** Validates the whole settings object, writes one row per key, purges the settings tag. */
export async function saveSettings(input: unknown): Promise<SettingsResult> {
  await assertAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      message: issue
        ? `${issue.path.join(".") || "settings"}: ${issue.message}`
        : "Check the form.",
    };
  }
  const values: SiteSettings = parsed.data;
  const supabase = await createServerSupabase();
  const rows = SETTINGS_KEYS.map((key) => ({
    key,
    value: values[key] as Json,
  }));
  const { error } = await supabase
    .from("settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, message: error.message };
  revalidateSettings();
  revalidatePath("/admin/settings");
  return {
    ok: true,
    message: "Saved. The site will show the new values on its next load.",
  };
}
