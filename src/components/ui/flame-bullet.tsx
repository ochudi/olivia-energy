import { MARK_PATHS } from "@/lib/brand/mark";
import { cn } from "@/lib/utils/cn";

/**
 * FlameBullet — the mark's flame (lime and red tongues as one silhouette)
 * in currentColor, sized to the text: the bullet before a Why Olivia line
 * and the mark in a flame eyebrow. The flame's own box in the mark is
 * 41 x 92 units; the viewBox trims the ring away.
 */
export function FlameBullet({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 41 92"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "flame-bullet inline-block h-[0.9em] w-auto shrink-0",
        className,
      )}
    >
      <path d={MARK_PATHS.flame} fill="currentColor" />
    </svg>
  );
}
