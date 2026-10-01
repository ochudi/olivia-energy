"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";

function bump(): void {
  revalidatePath("/admin/inbox");
  revalidatePath("/admin", "layout");
}

export async function markMessage(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "true";
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("contact_messages")
    .update({ read })
    .eq("id", id);
  if (error) throw new Error(error.message);
  bump();
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  bump();
}
