"use client";

import { useRef, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * Replays every reveal inside it: puts each `[data-reveal]` back to its
 * pre-state (and each `.light` line to unlit), forces a reflow, then flips
 * them to visible again. The motion itself is the production CSS; this only
 * rewinds the attributes the observer writes.
 */
export function Replay({
  children,
  className,
  label = "Replay",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function play() {
    const root = ref.current;
    if (!root) return;
    const revealed = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const lit = root.querySelectorAll<HTMLElement>(".light");
    revealed.forEach((el) => {
      el.dataset.reveal = "hidden";
    });
    lit.forEach((el) => {
      el.dataset.lit = "false";
    });
    void root.offsetHeight;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        revealed.forEach((el) => {
          el.dataset.reveal = "visible";
        });
        lit.forEach((el) => {
          el.dataset.lit = "true";
        });
      }),
    );
  }

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div ref={ref}>{children}</div>
      <div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RotateCcw />}
          iconPosition="start"
          onClick={play}
        >
          {label}
        </Button>
      </div>
    </div>
  );
}
