import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader, StatusBadge, Table, Td, Th, Tr } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { createDraft } from "@/lib/admin/actions/posts";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDate } from "@/lib/insights/text";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Overview" };

/** Counts and the most recent articles, with the one action that matters. */
export default async function Page() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const [drafts, published, unread, recent] = await Promise.all([
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("read", false),
    supabase
      .from("posts")
      .select("id, title, status, published_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);
  // A failed count shows a dash rather than a misleading zero.
  const shown = (r: { count: number | null; error: unknown }) =>
    r.error ? "—" : (r.count ?? 0);
  const stats = [
    {
      label: "Published",
      value: shown(published),
      href: "/admin/articles?status=published",
    },
    {
      label: "Drafts",
      value: shown(drafts),
      href: "/admin/articles?status=draft",
    },
    { label: "Unread messages", value: shown(unread), href: "/admin/inbox" },
  ];
  return (
    <>
      <PageHeader
        title="Overview"
        description="What is live, what is waiting, and what came in."
        actions={
          <form action={createDraft}>
            <Button type="submit" size="sm">
              New article
            </Button>
          </form>
        }
      />
      <ul className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="border-line bg-surface hover:border-ink/40 focus-visible:ring-focus focus-visible:ring-offset-canvas duration-instant ease-standard block rounded-sm border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px"
            >
              <p className="text-ink-muted text-xs font-medium tracking-[0.1em] uppercase">
                {s.label}
              </p>
              <p className="font-display text-display-sm sm:text-display-md mt-2 leading-none tabular-nums">
                {s.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-sm font-medium">Recently edited</h2>
        <Link
          href="/admin/articles"
          className="text-ink-muted hover:text-ink hit-area inline-flex items-center gap-1 text-xs"
        >
          All articles <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div className="mt-3">
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th className="w-32">Status</Th>
              <Th className="hidden w-40 sm:table-cell">Updated</Th>
            </tr>
          </thead>
          <tbody>
            {(recent.data ?? []).map((post) => (
              <Tr key={post.id}>
                <Td>
                  <Link
                    href={`/admin/articles/${post.id}`}
                    className="hover:text-primary focus-visible:ring-focus focus-visible:ring-offset-canvas hit-area rounded-xs font-medium after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {post.title}
                  </Link>
                </Td>
                <Td>
                  <StatusBadge
                    status={post.status}
                    publishedAt={post.published_at}
                  />
                </Td>
                <Td className="text-ink-muted hidden font-mono text-xs tabular-nums sm:table-cell">
                  {formatDate(post.updated_at, "short")}
                </Td>
              </Tr>
            ))}
            {!recent.data?.length ? (
              <Tr>
                <Td colSpan={3} className="text-ink-muted">
                  No articles yet.
                </Td>
              </Tr>
            ) : null}
          </tbody>
        </Table>
      </div>
    </>
  );
}
