import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn, omitKeys } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional icon (typically a 16px lucide icon). */
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  className?: string;
  children: ReactNode;
};

type AsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
  };

type AsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = AsButton | AsLink;

const COMMON_KEYS = [
  "variant",
  "size",
  "icon",
  "iconPosition",
  "className",
  "children",
] as const;

const base =
  "group/button inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xs font-sans font-medium tracking-[0.005em] transition-[background-color,color,border-color,box-shadow,transform] duration-fast ease-standard motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 [&_svg]:transition-transform [&_svg]:duration-fast [&_svg]:ease-standard motion-reduce:[&_svg]:transform-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover hover:shadow-xs active:translate-y-px active:shadow-none active:duration-instant hover:[&_svg]:translate-x-0.5",
  secondary:
    "border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink/[0.04] active:bg-ink/[0.08] active:translate-y-px active:duration-instant",
  ghost:
    "bg-transparent px-0 text-ink hover:text-primary active:text-primary-hover active:duration-instant hover:[&_svg]:translate-x-0.5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base",
};

// Ghost has no box, so it takes only the type size (no height, no padding).
const ghostSizes: Record<ButtonSize, string> = {
  sm: "hit-area text-sm",
  md: "hit-area text-sm",
  lg: "hit-area text-base",
};

/**
 * Button — three variants, three sizes.
 *  primary   → the single most important action on a view (one per section).
 *  secondary → alternative or paired action; hairline outline in ink.
 *  ghost     → in-line text action with a trailing arrow; no box.
 * Renders a Next.js <Link> when `href` is provided, otherwise a <button>.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "end",
    className,
    children,
  } = props;

  const classes = cn(
    base,
    variants[variant],
    variant === "ghost" ? ghostSizes[size] : sizes[size],
    className,
  );

  const iconEl = icon ? (
    <span aria-hidden className="inline-flex shrink-0 [&_svg]:size-4">
      {icon}
    </span>
  ) : null;

  const content = (
    <>
      {iconPosition === "start" && iconEl}
      <span className={variant === "ghost" ? "link-underline" : undefined}>
        {children}
      </span>
      {iconPosition === "end" && iconEl}
    </>
  );

  if (props.href !== undefined) {
    const linkProps = omitKeys(props, COMMON_KEYS);
    return (
      <Link className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = omitKeys(props, [...COMMON_KEYS, "href"]);
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
