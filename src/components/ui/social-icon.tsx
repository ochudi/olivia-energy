import type { SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

export type SocialIconName = "linkedin" | "instagram" | "x";

/**
 * SocialIcon — LinkedIn, Instagram and X marks drawn in the same 1.5px
 * stroke language as the lucide set (which no longer ships brand icons).
 * Decorative by default: the parent link carries the accessible name.
 */
export function SocialIcon({
  name,
  className,
  ...rest
}: { name: SocialIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("size-4.5 shrink-0", className)}
      {...rest}
    >
      {name === "linkedin" ? (
        <>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </>
      ) : name === "instagram" ? (
        <>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </>
      ) : (
        <>
          <path d="M4 4l16 16" />
          <path d="M20 4l-6.4 6.4" />
          <path d="M10.4 13.6 4 20" />
        </>
      )}
    </svg>
  );
}
