"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { siteUrl } from "@/lib/seo/urls";
import { getServiceSupabase } from "@/lib/supabase/service";
import { PROFILE_ROLES, type ProfileRole } from "@/lib/supabase/types";
import type { ActionState } from "./types";

/** Invites an email address as an admin. Uses the service role: it creates the Auth user and sends the invite mail. */
export async function inviteAdmin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const parsed = z.email().safeParse(
    String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  );
  if (!parsed.success)
    return { ok: false, message: "Enter a valid email address." };
  const email = parsed.data;
  const service = getServiceSupabase();
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl()}/admin/auth/callback?next=/admin/set-password`,
  });
  if (error) return { ok: false, message: error.message };
  const { error: roleError } = await service
    .from("profiles")
    .upsert({ id: data.user.id, email, role: "admin" });
  if (roleError) return { ok: false, message: roleError.message };
  revalidatePath("/admin/team");
  return {
    ok: true,
    message: `Invitation sent to ${email}. They set a password from the link.`,
  };
}

export async function setRole(formData: FormData): Promise<void> {
  const session = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as ProfileRole;
  if (!PROFILE_ROLES.includes(role)) throw new Error("Unknown role");
  if (id === session.userId)
    throw new Error("You cannot change your own role.");
  const service = getServiceSupabase();
  const { error } = await service
    .from("profiles")
    .update({ role })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/team");
}

export async function removeMember(formData: FormData): Promise<void> {
  const session = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === session.userId) throw new Error("You cannot remove yourself.");
  const service = getServiceSupabase();
  const { error } = await service.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/team");
}
