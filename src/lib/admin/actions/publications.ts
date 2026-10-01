"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { revalidatePublications } from "@/lib/supabase/revalidate";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionState } from "./types";

const input = z.object({
  title: z.string().trim().min(1, "Add a title.").max(300),
  authors: z.string().trim(),
  venue: z.string().trim().max(200),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$|^$/, "Four-digit year."),
  url: z
    .string()
    .trim()
    .regex(/^(https?:\/\/.+|)$/i, "Must start with https://"),
  summary: z.string().trim().max(1000),
  featured: z.boolean(),
});

function bump(): void {
  revalidatePublications();
  revalidatePath("/admin/publications");
}

/** Create (id null) or update a publication from its form. */
export async function savePublication(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const parsed = input.safeParse({
    title: formData.get("title") ?? "",
    authors: formData.get("authors") ?? "",
    venue: formData.get("venue") ?? "",
    year: formData.get("year") ?? "",
    url: formData.get("url") ?? "",
    summary: formData.get("summary") ?? "",
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: "Fix the highlighted fields.", errors };
  }
  const v = parsed.data;
  const row = {
    title: v.title,
    authors: v.authors
      .split(/[;,]/)
      .map((a) => a.trim())
      .filter(Boolean),
    venue: v.venue || null,
    year: v.year ? Number(v.year) : null,
    url: v.url || null,
    summary: v.summary || null,
    featured: v.featured,
  };
  const supabase = await createServerSupabase();
  if (id) {
    const { error } = await supabase
      .from("publications")
      .update(row)
      .eq("id", id);
    if (error) return { ok: false, message: error.message };
  } else {
    const { data: last } = await supabase
      .from("publications")
      .select("sort")
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase
      .from("publications")
      .insert({ ...row, sort: (last?.sort ?? -1) + 1 });
    if (error) return { ok: false, message: error.message };
  }
  bump();
  redirect("/admin/publications?saved=1");
}

export async function setFeatured(
  id: string,
  featured: boolean,
): Promise<void> {
  await assertAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("publications")
    .update({ featured })
    .eq("id", id);
  if (error) throw new Error(error.message);
  bump();
}

/** Persists a new order: `sort` becomes each id's index. */
export async function reorderPublications(ids: string[]): Promise<void> {
  await assertAdmin();
  const supabase = await createServerSupabase();
  await Promise.all(
    ids.map((id, index) =>
      supabase.from("publications").update({ sort: index }).eq("id", id),
    ),
  );
  bump();
}

export async function deletePublication(id: string): Promise<void> {
  await assertAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("publications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bump();
}
