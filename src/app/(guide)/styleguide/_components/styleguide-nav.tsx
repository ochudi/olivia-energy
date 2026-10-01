"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type NavItem = { id: string; number: string; label: string };

export function StyleguideNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="Sections"
        className="sticky top-24 hidden self-start lg:block"
      >
        <ol className="border-line space-y-1 border-l">
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "duration-fast ease-standard -ml-px flex items-baseline gap-3 border-l py-1.5 pl-4 text-sm transition-colors",
                    isActive
                      ? "border-primary text-ink"
                      : "text-ink-muted hover:text-ink border-transparent",
                  )}
                >
                  <span className="text-ink-subtle font-mono text-[0.6875rem] tabular-nums">
                    {item.number}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile strip */}
      <nav
        aria-label="Sections"
        className="-mx-gutter border-line bg-canvas/95 sticky top-14 z-20 border-b lg:hidden"
      >
        <ol className="px-gutter flex [scrollbar-width:none] gap-1 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "duration-fast ease-standard inline-flex h-8 items-center gap-2 rounded-xs px-3 text-xs font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-ink text-canvas"
                      : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  <span className="font-mono text-[0.625rem] tabular-nums opacity-70">
                    {item.number}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
