import type { Metadata } from "next";
import { EmptyState, Notice, PageHeader } from "@/components/admin";
import { PublicationsTable } from "@/components/admin/publications-table";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Publications" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { saved } = await searchParams;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .order("sort", { ascending: true })
    .order("year", { ascending: false, nullsFirst: false });
  return (
    <>
      <PageHeader
        title="Publications"
        description="Drag rows to set the order. Featured items are listed first on the site."
        actions={
          <Button href="/admin/publications/new" size="sm">
            Add publication
          </Button>
        }
      />
      {saved ? (
        <Notice tone="success" className="mb-4">
          Saved.
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="error" className="mb-4">
          {error.message}
        </Notice>
      ) : null}
      {data?.length ? (
        <PublicationsTable items={data} />
      ) : (
        <EmptyState
          title="No publications yet."
          body="Add a paper, report or article with its Scholar or DOI link."
          action={
            <Button href="/admin/publications/new" size="sm">
              Add publication
            </Button>
          }
        />
      )}
    </>
  );
}
