import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type LedeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Lede — the paragraph under a headline: text-xl (19 to 22px), muted ink,
 * at most 42 characters a line.
 */
export function Lede({ children, className }: LedeProps) {
  return (
    <p
      className={cn(
        "text-ink-muted max-w-[42ch] font-sans text-xl text-pretty",
        className,
      )}
    >
      {children}
    </p>
  );
}
