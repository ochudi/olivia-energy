"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { adminLinkUrl, sendAdminLink } from "@/lib/admin/links";
import { getServiceSupabase } from "@/lib/supabase/service";
import { PROFILE_ROLES, type ProfileRole } from "@/lib/supabase/types";
import type { ActionState } from "./types";

/**
 * The Auth user with this address, if the project has one. The project may
 * be shared with other applications, so this pages through every user
 * rather than assuming a small list.
 */
async function findUserId(email: string): Promise<string | null> {
  const service = getServiceSupabase();
  for (let page = 1; ; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 1000) return null;
  }
}

/**
 * Gives an email address admin access. A new address gets an Auth account
 * and a one-time link to choose a password, mailed through Resend (see
 * links.ts); an address that already has an account simply gains the role
 * and keeps its password. Either way the access itself is the profiles row.
 */
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

  const { data, error } = await service.auth.admin.generateLink({
    type: "invite",
    email,
  });
  if (error && error.code !== "email_exists")
    return { ok: false, message: error.message };

  const userId = error ? await findUserId(email) : data.user.id;
  if (!userId)
    return { ok: false, message: "That account could not be found." };
  const { error: roleError } = await service
    .from("profiles")
    .upsert({ id: userId, email, role: "admin" });
  if (roleError) return { ok: false, message: roleError.message };
  revalidatePath("/admin/team");

  if (error) {
    return {
      ok: true,
      message: `${email} already has an account, so no invitation was needed. They now have admin access and sign in with their existing password, or use “Forgot your password?” on the sign-in page.`,
    };
  }
  const link = adminLinkUrl(data.properties);
  const sent = await sendAdminLink("invite", email, link);
  if (sent.ok) {
    return {
      ok: true,
      message: `Invitation sent to ${email}. They choose a password from the link.`,
    };
  }
  console.warn(
    `[team] invite for ${email} not emailed (${sent.reason})${sent.detail ? `: ${sent.detail}` : ""}`,
  );
  return {
    ok: true,
    message:
      sent.reason === "unconfigured"
        ? `${email} has been added, but email delivery is not set up, so nothing was sent. Send them this link yourself; it works once.`
        : `${email} has been added, but the invitation email could not be sent. Send them this link yourself; it works once.`,
    link,
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

/**
 * Removes a member by deleting their profile, which is what grants access.
 * The Auth account is deliberately left in place: the Supabase project may
 * be shared, and the same person may sign in to another application with it.
 */
export async function removeMember(formData: FormData): Promise<void> {
  const session = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === session.userId) throw new Error("You cannot remove yourself.");
  const service = getServiceSupabase();
  const { error } = await service.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/team");
}
