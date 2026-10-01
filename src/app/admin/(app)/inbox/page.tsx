import type { Metadata } from "next";
import { Mail } from "lucide-react";
import Link from "next/link";
import { EmptyState, Notice, PageHeader } from "@/components/admin";
import { SITE } from "@/content/site";
import { deleteMessage, markMessage } from "@/lib/admin/actions/inbox";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Inbox" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

/** Token easing + unified focus ring + a 1px press, for small text/icon controls. */
const controlPolish =
  "rounded-xs transition-colors duration-instant ease-standard active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const when = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function replyHref(m: {
  name: string;
  email: string;
  message: string;
}): string {
  const subject = `Re: your message to ${SITE.name}`;
  const quoted = m.message
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const body = `Dear ${m.name},\n\n\n\n---\n${quoted}`;
  return `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.value === params.filter)
    ? (params.filter as Filter)
    : "all";
  const supabase = await createServerSupabase();
  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("read", { ascending: true })
    .order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("read", filter === "read");
  const { data: messages, error } = await query;

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Messages from the contact form. Replies open in your mail client."
      />
      {error ? (
        <Notice tone="error" className="mb-4">
          {error.message}
        </Notice>
      ) : null}
      <nav aria-label="Filter messages" className="mb-4">
        <ul className="flex gap-1">
          {FILTERS.map((f) => (
            <li key={f.value}>
              <Link
                href={
                  f.value === "all"
                    ? "/admin/inbox"
                    : `/admin/inbox?filter=${f.value}`
                }
                aria-current={filter === f.value ? "true" : undefined}
                className={cn(
                  "inline-flex h-8 items-center rounded-xs border px-3 text-xs font-medium transition-colors",
                  filter === f.value
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
                )}
              >
                {f.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {messages?.length ? (
        <ul className="border-line divide-line divide-y rounded-sm border">
          {messages.map((m) => (
            <li key={m.id} className={cn("px-4 py-3", !m.read && "bg-surface")}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1 [&::-webkit-details-marker]:hidden">
                  <span
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      !m.read ? "font-medium" : "text-ink-muted",
                    )}
                  >
                    {!m.read ? (
                      <span
                        aria-label="Unread"
                        className="bg-primary size-1.5 rounded-full"
                      />
                    ) : null}
                    {m.name}
                    {m.organization ? (
                      <span className="text-ink-muted font-normal">
                        · {m.organization}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-ink-muted text-xs">{m.email}</span>
                  <span className="text-ink-subtle ml-auto font-mono text-[0.6875rem] tabular-nums">
                    {when.format(new Date(m.created_at))}
                  </span>
                  <span className="text-ink-muted line-clamp-1 w-full text-xs group-open:hidden">
                    {m.message}
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  <p className="text-ink max-w-[70ch] text-sm leading-relaxed whitespace-pre-wrap">
                    {m.message}
                  </p>
                  <div className="[&_a]:hit-area [&_button]:hit-area flex flex-wrap items-center gap-4 text-xs">
                    <a
                      href={replyHref(m)}
                      className={cn(
                        "text-ink hover:text-primary inline-flex items-center gap-1.5 font-medium",
                        controlPolish,
                      )}
                    >
                      <Mail aria-hidden className="size-3.5" /> Reply
                    </a>
                    <form action={markMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="hidden"
                        name="read"
                        value={m.read ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={cn(
                          "text-ink-muted hover:text-ink",
                          controlPolish,
                        )}
                      >
                        Mark as {m.read ? "unread" : "read"}
                      </button>
                    </form>
                    <form action={deleteMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className={cn(
                          "text-ink-muted hover:text-accent hit-area",
                          controlPolish,
                        )}
                      >
                        Delete
                      </button>
                    </form>
                    {m.turnstile_score !== null ? (
                      <span className="text-ink-subtle font-mono">
                        {m.turnstile_score >= 1
                          ? "turnstile passed"
                          : `bot score ${m.turnstile_score}`}
                      </span>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={
            filter === "all" ? "No messages yet." : `No ${filter} messages.`
          }
          body="Contact-form submissions land here. Unread ones are counted in the sidebar."
        />
      )}
    </>
  );
}
