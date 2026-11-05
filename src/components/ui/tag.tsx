import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type TagVariant = "default" | "outline" | "primary" | "accent";
export type TagSize = "sm" | "md" | "lg";

export type TagProps = {
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
  children: ReactNode;
};

const variants: Record<TagVariant, string> = {
  default: "bg-surface-muted text-ink",
  outline: "border border-line-strong text-ink-muted",
  primary: "bg-transparent text-primary",
  accent: "bg-accent text-accent-fg",
};

const sizes: Record<TagSize, string> = {
  sm: "h-5 px-2 text-[0.6875rem]",
  md: "h-6 px-2.5 text-xs",
  lg: "h-7 px-3 text-xs",
};

/**
 * Tag — a compact categorical label: a pill, uppercase, tracked (legacy;
 * new work uses <Chip>). `primary` is a quiet, text-only treatment (no
 * fill) for a positive or published state. `accent` is the gap red: the
 * gap pill and nothing else.
 */
export function Tag({
  variant = "default",
  size = "md",
  className,
  children,
}: TagProps) {
  return (
    <span
      className={cn(
        "rounded-pill inline-flex items-center font-sans font-semibold tracking-[0.12em] whitespace-nowrap uppercase",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
