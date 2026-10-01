"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type ServiceNavItem = { slug: string; title: string };

export type ServiceNavProps = {
  items: readonly ServiceNavItem[];
  className?: string;
};

/**
 * In-page navigation for the service lines. Plain anchors (the browser's
 * smooth scroll and the targets' scroll-margin do the work); the active item
 * follows the section whose top has passed under the fixed header. On
 * desktop the caller makes it sticky; below `lg` it is a two-column list of
 * hairline rows at the top of the section.
 */
export function ServiceNav({ items, className }: ServiceNavProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector<HTMLElement>(".site-header");
      const threshold = (header?.getBoundingClientRect().height ?? 0) + 8;
      let current: string | null = null;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= threshold) current = el.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items]);

  return (
    <nav aria-label="Service lines" className={className}>
      <ol className="lg:border-line grid grid-cols-2 gap-x-6 lg:block lg:border-l">
        {items.map((item, index) => {
          const isActive = item.slug === active;
          return (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "border-line duration-fast ease-standard flex items-baseline gap-3 border-t py-3 text-sm transition-[color,border-color] lg:-ml-px lg:border-t-0 lg:border-l lg:py-2 lg:pl-5",
                  isActive
                    ? "text-ink lg:border-l-primary"
                    : "text-ink-muted hover:text-ink lg:border-l-transparent",
                )}
              >
                <span className="text-ink-muted font-mono text-xs tabular-nums">
                  0{index + 1}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
