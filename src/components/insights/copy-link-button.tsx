"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type CopyLinkButtonProps = {
  url: string;
  /**
   * Visible text. With a label the button is a text link ("Copy link" →
   * "Copied") and draws no icon; without one it is an icon button with a
   * "Copied" tooltip.
   */
  label?: string;
  className?: string;
};

/** Copies the article URL; announces the result for screen readers. */
export function CopyLinkButton({ url, label, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  // Cleanup only: the timer itself is set from the click handler, not here,
  // so nothing calls setState synchronously inside the effect body.
  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  if (label) {
    return (
      <button
        type="button"
        className={cn("hit-area cursor-pointer", className)}
        onClick={onClick}
      >
        <span
          role="status"
          aria-live="polite"
          className={cn(
            "duration-fast ease-standard transition-colors",
            copied && "text-primary",
          )}
        >
          {copied ? "Copied" : label}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn("relative", className)}
      aria-label={copied ? "Link copied" : "Copy link"}
      onClick={onClick}
    >
      <span aria-hidden className="relative inline-flex size-4">
        <Link2
          strokeWidth={1.75}
          className={cn(
            "duration-fast ease-standard absolute inset-0 transition-opacity",
            copied ? "opacity-0" : "opacity-100",
          )}
        />
        <Check
          strokeWidth={1.75}
          className={cn(
            "text-primary duration-fast ease-standard absolute inset-0 transition-opacity",
            copied ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "bg-ink text-canvas duration-fast ease-standard pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-xs px-2 py-1 text-xs font-medium whitespace-nowrap transition-[opacity,transform] motion-reduce:transform-none",
          copied ? "translate-y-0 opacity-100" : "-translate-y-0.5 opacity-0",
        )}
      >
        Copied
      </span>
    </button>
  );
}
