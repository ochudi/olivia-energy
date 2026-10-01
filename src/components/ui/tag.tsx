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
  accent: "bg-accent text-neutral-0",
};

const sizes: Record<TagSize, string> = {
  sm: "h-5 px-1.5 text-[0.6875rem]",
  md: "h-6 px-2 text-xs",
  lg: "h-8 px-3 text-xs",
};

/**
 * Tag — a compact categorical label. Square-cornered, uppercase, tracked.
 * `primary` is a quiet, text-only treatment (no fill) for a positive or
 * published state. `accent` is the red budget for the page: use it for one
 * live/active state and nothing else.
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
        "inline-flex items-center rounded-xs font-sans font-medium tracking-[0.1em] whitespace-nowrap uppercase",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
