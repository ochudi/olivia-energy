import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type NoticeTone = "success" | "error" | "info";

const tones: Record<NoticeTone, string> = {
  success: "border-primary/40 bg-primary-soft text-primary-soft-fg",
  error: "border-accent/40 bg-surface text-ink",
  info: "border-line bg-surface-muted text-ink-muted",
};

/** Inline feedback line for forms and lists. */
export function Notice({
  tone = "info",
  className,
  children,
}: {
  tone?: NoticeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xs border px-3 py-2 text-sm leading-relaxed",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
