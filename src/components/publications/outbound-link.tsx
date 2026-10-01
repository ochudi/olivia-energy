import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { PUBLICATIONS } from "@/content/publications";
import { cn } from "@/lib/utils/cn";

/** True for a Google Scholar URL on any regional host. */
function isScholarUrl(url: string): boolean {
  try {
    return /(^|\.)scholar\.google\./i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** "Read on Google Scholar" for Scholar links; a neutral label otherwise. */
export function readLabel(url: string): string {
  return isScholarUrl(url)
    ? PUBLICATIONS.read.scholar
    : PUBLICATIONS.read.other;
}

export type OutboundLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * An external link that opens in a new tab: arrow-up-right icon, a screen
 * reader note, and no referrer.
 */
export function OutboundLink({ href, children, className }: OutboundLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/link hit-area text-ink hover:text-primary active:text-primary-hover active:duration-instant duration-fast ease-standard focus-visible:ring-focus focus-visible:ring-offset-canvas inline-flex items-center gap-1.5 rounded-xs text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <span className="link-underline">{children}</span>
      <ArrowUpRight
        aria-hidden
        className="duration-fast ease-standard size-4 shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transform-none"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
