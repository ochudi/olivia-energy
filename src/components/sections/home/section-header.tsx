import type { ReactNode } from "react";
import { Display, type DisplaySize } from "@/components/ui/display";
import { cn } from "@/lib/utils/cn";

export type HomeSectionHeaderProps = {
  title: string;
  /** The id the section's aria-labelledby points at. */
  titleId: string;
  /** Section H2s are display-lg; the commentary heading is display-xl. */
  size?: Extract<DisplaySize, "xl" | "lg">;
  /** The right-hand column (cols 8 to 12 at 1024+), bottom-aligned. */
  aside?: ReactNode;
  /** A lede under the heading, in the left column (commentary). */
  lede?: ReactNode;
  className?: string;
};

/**
 * The header row every home body section shares (creative brief 4.1): the
 * H2 in cols 1 to 7, the lede (or the count line) in cols 8 to 12,
 * bottom-aligned. Nothing sits above the heading (DESIGN.md, Typography),
 * and the heading is static.
 */
export function HomeSectionHeader({
  title,
  titleId,
  size = "lg",
  aside,
  lede,
  className,
}: HomeSectionHeaderProps) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-x-6",
        className,
      )}
    >
      <div className={size === "xl" ? "lg:col-span-8" : "lg:col-span-7"}>
        <Display
          as="h2"
          size={size}
          id={titleId}
          className={size === "xl" ? "max-w-[14ch]" : "max-w-[16ch]"}
        >
          {title}
        </Display>
        {lede ? <div className="mt-6 md:mt-8">{lede}</div> : null}
      </div>
      {aside ? (
        <div
          className={cn(
            "lg:pb-2",
            size === "xl"
              ? "lg:col-span-4 lg:col-start-9"
              : "lg:col-span-5 lg:col-start-8",
          )}
        >
          {aside}
        </div>
      ) : null}
    </div>
  );
}
