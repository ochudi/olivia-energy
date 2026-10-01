"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global motion guard. `reducedMotion="user"` makes every framer-motion
 * animation in the tree honour `prefers-reduced-motion` (transforms and
 * layout animations are skipped; opacity-only changes remain).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
