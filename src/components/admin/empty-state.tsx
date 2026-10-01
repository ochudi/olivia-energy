import type { ReactNode } from "react";

/** Dashed box for an empty list, with an optional call to action. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-line-strong flex flex-col items-start gap-3 rounded-sm border px-6 py-10">
      <p className="font-display text-display-xs font-normal">{title}</p>
      {body ? (
        <p className="text-ink-muted max-w-[50ch] text-sm">{body}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
