import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { AnimatedNumber } from "./animated-number";

export type StatProps = {
  value: number;
  label: ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  description?: ReactNode;
  /** Disable the count-up (value renders immediately). */
  animate?: boolean;
  size?: "md" | "lg";
  className?: string;
};

/**
 * Stat — a headline figure with a label. Sits on a hairline so rows of stats
 * align without boxes. Numerals are serif display with tabular figures.
 */
export function Stat({
  value,
  label,
  prefix,
  suffix,
  decimals = 0,
  description,
  animate = true,
  size = "md",
  className,
}: StatProps) {
  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <div className={cn("border-line flex flex-col border-t pt-5", className)}>
      <div
        className={cn(
          "font-display text-ink numerals leading-none font-normal",
          size === "lg" ? "text-display-lg" : "text-display-md",
        )}
      >
        {animate ? (
          <AnimatedNumber
            value={value}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
          />
        ) : (
          <span className="tabular-nums">
            {prefix}
            {formatted}
            {suffix}
          </span>
        )}
      </div>
      <div className="text-ink mt-3 font-sans text-sm font-medium">{label}</div>
      {description ? (
        <p className="text-ink-muted mt-1 max-w-[28ch] text-sm leading-snug">
          {description}
        </p>
      ) : null}
    </div>
  );
}
