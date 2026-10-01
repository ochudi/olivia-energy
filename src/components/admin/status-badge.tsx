import { postState, type PostState } from "@/lib/admin/post-state";
import type { PostStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

const LABEL: Record<PostState, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

const DOT: Record<PostState, string> = {
  draft: "bg-ink-subtle",
  scheduled: "border-line-strong bg-transparent border",
  published: "bg-primary",
};

/** Draft, Scheduled (published with a future date) or Published — a dot plus text, no fill. */
export function StatusBadge({
  status,
  publishedAt,
}: {
  status: PostStatus;
  publishedAt: string | null;
}) {
  const state = postState(status, publishedAt);
  return (
    <span className="text-ink inline-flex items-center gap-1.5 text-xs font-medium">
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT[state])} />
      {LABEL[state]}
    </span>
  );
}
