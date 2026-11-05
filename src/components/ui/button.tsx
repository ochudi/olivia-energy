import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn, omitKeys } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Trailing arrow inside a small ring (the only circle a button carries). */
  arrow?: boolean;
  /** Opens in a new tab and says so to screen readers. */
  external?: boolean;
  /** Optional icon (typically a 16px lucide icon); `arrow` replaces it. */
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
  "arrow",
  "external",
  "icon",
  "iconPosition",
  "className",
  "children",
] as const;

const base =
  "group/button inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-pill font-sans font-medium transition-[background-color,color,border-color,transform] duration-fast ease-standard motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover active:translate-y-px active:duration-instant",
  secondary:
    "border border-line-strong bg-transparent text-ink hover:border-ink hover:bg-ink/[0.05] active:bg-ink/[0.09] active:translate-y-px active:duration-instant",
  text: "bg-transparent px-0 text-ink hover:text-ink-muted active:duration-instant",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 pl-6 pr-5 text-sm",
  lg: "h-14 pl-7 pr-6 text-base",
};

// Text buttons have no box, so they take only the type size.
const textSizes: Record<ButtonSize, string> = {
  sm: "hit-area text-sm",
  md: "hit-area text-sm",
  lg: "hit-area text-base",
};

/** The arrow in its ring: a 24px circle in the button's own colour. */
function ArrowRing({ boxed }: { boxed: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "hover-arrow rounded-pill inline-flex size-6 shrink-0 items-center justify-center",
        boxed ? "border border-current/40" : "border-line-strong border",
      )}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5"
      >
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </span>
  );
}

/**
 * Button — three variants, three sizes (creative brief 2.4: a pill).
 *  primary   → the surface's primary fill (flood green on paper, lime on
 *              night, paper on green and red, ink on lime).
 *  secondary → hairline outline in the surface's strong line.
 *  text      → in-line text action with a draw-in underline; no box.
 * `arrow` adds the arrow in a ring, which slides 4px on hover.
 * Renders a Next.js <Link> when `href` is provided, otherwise a <button>.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    arrow = false,
    external = false,
    icon,
    iconPosition = "end",
    className,
    children,
  } = props;
  const isText = variant === "text";

  const classes = cn(
    base,
    variants[variant],
    isText
      ? textSizes[size]
      : cn(sizes[size], !arrow && (size === "lg" ? "px-7" : "px-6")),
    className,
  );

  const iconEl = arrow ? (
    <ArrowRing boxed={!isText} />
  ) : icon ? (
    <span
      aria-hidden
      className="hover-arrow inline-flex shrink-0 [&_svg]:size-4"
    >
      {icon}
    </span>
  ) : null;

  const content = (
    <>
      {iconPosition === "start" && !arrow && iconEl}
      <span className={isText ? "link-underline" : undefined}>
        {children}
        {external ? (
          <span className="sr-only">, opens in a new tab</span>
        ) : null}
      </span>
      {(iconPosition === "end" || arrow) && iconEl}
    </>
  );

  if (props.href !== undefined) {
    const linkProps = omitKeys(props, COMMON_KEYS);
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};
    return (
      <Link className={classes} {...externalProps} {...linkProps}>
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
