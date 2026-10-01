import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Dense table: uppercase heads, hairline rows, no zebra. The wrapper scrolls
 * sideways on narrow screens and is positioned so that absolutely placed
 * descendants (screen-reader-only text, stretched links) are clipped by it
 * rather than widening the page.
 */
export function Table({
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="border-line relative overflow-x-auto rounded-sm border">
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function Th({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "text-ink-muted bg-surface-muted border-line border-b px-3 py-2 text-[0.6875rem] font-medium tracking-[0.1em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      className={cn("border-line border-b px-3 py-2.5 align-middle", className)}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn(
        "hover:bg-surface-muted/60 focus-within:bg-surface-muted duration-instant ease-standard relative transition-colors last:[&>td]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}
