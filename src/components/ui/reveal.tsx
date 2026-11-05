"use client";

import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { useInView, useReducedMotion } from "@/lib/utils/use-motion";

export type RevealVariant =
  "fade" | "mask" | "wipe" | "draw" | "sweep" | "close";

export type RevealProps = {
  children: ReactNode;
  /**
   * Which motion plays (creative brief 2.8). `fade` moves the block itself;
   * `mask` clips a display heading up from its baseline; `wipe` clips a
   * photograph up (its image carries `wipe-inner`); both clip an inner
   * wrapper so the observed element keeps its full box; `draw`, `sweep` and
   * `close` only set the state, and the strokes inside (`draw`, `sweep`,
   * `hatch`, `pop`, `ring-close`) respond.
   */
  variant?: RevealVariant;
  /** Stagger offset in milliseconds. */
  delay?: number;
  /** Animate only the first time. */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger (0–1). Defaults per variant. */
  amount?: number;
  as?:
    | "div"
    | "section"
    | "article"
    | "li"
    | "figure"
    | "h1"
    | "h2"
    | "h3"
    | "p"
    | "span";
  className?: string;
  style?: CSSProperties;
  id?: string;
};

/** Trigger thresholds from the brief's motion table. */
const AMOUNT: Record<RevealVariant, number> = {
  fade: 0.15,
  mask: 0.2,
  wipe: 0.2,
  draw: 0.3,
  sweep: 0.3,
  close: 0.5,
};

const VARIANT_CLASS: Record<RevealVariant, string> = {
  fade: "reveal-fade",
  mask: "reveal-mask",
  wipe: "reveal-wipe",
  draw: "reveal-draw",
  sweep: "reveal-sweep",
  close: "reveal-close",
};

/**
 * Reveal — plays one of the scroll reveals as the block enters the viewport.
 *
 * How it stays honest:
 *  • Server HTML is the final state (`data-reveal="static"`): no-JS users and
 *    crawlers never see hidden content. The pre-state is written to the
 *    element in a layout effect before first paint, and only if the block is
 *    still below the fold: an above-the-fold H1 is never masked or faded.
 *  • The state lives on the element, not in React state, so nothing
 *    re-renders as blocks scroll in; the observer only flips an attribute.
 *  • With `prefers-reduced-motion: reduce` the block renders static (checked
 *    in JS via `useReducedMotion` and again in CSS by the global rule).
 *  • Durations, easings and distances are the CSS tokens; the variant classes
 *    live in globals.css ("Scroll reveals").
 *  • Visibility comes from a plain IntersectionObserver (no animation
 *    library ships with the public site).
 */
export function Reveal({
  children,
  variant = "fade",
  delay = 0,
  once = true,
  amount,
  as = "div",
  className,
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {
    once,
    amount: amount ?? AMOUNT[variant],
    margin: "0px 0px -8% 0px",
  });
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
  const delayStyle = delay
    ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties)
    : undefined;
  // The clip of `mask` and `wipe` sits on an inner wrapper, not on the
  // observed element: Chromium measures intersection on the clipped box, so
  // an element clipped to nothing would never cross its threshold.
  const inner =
    variant === "mask" ? (
      <span className="mask-clip block">{children}</span>
    ) : variant === "wipe" ? (
      <span className="wipe-clip relative block h-full w-full">{children}</span>
    ) : (
      children
    );
  return (
    <Tag
      ref={ref as never}
      id={id}
      data-reveal="static"
      data-reveal-variant={variant}
      style={delayStyle || style ? { ...delayStyle, ...style } : undefined}
      className={cn(
        VARIANT_CLASS[variant],
        "motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none",
        className,
      )}
    >
      {inner}
    </Tag>
  );
}
