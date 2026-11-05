import type { ReactNode } from "react";
import type { Surface } from "@/types/contracts";
import { cn } from "@/lib/utils/cn";

export type SectionProps = {
  /** The surface this section declares; it remaps every semantic token inside (globals.css). */
  surface: Surface;
  id?: string;
  /**
   * Only on a page's first section: the fixed header is transparent over it
   * until the page scrolls (dark: white header text; light: ink).
   */
  hero?: "dark" | "light";
  /**
   * The surface the fixed header takes while this section is under its
   * edge, when that differs from `surface` (a section made of half-width
   * panels on other surfaces). Read by the header only.
   */
  headerSurface?: Surface;
  as?: "section" | "div" | "footer";
  /** Vertical padding: the section token, the small band token, or none. */
  spacing?: "default" | "sm" | "none";
  className?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
};

const SPACING = {
  default: "py-section",
  sm: "py-section-sm",
  none: "",
} as const;

/* A hero pulls under the fixed header and gives the height back on top of
   its own padding. */
const HERO_SPACING = {
  default: "-mt-header pt-[calc(var(--spacing-header)+var(--spacing-section))]",
  sm: "-mt-header pt-[calc(var(--spacing-header)+var(--spacing-section-sm))]",
  none: "-mt-header pt-header",
} as const;

/**
 * Section — one surface, one band. Every section of every page is one of
 * these, so the header always knows the colour under its edge and
 * components inside can keep using bg-canvas, text-ink and border-line.
 */
export function Section({
  surface,
  id,
  hero,
  headerSurface,
  as = "section",
  spacing = "default",
  className,
  children,
  "aria-labelledby": labelledBy,
}: SectionProps) {
  const Tag = as;
  return (
    <Tag
      id={id}
      data-surface={surface}
      data-hero={hero}
      data-header-surface={headerSurface}
      aria-labelledby={labelledBy}
      className={cn(
        "bg-canvas text-ink relative isolate",
        SPACING[spacing],
        hero && HERO_SPACING[spacing],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
