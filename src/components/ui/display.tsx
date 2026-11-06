import { ViewTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type DisplaySize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

export type DisplayProps = {
  as: "h1" | "h2" | "h3" | "p";
  /**
   * The display scale (DESIGN.md, Typography): 2xl is the home H1 only; xl
   * is for statements of six words or fewer; lg for every H1 that is a
   * sentence and for section H2s.
   */
  size: DisplaySize;
  /**
   * The page's one headline: named for the route transition, so it morphs
   * into the next page's headline on a client-side navigation (DESIGN.md,
   * Motion). One per page.
   */
  headline?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
};

const SIZES: Record<DisplaySize, string> = {
  "2xl": "text-display-2xl",
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
  xs: "text-display-xs",
};

const BASE = "font-display text-ink font-normal text-balance";

/** The name and class every page headline shares for the route morph. */
export const HEADLINE_TRANSITION = {
  name: "page-headline",
  share: "morph",
  default: "none",
} as const;

/**
 * Display — a headline in Newsreader 400 at one of the six display sizes,
 * roman, static: text never animates in (DESIGN.md, Motion). Leading and
 * tracking come with the size token.
 */
export function Display({
  as,
  size,
  headline = false,
  id,
  className,
  children,
}: DisplayProps) {
  const Tag = as;
  const heading = (
    <Tag id={id} className={cn(BASE, SIZES[size], className)}>
      {children}
    </Tag>
  );
  if (!headline) return heading;
  return <ViewTransition {...HEADLINE_TRANSITION}>{heading}</ViewTransition>;
}

export type TurnProps = {
  children: ReactNode;
  /** Sets the turn on its own line. */
  block?: boolean;
};

/**
 * Turn — Newsreader italic in the surface's turn colour, for one line on
 * the site: the second line of the client's tagline, "Inspiring sustainable
 * futures.", on the home hero and in the footer (DESIGN.md, Typography).
 * Never a word or a sentence inside any other heading or statement.
 */
export function Turn({ children, block = false }: TurnProps) {
  return <em className={cn("turn", block && "block")}>{children}</em>;
}
