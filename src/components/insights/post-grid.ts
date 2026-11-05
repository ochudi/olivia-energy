import { cn } from "@/lib/utils/cn";
import type { PostCardProps } from "./post-card";

/** Half the 1152 px measure at 1440: (1152 − 24) / 2 = 564 px. */
const HALF_SIZES =
  "(min-width: 81rem) 564px, (min-width: 48rem) 46vw, (min-resolution: 2.5dppx) calc((100vw - 40px) * 2 / 3), calc(100vw - 40px)";

/** The list classes that go with postGridCell: two columns at md, a six-track grid at lg. */
export const POST_GRID_CLASS =
  "grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-6";

/**
 * Where card `i` of `n` sits, so no row is left with one card (director
 * P1 14): rows of three at lg, and the remainder goes first, as one lead
 * card beside its cover (n % 3 = 1: 1, 4, 7 posts) or two half-width cards
 * (n % 3 = 2). At md (two columns) an odd count opens with a full-width
 * lead.
 */
export function postGridCell(
  i: number,
  n: number,
): { className: string; lead: PostCardProps["lead"]; sizes?: string } {
  const lgLead = i === 0 && n % 3 === 1;
  const lgHalf = i < 2 && n % 3 === 2;
  const mdLead = i === 0 && n % 2 === 1;
  return {
    lead: lgLead ? (mdLead ? "md" : "lg") : mdLead ? "md-only" : undefined,
    sizes: lgHalf && !mdLead ? HALF_SIZES : undefined,
    className: cn(
      mdLead && "md:col-span-2",
      lgLead ? "lg:col-span-6" : lgHalf ? "lg:col-span-3" : "lg:col-span-2",
    ),
  };
}
