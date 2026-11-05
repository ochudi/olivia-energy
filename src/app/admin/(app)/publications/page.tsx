import type { Metadata } from "next";
import { EmptyState, Notice, PageHeader } from "@/components/admin";
import { PublicationKindFilter } from "@/components/admin/publication-kind-filter";
import { PublicationsTable } from "@/components/admin/publications-table";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import {
  listCounts,
  listRows,
  parseListFilter,
} from "@/lib/admin/publication-fields";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Publications" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; kind?: string }>;
}) {
  await requireAdmin();
  const { saved, kind } = await searchParams;
  const filter = parseListFilter(kind);
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .order("sort", { ascending: true })
    .order("year", { ascending: false, nullsFirst: false });
  const rows = data ?? [];
  const shown = listRows(rows, filter);
  return (
    <>
      <PageHeader
        title="Publications"
        description="Journal articles, op-eds and mentions. Drag journal articles to set their order; featured ones are listed first on the site. Op-eds and mentions are listed newest first."
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
      {rows.length ? (
        <PublicationKindFilter active={filter} counts={listCounts(rows)} />
      ) : null}
      {shown.length ? (
        <PublicationsTable
          key={filter}
          items={shown}
          reorderable={filter === "journal"}
        />
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
