import type { PostStatus } from "@/lib/supabase/types";

export type PostState = "draft" | "scheduled" | "published";

/**
 * Draft, Scheduled (published with a date still in the future) or
 * Published. The clock is a parameter so callers and tests can pin it.
 */
export function postState(
  status: PostStatus,
  publishedAt: string | null,
  now: number = Date.now(),
): PostState {
  if (status === "draft") return "draft";
  const scheduled = publishedAt ? new Date(publishedAt).getTime() > now : false;
  return scheduled ? "scheduled" : "published";
}
