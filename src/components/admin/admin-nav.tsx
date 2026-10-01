"use client";

import {
  BookMarked,
  FileText,
  Inbox,
  LayoutDashboard,
  Settings2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/publications", label: "Publications", icon: BookMarked },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/team", label: "Team", icon: Users },
] as const;

/** Sidebar navigation with the current section marked. */
export function AdminNav({ unread }: { unread?: number }) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  // On phones the nav scrolls horizontally, so the active item can start
  // off-screen. Centre it by scrolling the list itself; scrollIntoView would
  // also scroll every ancestor, including the window sideways on narrow
  // screens. This only reads and writes the DOM, so a layout effect is safe.
  useLayoutEffect(() => {
    const item = activeRef.current;
    const list = item?.closest("ul");
    if (!item || !list || list.scrollWidth <= list.clientWidth) return;
    const target = item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2;
    list.scrollLeft = Math.max(0, target);
  }, [pathname]);

  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ITEMS.map((item) => {
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                ref={active ? activeRef : undefined}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "duration-instant ease-standard focus-visible:ring-focus focus-visible:ring-offset-canvas active:bg-ink/[0.06] flex h-9 items-center gap-2.5 rounded-xs px-2.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  active
                    ? "bg-surface-muted text-ink shadow-[inset_2px_0_0_var(--color-primary)]"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                <Icon
                  aria-hidden
                  className="size-4 shrink-0"
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
                {item.href === "/admin/inbox" && unread ? (
                  <span className="bg-primary-soft text-primary-soft-fg ml-auto rounded-xs px-1.5 font-mono text-[0.6875rem] tabular-nums">
                    {unread}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
