"use client";

import { useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils/cn";
import type { Token } from "@/lib/utils/tokens";

/** Shows the live `prefers-reduced-motion` state of the viewer. */
export function MotionStatus() {
  const reduce = useReducedMotion();
  // True after hydration only: the server cannot know the preference.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const label = !mounted ? "detecting" : reduce ? "reduce" : "no-preference";
  return (
    <div
      data-testid="motion-status"
      data-reduced={mounted ? String(Boolean(reduce)) : "unknown"}
      className="border-line bg-surface inline-flex items-center gap-3 rounded-xs border px-3 py-2 text-sm"
    >
      <span className="text-ink-subtle font-mono text-xs">
        prefers-reduced-motion
      </span>
      <Tag variant={reduce ? "accent" : "primary"} size="sm">
        {label}
      </Tag>
    </div>
  );
}

/** Animates one dot per easing token across a track. */
export function EasingDemo({ easings }: { easings: Token[] }) {
  const [run, setRun] = useState(false);
  return (
    <div>
      <div className="space-y-4">
        {easings.map((t) => (
          <div key={t.name} className="grid items-center gap-3 md:grid-cols-12">
            <div className="font-mono text-xs md:col-span-4">
              <p className="text-ink">{t.name.replace("--ease-", "ease-")}</p>
              <p className="text-ink-subtle">{t.value}</p>
            </div>
            <div className="relative h-8 md:col-span-8">
              <div className="bg-line-strong absolute top-1/2 right-0 left-0 h-px" />
              <div
                className="bg-primary duration-slower absolute top-1/2 size-3 -translate-y-1/2 rounded-full"
                style={{
                  left: run ? "calc(100% - 0.75rem)" : "0%",
                  transitionProperty: "left",
                  transitionTimingFunction: `var(${t.name})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="mt-6"
        icon={<RotateCcw />}
        iconPosition="start"
        onClick={() => setRun((r) => !r)}
      >
        {run ? "Return" : "Play"}
      </Button>
    </div>
  );
}

/** Fills one bar per duration token so relative timing is visible. */
export function DurationDemo({ durations }: { durations: Token[] }) {
  const [run, setRun] = useState(false);
  return (
    <div>
      <div className="space-y-3">
        {durations.map((t) => (
          <div key={t.name} className="grid items-center gap-3 md:grid-cols-12">
            <div className="font-mono text-xs md:col-span-4">
              <p className="text-ink">{t.name.replace("--", "")}</p>
              <p className="text-ink-subtle">{t.value}</p>
            </div>
            <div className="bg-surface-muted h-2 overflow-hidden rounded-xs md:col-span-8">
              <div
                className="bg-primary ease-standard h-full"
                style={{
                  width: run ? "100%" : "0%",
                  transitionProperty: "width",
                  transitionDuration: `var(${t.name})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="mt-6"
        icon={<RotateCcw />}
        iconPosition="start"
        onClick={() => setRun((r) => !r)}
      >
        {run ? "Reset" : "Play"}
      </Button>
    </div>
  );
}

/** Remounts three staggered Reveal blocks. */
export function RevealDemo() {
  const [key, setKey] = useState(0);
  return (
    <div>
      <div key={key} className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Reveal key={i} delay={i * 90} amount={0.1}>
            <div
              data-testid="reveal-item"
              className="border-line bg-surface rounded-xs border p-5"
            >
              <p className="text-ink-subtle font-mono text-xs">
                delay {i * 90}ms
              </p>
              <p className="font-display text-display-xs text-ink mt-2">
                Item {i + 1}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="mt-6"
        icon={<RotateCcw />}
        iconPosition="start"
        onClick={() => setKey((k) => k + 1)}
      >
        Replay
      </Button>
    </div>
  );
}

/** Remounts an AnimatedNumber so the count-up can be replayed. */
export function CounterDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex flex-wrap items-end gap-8">
      <div key={key} className="flex flex-wrap gap-10">
        <div>
          <p
            data-testid="counter-a"
            className="font-display text-display-lg text-ink leading-none tracking-tight"
          >
            <AnimatedNumber value={1284} />
          </p>
          <p className="text-ink-muted mt-2 text-sm">integer</p>
        </div>
        <div>
          <p className="font-display text-display-lg text-ink leading-none tracking-tight">
            <AnimatedNumber value={42.7} decimals={1} suffix="%" />
          </p>
          <p className="text-ink-muted mt-2 text-sm">one decimal, suffix</p>
        </div>
        <div>
          <p className="font-display text-display-lg text-ink leading-none tracking-tight">
            <AnimatedNumber value={3.2} decimals={1} prefix="$" suffix="bn" />
          </p>
          <p className="text-ink-muted mt-2 text-sm">prefix + suffix</p>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        icon={<RotateCcw />}
        iconPosition="start"
        onClick={() => setKey((k) => k + 1)}
      >
        Replay
      </Button>
    </div>
  );
}

/** Interactive Button states, for the components section. */
export function ButtonStates() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => setCount((c) => c + 1)}>Clicked {count}</Button>
      <Button variant="secondary" disabled>
        Disabled
      </Button>
      <span className={cn("text-ink-muted text-sm")}>
        Focus with the keyboard to see the ring.
      </span>
    </div>
  );
}
