import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils/cn";

export type ContainerSize = "text" | "narrow" | "page" | "wide";

const sizes: Record<ContainerSize, string> = {
  text: "max-w-text",
  narrow: "max-w-narrow",
  page: "max-w-page",
  wide: "max-w-wide",
};

type ContainerProps<T extends ElementType> = {
  /** Width preset. `page` (76rem) is the default reading/grid width. */
  size?: ContainerSize;
  /** Element to render — div, section, article, header, footer, main, nav. */
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/**
 * Container — centres content and applies the responsive `gutter` token.
 * Nest a `text` container inside a `page` container for measure control.
 */
export function Container<T extends ElementType = "div">({
  size = "page",
  as,
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("px-gutter mx-auto w-full", sizes[size], className)}
      {...rest}
    />
  );
}
