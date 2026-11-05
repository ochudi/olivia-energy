import type { Metadata } from "next";
import { PageHeader } from "@/components/admin";
import { PublicationForm } from "@/components/admin/publication-form";
import { OPED_TOPICS } from "@/content/commentary";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Add publication" };

export default async function Page() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add publication" />
      <PublicationForm publication={null} topics={OPED_TOPICS} />
    </>
  );
}
