"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { CONTACT, HEADER_COPY, NAV, NAV_CTA } from "@/content/site";
import { MARK_MONO_PATH, MARK_VIEWBOX } from "@/lib/brand/mark";
import { cn } from "@/lib/utils/cn";
import { parseDurationSeconds, readCssToken } from "@/lib/utils/motion";
import { useReducedMotion } from "@/lib/utils/use-motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Unified focus ring for every custom control in the header. */
const RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
/** Tailwind `lg`: the desktop navigation appears here and the menu closes. */
const DESKTOP_QUERY = "(min-width: 64rem)";
/** Regions made inert while the mobile menu is open. */
const OUTSIDE_IDS = ["content", "site-footer"];
/** Regions whose [data-surface] elements the header reads. */
const SURFACE_ROOTS =
  "#content [data-surface], #site-footer[data-surface], #site-footer [data-surface]";
/**
 * A surface counts for the header only when it runs edge to edge under it
 * (a page band, a pinned scene's layer, the sticky chapter bar, the footer),
 * within this many px. Tiles, covers and figure plates sit inside the
 * container, so they keep data-surface for their own colours but never
 * repaint the header: on a phone, where a tile is nearly as wide as the
 * screen, the header no longer flashes red, green, night and lime as tiles
 * pass under it (client review P1-1). Two half-width panels that read as
 * one band say so with data-header-surface on their section.
 */
const FULL_BLEED_SLACK = 1;
/**
 * A surface marked data-header-priority (the What we do chapter bar,
 * sticky directly under the header) wins over any other surface in the
 * band, whatever the document order.
 */
const PRIORITY_ATTR = "data-header-priority";
/**
 * data-header-surface="<surface>" on a surface element tells the header
 * which colour to take while that element wins, when its own data-surface
 * is not what shows under the header's edge (the home opening once the
 * green flood covers the photograph; the About vision and mission split,
 * whose two half-width panels are each too narrow to count).
 */
const OVERRIDE_ATTR = "data-header-surface";

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** "page" on the page itself; "true" on its section's link from a child page. */
function ariaCurrent(pathname: string, href: string) {
  if (!isCurrent(pathname, href)) return undefined;
  return pathname === href ? "page" : "true";
}

/** Of the candidates, the innermost; among equals, the last in the document. */
function innermost(candidates: Element[]): Element | undefined {
  const leaves = candidates.filter(
    (el) => !candidates.some((other) => other !== el && el.contains(other)),
  );
  return leaves[leaves.length - 1];
}

/**
 * Surface protocol (build spec 2.8): every section declares data-surface.
 * One IntersectionObserver watches them with a root margin that leaves a
 * 1 px band at the header's bottom edge; the innermost full-bleed surface in that
 * band is written to the header as data-on, and globals.css maps data-on to
 * the header's background, text, line and logo colours. Written straight
 * to the DOM, so scrolling never re-renders React. Re-scans when the page's
 * sections change (client navigation, streamed content) and on resize.
 */
function useSurfaceUnderHeader(
  headerRef: React.RefObject<HTMLElement | null>,
  pathname: string,
) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof IntersectionObserver === "undefined") return;

    const hits = new Set<Element>();
    let observer: IntersectionObserver | null = null;
    let frame = 0;

    const write = () => {
      const right = document.documentElement.clientWidth - FULL_BLEED_SLACK;
      const wide = Array.from(hits).filter((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.left > FULL_BLEED_SLACK || rect.right < right) return false;
        // A surface laid over another but not shown yet (a pinned scene's
        // later layer at opacity 0) does not count until it appears.
        const style = getComputedStyle(el);
        return style.visibility !== "hidden" && Number(style.opacity) >= 0.5;
      });
      const first = wide.filter((el) => el.hasAttribute(PRIORITY_ATTR));
      const winner = innermost(first.length > 0 ? first : wide);
      const surface =
        winner?.getAttribute(OVERRIDE_ATTR) ??
        winner?.getAttribute("data-surface");
      if (surface) header.dataset.on = surface;
      else delete header.dataset.on;
    };

    const build = () => {
      observer?.disconnect();
      hits.clear();
      const edge = Math.round(header.getBoundingClientRect().height);
      const below = Math.max(0, window.innerHeight - edge - 1);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) hits.add(entry.target);
            else hits.delete(entry.target);
          }
          write();
        },
        // The 1 px row just below the header's bottom edge, so a sticky
        // bar pinned at top: header overlaps it rather than touching it.
        { rootMargin: `-${edge}px 0px -${below}px 0px`, threshold: 0 },
      );
      document
        .querySelectorAll(SURFACE_ROOTS)
        .forEach((el) => observer?.observe(el));
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    };

    // Layers that fade in while pinned change no intersection, so the
    // winner is re-read once a frame while scrolling and when a transition
    // ends (a handful of elements: cheap).
    let tick = 0;
    const rewrite = () => {
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(write);
    };

    build();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", rewrite, { passive: true });
    document.addEventListener("transitionend", rewrite, { passive: true });
    const content = document.getElementById("content");
    // New sections rebuild the observer; a changed data-header-surface
    // (written by a scene's own frame loop) only re-reads the winner.
    const mutations = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) schedule();
      else rewrite();
    });
    if (content) {
      mutations.observe(content, {
        childList: true,
        subtree: true,
        attributeFilter: [OVERRIDE_ATTR],
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(tick);
      observer?.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", rewrite);
      document.removeEventListener("transitionend", rewrite);
    };
  }, [headerRef, pathname]);
}

