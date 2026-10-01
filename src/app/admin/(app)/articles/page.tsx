import type { Metadata } from "next";
import Link from "next/link";
import {
  EmptyState,
  Notice,
  PageHeader,
  StatusBadge,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { createDraft } from "@/lib/admin/actions/posts";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDate } from "@/lib/insights/text";
import { createServerSupabase } from "@/lib/supabase/server";
import { postCategoryLabel } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Articles" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.value === params.status)
    ? (params.status as Filter)
    : "all";
  const supabase = await createServerSupabase();
  let query = supabase
    .from("posts")
    .select("id, title, slug, category, status, published_at, updated_at")
    .order("updated_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);
  const [{ data: posts, error }, allCount, draftCount, publishedCount] =
    await Promise.all([
      query,
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);
  const counts: Record<Filter, number> = {
    all: allCount.count ?? 0,
    draft: draftCount.count ?? 0,
    published: publishedCount.count ?? 0,
  };

  return (
    <>
      <PageHeader
        title="Articles"
        description="Drafts are private. Publishing makes an article live on the site within seconds."
        actions={
          <form action={createDraft}>
            <Button type="submit" size="sm">
              New article
            </Button>
          </form>
        }
      />
      {params.deleted ? (
        <Notice tone="info" className="mb-4">
          Article deleted.
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="error" className="mb-4">
          {error.message}
        </Notice>
      ) : null}
      <nav aria-label="Filter by status" className="mb-4">
        <ul className="flex gap-1">
          {FILTERS.map((f) => (
            <li key={f.value}>
              <Link
                href={
                  f.value === "all"
                    ? "/admin/articles"
                    : `/admin/articles?status=${f.value}`
                }
                aria-current={filter === f.value ? "true" : undefined}
                className={cn(
                  "focus-visible:ring-focus focus-visible:ring-offset-canvas duration-instant ease-standard inline-flex h-8 items-center gap-1.5 rounded-xs border px-3 text-xs font-medium tracking-[0.1em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px",
                  filter === f.value
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "font-mono text-[0.6875rem] normal-case tabular-nums",
                    filter === f.value ? "text-canvas/70" : "text-ink-subtle",
                  )}
                >
                  {counts[f.value]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {posts?.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th className="hidden w-44 md:table-cell">Category</Th>
              <Th className="w-28">Status</Th>
              <Th className="hidden w-36 md:table-cell">Published</Th>
              <Th className="hidden w-36 lg:table-cell">Updated</Th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <Tr key={post.id}>
                <Td>
                  <Link
                    href={`/admin/articles/${post.id}`}
                    className="hover:text-primary focus-visible:ring-focus focus-visible:ring-offset-canvas hit-area rounded-xs font-medium after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {post.title}
                  </Link>
                  <span className="text-ink-subtle mt-0.5 block font-mono text-[0.6875rem]">
                    /insights/{post.slug}
                  </span>
                </Td>
                <Td className="text-ink-muted hidden md:table-cell">
                  {postCategoryLabel(post.category)}
                </Td>
                <Td>
                  <StatusBadge
                    status={post.status}
                    publishedAt={post.published_at}
                  />
                </Td>
                <Td className="text-ink-muted hidden font-mono text-xs tabular-nums md:table-cell">
                  {formatDate(post.published_at, "short") || "—"}
                </Td>
                <Td className="text-ink-muted hidden font-mono text-xs tabular-nums lg:table-cell">
                  {formatDate(post.updated_at, "short")}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          title={
            filter === "all"
              ? "No articles yet."
              : `No ${filter === "draft" ? "drafts" : "published articles"}.`
          }
          body="Start a draft, write, add a cover, publish. It takes a few minutes."
          action={
            <form action={createDraft}>
              <Button type="submit" size="sm">
                New article
              </Button>
            </form>
          }
        />
      )}
    </>
  );
}
