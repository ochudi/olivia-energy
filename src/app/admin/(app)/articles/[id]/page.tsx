import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/article-editor";
import { requireAdmin } from "@/lib/admin/auth";
import { siteUrl } from "@/lib/seo/urls";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit article" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();
  return (
    <>
      <h1 className="sr-only">Edit article</h1>
      <ArticleEditor key={post.id} post={post} siteOrigin={siteUrl()} />
    </>
  );
}