/**
 * SiteHeader — fixed chrome for every public page (creative brief 3.1).
 *
 *  • Takes the surface beneath its bottom edge (data-on, see above), with a
 *    1 px line in that surface's line colour. Transparent while the page is
 *    at the top and its first section carries data-hero, in that hero's own
 *    surface values (paper button on a red or green hero, never lime).
 *    Before hydration CSS reads the hero's surface itself; without
 *    scripting the header is never transparent (globals.css). JS only
 *    reports data-scrolled from window.scrollY and data-on from the
 *    observer.
 *  • Desktop: the four links (current page underlined, aria-current) and
 *    the "Start a conversation" button.
 *  • Phone: a "Menu" pill opening a full-screen green flood: the four links
 *    in display-lg, the button, the email. Focus is trapped, the rest of the
 *    page is inert, Escape closes, focus returns to the pill. It closes on
 *    navigation (and on a tap on the current page's link) and when the
 *    viewport reaches lg. Enter and exit are CSS keyframes (globals.css).
 */
export function SiteHeader({
  email = CONTACT.email,
}: {
  /** The contact email from settings; the static default if omitted. */
  email?: string;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  // Storing the path the menu was opened on closes it on any navigation
  // without an effect: a different pathname simply no longer matches.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const open = openAt === pathname;

  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const exitTimer = useRef(0);

  useSurfaceUnderHeader(headerRef, pathname);

  const openMenu = useCallback(() => {
    window.clearTimeout(exitTimer.current);
    setExiting(false);
    setOpenAt(pathname);
  }, [pathname]);
  const closeMenu = useCallback(
    (returnFocus: boolean) => {
      restoreFocus.current = returnFocus;
      setOpenAt(null);
      if (reduce) return;
      setExiting(true);
      window.clearTimeout(exitTimer.current);
      exitTimer.current = window.setTimeout(
        () => setExiting(false),
        Math.round(
          parseDurationSeconds(readCssToken("--duration-fast"), 0.16) * 1000,
        ),
      );
    },
    [reduce],
  );

  useEffect(() => () => window.clearTimeout(exitTimer.current), []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const gutter = window.innerWidth - root.clientWidth;
    const previous = {
      overflow: root.style.overflow,
      paddingRight: root.style.paddingRight,
    };
    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;

    const outside = OUTSIDE_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    outside.forEach((el) => el.setAttribute("inert", ""));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab" || !headerRef.current) return;
      const focusable = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside =
        active instanceof Node && headerRef.current.contains(active);
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const toggle = toggleRef.current;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu(false);
    };
    desktop.addEventListener("change", onViewportChange);

    return () => {
      root.style.overflow = previous.overflow;
      root.style.paddingRight = previous.paddingRight;
      outside.forEach((el) => el.removeAttribute("inert"));
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onViewportChange);
      if (restoreFocus.current) {
        restoreFocus.current = false;
        toggle?.focus();
      }
    };
  }, [open, closeMenu]);

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled}
      data-menu-open={open}
      className="site-header h-header fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)]"
      // Named for the route transition: the header is pinned in place
      // while the page beneath it changes (globals.css, "Page to page").
      style={{ viewTransitionName: "site-header" }}
    >
      <Container className="relative z-10 flex h-full items-center justify-between gap-8">
        <Link
          href="/"
          className={cn(
            "tap flex shrink-0 rounded-xs text-[1.375rem] leading-none",
            RING,
          )}
        >
          {/* True colours on paper, paper-deep and night; one colour on the
              floods, photographs, a dark hero and the open menu (the
              surface's --brand-mark-* variables, globals.css). */}
          <Logo />
          <span className="sr-only">, home</span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          <nav aria-label="Primary">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => {
                const current = isCurrent(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={ariaCurrent(pathname, item.href)}
                      className={cn(
                        "text-ink tap duration-fast ease-standard relative inline-flex items-center rounded-xs py-2 text-[0.9375rem] font-medium transition-opacity",
                        RING,
                        // The current page: a 2 px underline in currentColor.
                        "after:duration-base after:absolute after:inset-x-0 after:bottom-0.5 after:h-0.5 after:origin-left after:bg-current after:transition-transform after:ease-out",
                        current
                          ? "after:scale-x-100"
                          : "after:scale-x-0 hover:opacity-75 hover:after:scale-x-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Button
            href={NAV_CTA.href}
            size="sm"
            aria-current={ariaCurrent(pathname, NAV_CTA.href)}
          >
            {NAV_CTA.label}
          </Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? "site-menu" : undefined}
          onClick={() => (open ? closeMenu(true) : openMenu())}
          className={cn(
            "rounded-pill tap border-line-strong text-ink hover:border-ink active:duration-instant duration-fast ease-standard -mr-1 inline-flex h-10 min-w-22 items-center justify-center gap-2 border px-4 text-sm font-medium transition-colors active:translate-y-px motion-reduce:transform-none lg:hidden",
            RING,
          )}
        >
          <span
            aria-hidden="true"
            className="flex w-3.5 flex-col items-stretch gap-0.75"
          >
            <span
              className={cn(
                "duration-fast ease-standard h-px bg-current transition-transform",
                open && "translate-y-0.5 rotate-45",
              )}
            />
            <span
              className={cn(
                "duration-fast ease-standard h-px bg-current transition-transform",
                open && "-translate-y-0.5 -rotate-45",
              )}
            />
          </span>
          {open ? HEADER_COPY.close : HEADER_COPY.menu}
        </button>
      </Container>

      {open || exiting ? (
        <MobileMenu
          pathname={pathname}
          email={email}
          state={open ? "open" : "exiting"}
          onNavigate={() => closeMenu(false)}
        />
      ) : null}
    </header>
  );
}

function MobileMenu({
  pathname,
  email,
  state,
  onNavigate,
}: {
  pathname: string;
  email: string;
  state: "open" | "exiting";
  onNavigate: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  const itemStyle = (index: number) => ({ "--i": index }) as CSSProperties;

  return (
    <div
      ref={panelRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={HEADER_COPY.menu}
      aria-hidden={state === "exiting" ? true : undefined}
      tabIndex={-1}
      data-surface="green"
      data-state={state}
      className="site-menu bg-canvas text-ink fixed inset-0 overflow-y-auto outline-none lg:hidden"
    >
      {/* The ghosted mark, as on the close band: white at 7%, bleeding off
          the bottom right of the flood. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <svg
          viewBox={MARK_VIEWBOX}
          focusable="false"
          className="absolute right-0 bottom-0 h-[62%] w-auto translate-x-[28%] translate-y-[12%] text-white opacity-[0.07]"
        >
          <path d={MARK_MONO_PATH} fill="currentColor" />
        </svg>
      </div>
      <Container className="pt-header relative flex min-h-full flex-col pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
        <nav aria-label="Primary" className="pt-6">
          <ul>
            {NAV.map((item, index) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li
                  key={item.href}
                  className="site-menu-item border-line border-b first:border-t"
                  style={itemStyle(index)}
                >
                  <Link
                    href={item.href}
                    aria-current={ariaCurrent(pathname, item.href)}
                    onClick={current ? onNavigate : undefined}
                    className={cn(
                      "font-display text-display-lg active:duration-instant duration-fast ease-standard flex items-baseline justify-between gap-5 rounded-xs py-4 font-normal transition-opacity active:opacity-70",
                      RING,
                    )}
                  >
                    <span
                      className={cn(
                        "decoration-2 underline-offset-[0.14em]",
                        current && "underline",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-menu-item mt-10" style={itemStyle(NAV.length)}>
          <Button
            href={NAV_CTA.href}
            size="lg"
            aria-current={ariaCurrent(pathname, NAV_CTA.href)}
            onClick={pathname === NAV_CTA.href ? onNavigate : undefined}
          >
            {NAV_CTA.label}
          </Button>
        </div>

        <div
          className="site-menu-item mt-auto pt-12"
          style={itemStyle(NAV.length + 1)}
        >
          <a
            href={`mailto:${email}`}
            className={cn(
              "link-underline active:duration-instant inline-block rounded-xs text-lg break-all",
              RING,
            )}
          >
            {email}
          </a>
        </div>
      </Container>
    </div>
  );
}
