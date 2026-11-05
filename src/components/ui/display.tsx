import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

export type DisplaySize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

export type DisplayProps = {
  as: "h1" | "h2" | "h3" | "p";
  /** The display scale (creative brief 2.2): 2xl is the home H1 only. */
  size: DisplaySize;
  /** `mask` clips the heading up from its baseline as it enters (never above the fold). */
  reveal?: "mask" | "none";
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

/**
 * Display — a headline in Newsreader 400 at one of the six display sizes.
 * Leading and tracking come with the size token. Put the italic turn
 * inside it with <Turn>.
 */
export function Display({
  as,
  size,
  reveal = "none",
  id,
  className,
  children,
}: DisplayProps) {
  const classes = cn(BASE, SIZES[size], className);
  if (reveal === "mask") {
    return (
      <Reveal as={as} variant="mask" id={id} className={classes}>
        {children}
      </Reveal>
    );
  }
  const Tag = as;
  return (
    <Tag id={id} className={classes}>
      {children}
    </Tag>
  );
}

export type TurnProps = {
  children: ReactNode;
  /** Sets the turn on its own line. */
  block?: boolean;
};

/**
 * Turn — the italic turn inside a statement: Newsreader italic in the
 * surface's turn colour (flood green on paper, lime on night, pale lime on
 * photographs, white on green and red, ink on lime). At most one per screen.
 */
export function Turn({ children, block = false }: TurnProps) {
  return <em className={cn("turn", block && "block")}>{children}</em>;
}
