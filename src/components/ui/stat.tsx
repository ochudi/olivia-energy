import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { AnimatedNumber } from "./animated-number";

export type StatTrend = {
  direction: "up" | "down" | "flat";
  label: string;
};

export type StatProps = {
  value: number;
  label: ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  description?: ReactNode;
  trend?: StatTrend;
  /** Disable the count-up (value renders immediately). */
  animate?: boolean;
  size?: "md" | "lg";
  className?: string;
};

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const;

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
  trend,
  animate = true,
  size = "md",
  className,
}: StatProps) {
  const TrendIcon = trend ? trendIcon[trend.direction] : null;
  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <div className={cn("border-line flex flex-col border-t pt-5", className)}>
      <div
        className={cn(
          "font-display text-ink leading-none font-normal tracking-tight",
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
      {trend && TrendIcon ? (
        <span
          className={cn(
            "mt-3 inline-flex items-center gap-1 font-sans text-xs font-medium tabular-nums",
            trend.direction === "down" ? "text-ink-muted" : "text-primary",
          )}
        >
          <TrendIcon aria-hidden className="size-3.5" />
          {trend.label}
        </span>
      ) : null}
    </div>
  );
}
