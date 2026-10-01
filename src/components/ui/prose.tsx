import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ProseProps = {
  size?: "sm" | "md" | "lg";
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

/**
 * Prose — article typography for long-form content (insights, reports,
 * Tiptap output). Styles live in src/styles/prose.css and consume tokens.
 */
export function Prose({ size = "md", as, className, children }: ProseProps) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "prose",
        size === "sm" && "prose-sm",
        size === "lg" && "prose-lg",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
