import type { ReactNode } from "react";
import { Display } from "@/components/ui/display";

/**
 * One credits section under a 1px rule: the heading in cols 1 to 4 and the
 * content in cols 5 to 12, or (wide) the heading above full-width content.
 */
export function CreditRow({
  id,
  title,
  wide = false,
  children,
}: {
  id: string;
  title: string;
  /** Heading above, content across all twelve columns (the photo table). */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      id={id}
      className="border-line scroll-mt-header grid grid-cols-1 gap-x-6 gap-y-8 border-t py-12 lg:grid-cols-12 lg:py-16"
    >
      <Display
        as="h2"
        size="md"
        id={`${id}-title`}
        className={wide ? "lg:col-span-12" : "lg:col-span-4"}
      >
        {title}
      </Display>
      <div
        className={wide ? "min-w-0 lg:col-span-12" : "min-w-0 lg:col-span-8"}
      >
        {children}
      </div>
    </section>
  );
}

export const LINK =
  "tap decoration-current/40 hover:decoration-current focus-visible:ring-focus focus-visible:ring-offset-canvas underline underline-offset-[0.2em] transition-[text-decoration-color] duration-200 focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";
