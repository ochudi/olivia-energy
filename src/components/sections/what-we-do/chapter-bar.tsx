"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ChapterBarItem = {
  slug: string;
  /** "Transition" */
  short: string;
  /** The service's own glyph at 20 px, rendered by the server parent. */
  glyph: ReactNode;
};

export type ChapterBarProps = {
  items: readonly ChapterBarItem[];
  /** Accessible name of the navigation. */
  label: string;
  className?: string;
};

/**
 * ChapterBar — the six chapter links of What we do sticky under the fixed header on a paper strip. Adapted from
 * the first release's service-nav: plain anchors (the chapters'
 * scroll-margin clears the header and this bar), each with its service's
 * glyph and short name (the services are not a sequence, so no numbers;
 * DESIGN.md, Typography), and the current chapter is the last one whose top
 * has crossed the line 40% down the viewport (the bar's foot on a short
 * screen). The current link gets `aria-current="true"` and
 * the flood-green 2 px underline. On phones the row scrolls sideways and
 * keeps the current link in view.
 *
 * The state is written to the DOM, not React state, so scrolling never
 * re-renders; one passive listener and one rAF a frame.
 */
export function ChapterBar({ items, label, className }: ChapterBarProps) {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const list = listRef.current;
    if (!nav || !list) return;
    const targets = items
      .map((item) => document.getElementById(item.slug))
      .filter((el): el is HTMLElement => el !== null);
    const links = Array.from(
      list.querySelectorAll<HTMLAnchorElement>("a[data-chapter]"),
    );
    if (targets.length === 0) return;

    let frame = 0;
    let current: string | null | undefined;
    const update = () => {
      frame = 0;
      // The current line: 40% down the viewport, or the bar's foot on a
      // short screen, so a chapter takes the underline once it owns most of
      // the screen rather than the moment its top slides under the bar.
      const threshold = Math.max(
        nav.getBoundingClientRect().bottom + 2,
        window.innerHeight * 0.4,
      );
      let next: string | null = null;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= threshold) next = el.id;
      }
      // Past the last chapter's end, nothing is current.
      const last = targets[targets.length - 1];
      if (last && last.getBoundingClientRect().bottom <= threshold) next = null;
      if (next === current) return;
      current = next;
      for (const link of links) {
        const on = link.dataset.chapter === next;
        if (on) {
          link.setAttribute("aria-current", "true");
          // Keep the current link in the visible part of a scrolled row.
          if (list.scrollWidth > list.clientWidth) {
            const left = link.offsetLeft - list.clientWidth / 2;
            list.scrollTo({ left: Math.max(0, left + link.offsetWidth / 2) });
          }
        } else {
          link.removeAttribute("aria-current");
        }
      }
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
    <nav
      ref={navRef}
      aria-label={label}
      data-surface="paper"
      // Sticky right under the header: it wins over the chapter behind it.
      data-header-priority=""
      className={cn(
        "bg-canvas text-ink border-line top-header sticky z-30 border-y",
        className,
      )}
    >
      <div className="px-page max-w-page mx-auto">
        <ol
          ref={listRef}
          // Below 1024 the bar is a rail: its right edge fades so the cut
          // item reads as "more", and the rail ends with enough padding that
          // the last item clears the fade when scrolled to the end.
          className="-mx-gutter px-gutter flex [scrollbar-width:none] overflow-x-auto overscroll-x-contain [mask-image:linear-gradient(to_right,#000_calc(100%-4.5rem),transparent)] pr-12 lg:mx-0 lg:justify-between lg:overflow-visible lg:[mask-image:none] lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <li key={item.slug} className="shrink-0">
              <a
                href={`#${item.slug}`}
                data-chapter={item.slug}
                className={cn(
                  "group relative flex h-12 items-center gap-2.5 pr-6 text-[0.9375rem] font-medium whitespace-nowrap lg:h-13 lg:pr-0",
                  "text-ink-muted hover:text-ink aria-[current=true]:text-ink duration-fast ease-standard transition-colors",
                  "focus-visible:ring-focus focus-visible:ring-offset-canvas rounded-xs focus-visible:ring-2 focus-visible:outline-none",
                  // The 2 px underline sits on the bar's bottom line.
                  "after:bg-primary after:absolute after:right-6 after:-bottom-px after:left-0 after:h-0.5 after:origin-left after:scale-x-0 after:transition-transform after:duration-200 aria-[current=true]:after:scale-x-100 lg:after:right-0",
                )}
              >
                {item.glyph}
                <span>{item.short}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
