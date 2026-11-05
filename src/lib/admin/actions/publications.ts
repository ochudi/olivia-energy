"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import {
  FALLBACK_MESSAGE,
  isMissingColumnError,
} from "@/lib/admin/publication-fields";
import { formValues, parsePublication } from "@/lib/admin/publication-input";
import { revalidatePublications } from "@/lib/supabase/revalidate";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionState } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function bump(): void {
  revalidatePublications();
  revalidatePath("/admin/publications");
}

/**
 * Create (id null) or update a publication from its form. A form that has
 * just created a row on an older database (see below) sends that row's id as
 * `created_id`, so saving again updates it instead of adding a second one.
 *
 * When the database has not run the October update (no `kind`, `published_on`,
 * `topics`, `pull_quote` or `syndication` column) the write is retried once
 * with the original columns only, and the result says so.
 */
export async function savePublication(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const parsed = parsePublication(formData);
  if (!parsed.ok) {
    return {
      ok: false,
      message: "Fix the highlighted fields.",
      errors: parsed.errors,
      values: formValues(formData),
    };
  }
  const createdId = formData.get("created_id");
  const targetId =
    id ??
    (typeof createdId === "string" && UUID.test(createdId) ? createdId : null);
  const { base, extra } = parsed;
  const supabase = await createServerSupabase();

  let sort = 0;
  if (!targetId) {
    const { data: last } = await supabase
      .from("publications")
      .select("sort")
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();
    sort = (last?.sort ?? -1) + 1;
  }

  const write = async (row: typeof base & Partial<typeof extra>) => {
    if (targetId) {
      const { error } = await supabase
        .from("publications")
        .update(row)
        .eq("id", targetId);
      return { id: targetId, error };
    }
    const { data, error } = await supabase
      .from("publications")
      .insert({ ...row, sort })
      .select("id")
      .single();
    return { id: data?.id ?? null, error };
  };

  let result = await write({ ...base, ...extra });
  let fallback = false;
  if (result.error && isMissingColumnError(result.error)) {
    result = await write(base);
    fallback = !result.error;
  }
  if (result.error) {
    return {
      ok: false,
      message: result.error.message,
      values: formValues(formData),
    };
  }
  bump();
  if (fallback) {
    return {
      ok: true,
      message: FALLBACK_MESSAGE,
      values: {
        ...formValues(formData),
        ...(result.id ? { id: result.id } : {}),
      },
    };
  }
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
