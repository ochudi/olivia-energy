"use client";

import { useLinkStatus } from "next/link";

/**
 * Invisible marker rendered inside a filter chip's <Link>. `useLinkStatus`
 * only works inside a Link, so it lives in its own small client component;
 * it flags the chip as pending via a data attribute so the list (a plain
 * server component) can dim itself with a `:has()` selector — no lifted
 * state, no client boundary around the list itself.
 */
export function ChipPendingMarker() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      data-pending={pending ? "true" : undefined}
      className="hidden"
    />
  );
}
