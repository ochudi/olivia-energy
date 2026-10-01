"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useInView, useReducedMotion } from "@/lib/utils/use-motion";

export type RevealProps = {
  children: ReactNode;
  /** Stagger offset in milliseconds. */
  delay?: number;
  /** Animate only the first time. */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger (0–1). */
  amount?: number;
  as?: "div" | "section" | "article" | "li" | "figure";
  className?: string;
};

/**
 * Reveal — fades and lifts content into place as it scrolls into view.
 *
 * How it stays honest:
 *  • Server HTML is fully visible (`data-reveal="static"`): no-JS users and
 *    crawlers never see hidden content. The hidden state is written to the
 *    element in a layout effect before first paint, so there is no flash.
 *  • The state lives on the element, not in React state, so nothing
 *    re-renders as blocks scroll in; the observer only flips an attribute.
 *  • With `prefers-reduced-motion: reduce` the block renders static (checked
 *    in JS via `useReducedMotion` and again in CSS via `motion-reduce:`).
 *  • Duration, easing and distance come from the CSS tokens
 *    (`--duration-reveal`, `--ease-out`, `--motion-reveal-distance`).
 *  • Visibility comes from a plain IntersectionObserver (no animation
 *    library ships with the public site).
 */
export function Reveal({
  children,
  delay = 0,
  once = true,
  amount = 0.2,
  as = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount, margin: "0px 0px -8% 0px" });
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (reduceMotion) {
      element.dataset.reveal = "static";
    } else if (inView) {
      element.dataset.reveal = "visible";
    } else {
      // Hide only what is still below the fold. If the reader scrolled past
      // this block before hydration, it must stay visible, not vanish.
      const belowFold =
        element.getBoundingClientRect().top > window.innerHeight;
      element.dataset.reveal = belowFold ? "hidden" : "static";
    }
  }, [reduceMotion, inView]);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      data-reveal="static"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "duration-reveal transition-[opacity,transform] ease-out will-change-[opacity,transform] motion-reduce:transition-none",
        "data-[reveal=hidden]:translate-y-[var(--motion-reveal-distance)] data-[reveal=hidden]:opacity-0",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
