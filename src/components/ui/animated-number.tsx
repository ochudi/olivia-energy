"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import {
  animateValue,
  cubicBezier,
  parseCubicBezier,
  parseDurationSeconds,
  readCssToken,
} from "@/lib/utils/motion";
import { useInView, useReducedMotion } from "@/lib/utils/use-motion";

export type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Override the `--duration-counter` token, in seconds. */
  duration?: number;
  locale?: string;
  /** Extra Intl.NumberFormat options (e.g. `{ notation: "compact" }`). */
  format?: Intl.NumberFormatOptions;
  /** Animate only the first time it enters the viewport. */
  once?: boolean;
  className?: string;
};

function makeFormatter(
  locale: string,
  decimals: number,
  format?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...format,
  });
}

/**
 * AnimatedNumber — counts from 0 to `value` when scrolled into view.
 *
 * Accessibility & robustness:
 *  • Server-renders the final value (crawlers / no-JS see the real number).
 *  • The count-up writes each frame straight to the text node, so React
 *    never re-renders during the tween.
 *  • Under `prefers-reduced-motion: reduce` it never animates.
 *  • Reads `--duration-counter` and `--ease-out` from the CSS tokens.
 *  • Uses tabular numerals so the width does not jitter while counting.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration,
  locale = "en-GB",
  format,
  once = true,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const hasAnimated = useRef(false);

  const formatter = makeFormatter(locale, decimals, format);
  const finalText = `${prefix}${formatter.format(value)}${suffix}`;
  const zeroText = `${prefix}${formatter.format(0)}${suffix}`;

  // Before first paint on the client: if the counter will run, show 0 so the
  // final value never flashes first. Written to the node, not to state.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduceMotion) node.textContent = finalText;
    else if (!hasAnimated.current) node.textContent = zeroText;
  }, [reduceMotion, finalText, zeroText]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion || !inView) return;
    if (once && hasAnimated.current) return;
    hasAnimated.current = true;
    const frameFormatter = makeFormatter(locale, decimals, format);
    const seconds =
      duration ?? parseDurationSeconds(readCssToken("--duration-counter"), 1.2);
    const ease = cubicBezier(...parseCubicBezier(readCssToken("--ease-out")));
    const controls = animateValue({
      from: 0,
      to: value,
      duration: seconds * 1000,
      ease,
      onUpdate: (v) => {
        node.textContent = `${prefix}${frameFormatter.format(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [
    inView,
    reduceMotion,
    value,
    duration,
    once,
    locale,
    decimals,
    format,
    prefix,
    suffix,
  ]);

  // Reserve the width of the final value (tabular digits are 1ch each) so
  // the count-up never shifts neighbouring layout.
  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums", className)}
      style={{ minWidth: `${finalText.length}ch` }}
    >
      {finalText}
    </span>
  );
}
