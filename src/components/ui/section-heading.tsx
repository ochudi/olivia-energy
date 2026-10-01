import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Eyebrow } from "./eyebrow";

export type SectionHeadingProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  /** Section numeral shown inside the eyebrow, e.g. "02". */
  number?: string;
  lede?: ReactNode;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  /** Heading level. Defaults to h2. */
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
};

const sizes = {
  sm: "text-display-sm",
  md: "text-display-md",
  lg: "text-display-lg",
} as const;

/**
 * SectionHeading — eyebrow + serif title + optional lede. The default
 * left-aligned form is the house style; centre only for standalone
 * statements (e.g. a closing CTA).
 */
export function SectionHeading({
  title,
  eyebrow,
  number,
  lede,
  align = "left",
  size = "md",
  as,
  id,
  className,
}: SectionHeadingProps) {
  const Tag = (as ?? "h2") as ElementType;
  const centered = align === "center";
  return (
    <div
      className={cn(
        "max-w-narrow",
        centered && "mx-auto flex flex-col items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow number={number} className="mb-5">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Tag
        id={id}
        className={cn(
          "font-display text-ink font-normal tracking-tight text-balance",
          sizes[size],
        )}
      >
        {title}
      </Tag>
      {lede ? (
        <p className="max-w-text text-ink-muted mt-5 text-lg leading-relaxed text-pretty">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
