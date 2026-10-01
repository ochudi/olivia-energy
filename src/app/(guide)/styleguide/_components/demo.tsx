import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type DemoProp = { name: string; type: string; note?: string };

export function Demo({
  name,
  path,
  description,
  usage,
  props,
  children,
  preview = "canvas",
  className,
}: {
  name: string;
  path: string;
  description?: ReactNode;
  usage?: ReactNode[];
  props?: DemoProp[];
  children: ReactNode;
  /** Background of the preview area. */
  preview?: "canvas" | "surface" | "inverse";
  className?: string;
}) {
  return (
    <article
      className={cn(
        "border-line bg-surface overflow-hidden rounded-sm border",
        className,
      )}
    >
      <header className="border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b px-5 py-4 md:px-6">
        <h4 className="font-display text-display-xs text-ink tracking-tight">
          {name}
        </h4>
        <code className="text-ink-subtle font-mono text-xs">{path}</code>
        {description ? (
          <p className="text-ink-muted basis-full text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </header>
      <div
        className={cn(
          "px-5 py-8 md:px-8 md:py-10",
          preview === "canvas" && "bg-canvas",
          preview === "surface" && "bg-surface",
          preview === "inverse" && "bg-inverse text-inverse-fg",
        )}
      >
        {children}
      </div>
      {usage || props ? (
        <div className="border-line grid gap-6 border-t px-5 py-5 md:grid-cols-2 md:px-6">
          {usage ? (
            <div>
              <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                Usage
              </p>
              <ul className="text-ink-muted mt-3 space-y-2 text-sm leading-relaxed">
                {usage.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden
                      className="bg-line-strong mt-[0.7em] h-px w-3 shrink-0"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {props ? (
            <div>
              <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                Props
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                {props.map((p) => (
                  <div key={p.name} className="flex flex-wrap gap-x-3 gap-y-0">
                    <dt className="text-ink font-mono text-xs">{p.name}</dt>
                    <dd className="text-ink-subtle font-mono text-xs">
                      {p.type}
                    </dd>
                    {p.note ? (
                      <dd className="text-ink-muted basis-full text-xs leading-relaxed">
                        {p.note}
                      </dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/** A labelled cell inside a Demo preview, for showing variants side by side. */
export function DemoCell({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <span className="text-ink-subtle font-mono text-[0.6875rem]">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}
