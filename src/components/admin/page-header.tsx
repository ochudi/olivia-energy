import type { ReactNode } from "react";

/** Admin page title row: title left, actions right, optional description. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="border-line mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-5">
      <div>
        <h1 className="font-display text-display-sm font-normal tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-ink-muted mt-1 max-w-[60ch] text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
