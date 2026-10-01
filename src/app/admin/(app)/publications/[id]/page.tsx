import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin";
import { PublicationForm } from "@/components/admin/publication-form";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit publication" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("publications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return (
    <>
      <PageHeader title="Edit publication" />
      <PublicationForm publication={data} />
    </>
  );
}
