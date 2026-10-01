"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import type { Json } from "@/lib/supabase/database.types";
import { revalidatePosts } from "@/lib/supabase/revalidate";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  POST_CATEGORIES,
  type PostCategory,
  type PostStatus,
} from "@/lib/supabase/types";

/** Creates an untitled draft and opens it. */
export async function createDraft(): Promise<void> {
  const session = await assertAdmin();
  const supabase = await createServerSupabase();
  const suffix = Math.random().toString(36).slice(2, 8);
  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug: `untitled-${suffix}`,
      title: "Untitled article",
      category: "research-notes",
      author_id: session.userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/admin/articles/${data.id}`);
}

const postInput = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the article a title.")
    .max(200, "Keep the title under 200 characters."),
  slug: z
    .string()
    .trim()
    .min(1, "The article needs a URL slug.")
    .max(120)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and hyphens only.",
    ),
  excerpt: z.string().trim().max(400, "Keep the excerpt under 400 characters."),
  category: z.enum(POST_CATEGORIES as [PostCategory, ...PostCategory[]]),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  cover_path: z.string().trim().max(400).nullable(),
  seo_title: z
    .string()
    .trim()
    .max(70, "Keep the SEO title under 70 characters."),
  seo_description: z
    .string()
    .trim()
    .max(200, "Keep the description under 200 characters."),
  body: z.object({ type: z.literal("doc") }).passthrough(),
});
export type PostInput = z.input<typeof postInput>;
export type SaveIntent = "save" | "publish" | "unpublish";
export type SaveResult =
  | {
      ok: true;
      status: PostStatus;
      slug: string;
      publishedAt: string | null;
      message: string;
    }
  | { ok: false; message: string; errors?: Record<string, string> };

/** Saves the editor state; `intent` also moves the article between draft and published. */
export async function savePost(
  id: string,
  input: PostInput,
  intent: SaveIntent,
): Promise<SaveResult> {
  await assertAdmin();
  const parsed = postInput.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: "Fix the highlighted fields.", errors };
  }
  const v = parsed.data;
  const supabase = await createServerSupabase();
  const { data: before } = await supabase
    .from("posts")
    .select("slug, status")
    .eq("id", id)
    .maybeSingle();
  if (!before) return { ok: false, message: "This article no longer exists." };

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: v.title,
      slug: v.slug,
      excerpt: v.excerpt || null,
      category: v.category,
      tags: v.tags,
      cover_path: v.cover_path || null,
      seo_title: v.seo_title || null,
      seo_description: v.seo_description || null,
      body: v.body as Json,
      ...(intent === "publish"
        ? { status: "published" as const }
        : intent === "unpublish"
          ? { status: "draft" as const }
          : {}),
    })
    .eq("id", id)
    .select("slug, status, published_at")
    .single();
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message: "That slug is already used by another article.",
        errors: { slug: "Already in use." },
      };
    }
    return { ok: false, message: error.message };
  }

  // Public pages change whenever a published article is touched, moves
  // between states, or changes slug.
  if (data.status === "published" || before.status === "published") {
    revalidatePosts(data.slug);
    if (before.slug !== data.slug) revalidatePosts(before.slug);
  }
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  return {
    ok: true,
    status: data.status,
    slug: data.slug,
    publishedAt: data.published_at,
    message:
      intent === "publish"
        ? "Published. The article is live."
        : intent === "unpublish"
          ? "Unpublished. The article is a draft again."
          : "Saved.",
  };
}

export async function deletePost(id: string): Promise<void> {
  await assertAdmin();
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("posts")
    .select("slug, status")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (data?.status === "published") revalidatePosts(data.slug);
  revalidatePath("/admin/articles");
  redirect("/admin/articles?deleted=1");
}
