import type { ReactNode } from "react";
import type { Surface } from "@/types/contracts";
import { cn } from "@/lib/utils/cn";

/**
 * A surface inside the guide's column: it declares `data-surface`, so every
 * semantic token inside remaps exactly as it does in a page section. The
 * guide itself sits on paper; this is how the other six are shown.
 */
export function SurfaceFrame({
  surface,
  className,
  children,
  id,
}: {
  surface: Surface;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      data-surface={surface}
      className={cn(
        "bg-canvas text-ink border-line shoulder relative isolate overflow-hidden border",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A labelled row inside a specimen: the label left, the content right. */
export function Row({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-line grid gap-3 border-t pt-4 lg:grid-cols-[9rem_1fr] lg:gap-6",
        className,
      )}
    >
      <span className="source-line text-ink-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** A flat colour chip with its label, for token swatches. */
export function Chipset({
  items,
}: {
  items: readonly { label: string; value: string }[];
}) {
  return (
    <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 xl:grid-cols-8">
      {items.map((s) => (
        <li key={s.label} className="flex flex-col gap-1.5">
          <span
            aria-hidden="true"
            className="border-line h-10 w-full border"
            style={{ background: s.value }}
          />
          <span className="source-line text-ink-muted break-words">
            {s.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** `code` styled for token and class names. */
export function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-xs">{children}</code>;
}
