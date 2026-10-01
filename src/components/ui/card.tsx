import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CardVariant =
  "default" | "elevated" | "outline" | "muted" | "inverse";
export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Adds hover affordance. Implied when `href` is set. */
  interactive?: boolean;
  /** Renders the whole card as a link. */
  href?: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

const variants: Record<CardVariant, string> = {
  default: "border border-line bg-surface",
  elevated: "border border-line bg-surface shadow-md",
  outline: "border border-line-strong bg-transparent",
  muted: "border border-transparent bg-surface-muted",
  inverse: "border border-transparent bg-inverse text-inverse-fg",
};

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-5",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

/**
 * Card — a bounded surface. Hairline borders do the work; shadows are
 * reserved for the `elevated` variant (overlays, featured items).
 */
export function Card({
  variant = "default",
  padding = "md",
  interactive,
  href,
  as,
  className,
  children,
}: CardProps) {
  const isInteractive = interactive || href !== undefined;
  const classes = cn(
    "relative block rounded-sm",
    variants[variant],
    paddings[padding],
    isInteractive && "group",
    isInteractive &&
      "transition-[border-color,box-shadow,background-color] duration-base ease-standard hover:border-ink/35 active:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    isInteractive &&
      (variant === "elevated" ? "hover:shadow-lg" : "hover:shadow-sm"),
    className,
  );

  // Dark surface: opts into the inverse tone remap (see globals.css).
  const tone = variant === "inverse" ? "inverse" : undefined;

  if (href !== undefined) {
    return (
      <Link href={href} className={classes} data-tone={tone}>
        {children}
      </Link>
    );
  }
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={classes} data-tone={tone}>
      {children}
    </Tag>
  );
}
