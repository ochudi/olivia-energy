import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CardVariant = "default" | "elevated" | "outline" | "muted";
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
  elevated: "border border-line-strong bg-surface",
  outline: "border border-line-strong bg-transparent",
  muted: "border border-transparent bg-surface-muted",
};

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-5",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

/**
 * Card — a bounded surface in the shoulder shape (brief 2.4). A single 1px
 * line is the only edge treatment; `elevated` takes the stronger line.
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
    "shoulder relative block",
    variants[variant],
    paddings[padding],
    isInteractive && "group",
    isInteractive &&
      "transition-[border-color,background-color] duration-base ease-standard hover:border-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    className,
  );

  // A dark card is a <Section surface="night"> or a block with
  // data-surface="night", not a Card variant.
  if (href !== undefined) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={classes}>{children}</Tag>;
}
