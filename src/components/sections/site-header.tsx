"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { SocialIcon } from "@/components/ui/social-icon";
import { CONTACT, NAV, SITE, SOCIALS } from "@/content/site";
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

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * SiteHeader — fixed chrome for every public page.
 *
 *  • Solid (canvas + hairline, no blur) by default; transparent while the
 *    page is at the top and its first section carries `data-hero`. The
 *    switch is pure CSS (globals.css); JS only reports `data-scrolled`.
 *  • Over a dark hero, and while the menu is open, the header takes the
 *    inverse tone so every colour token remaps, and the logo turns from
 *    full colour to one colour with it.
 *  • The mobile menu is a full-screen dialog: focus is trapped, the rest of
 *    the page is made inert, Escape closes, focus returns to the toggle.
 *    It closes on navigation and when the viewport reaches `lg`. Its
 *    enter and exit are CSS keyframes (globals.css); the component only
 *    keeps the sheet mounted for the length of the exit token.
 */
export function SiteHeader() {
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
      className="site-header h-header fixed inset-x-0 top-0 z-50"
    >
      <Container
        size="wide"
        className="relative z-10 flex h-full items-center justify-between gap-8"
      >
        <Link
          href="/"
          className={cn(
            "flex shrink-0 rounded-xs text-[1.3125rem] leading-none md:text-[1.375rem]",
            RING,
          )}
        >
          {/* Full colour on the canvas; one colour (the header's ink) over a
              dark hero and while the menu is open, through the inverse tone. */}
          <Logo />
          <span className="sr-only">, home</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => {
              const current = isCurrent(pathname, item.href);
              const isCta = item.href === "/contact";
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "duration-fast ease-standard active:text-ink/60 relative inline-flex items-center rounded-xs font-medium tracking-[0.005em] transition-colors",
                      RING,
                      "after:absolute after:-bottom-0.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:transition-opacity",
                      isCta
                        ? "h-9 border px-4 text-sm"
                        : "text-ink/75 hover:text-ink py-2 text-[0.9375rem]",
                      isCta &&
                        (current
                          ? "border-ink"
                          : "border-ink/30 hover:border-ink hover:bg-ink/5"),
                      current
                        ? "text-ink after:bg-accent after:duration-base after:opacity-100 after:ease-out"
                        : "after:bg-ink/25 after:duration-fast after:ease-standard after:opacity-0 hover:after:opacity-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? "site-menu" : undefined}
          onClick={() => (open ? closeMenu(true) : openMenu())}
          className={cn(
            "text-ink hover:bg-ink/5 duration-fast ease-standard -mr-2 inline-flex size-11 items-center justify-center rounded-xs transition-colors lg:hidden",
            RING,
          )}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="relative inline-flex size-6">
            <Menu
              strokeWidth={1.5}
              className={cn(
                "duration-fast ease-standard absolute inset-0 transition-opacity",
                open ? "opacity-0" : "opacity-100",
              )}
            />
            <X
              strokeWidth={1.5}
              className={cn(
                "duration-fast ease-standard absolute inset-0 transition-opacity",
                open ? "opacity-100" : "opacity-0",
              )}
            />
          </span>
        </button>
      </Container>

      {open || exiting ? (
        <MobileMenu pathname={pathname} state={open ? "open" : "exiting"} />
      ) : null}
    </header>
  );
}

function MobileMenu({
  pathname,
  state,
}: {
  pathname: string;
  state: "open" | "exiting";
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
      aria-label="Site menu"
      aria-hidden={state === "exiting" ? true : undefined}
      tabIndex={-1}
      data-tone="inverse"
      data-state={state}
      className="site-menu bg-inverse text-ink fixed inset-0 overflow-y-auto outline-none lg:hidden"
    >
      <Container
        size="wide"
        className="pt-header flex min-h-full flex-col pb-8"
      >
        <nav aria-label="Primary" className="pt-4">
          <ul className="border-line border-t">
            {NAV.map((item, index) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li
                  key={item.href}
                  className="site-menu-item border-line border-b"
                  style={itemStyle(index)}
                >
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "font-display text-display-md hover:text-primary active:duration-instant duration-fast ease-standard flex items-baseline gap-5 rounded-xs py-4 tracking-tight transition-[color,opacity] active:opacity-70",
                      RING,
                    )}
                  >
                    <span className="text-ink-subtle font-mono text-xs tabular-nums">
                      0{index + 1}
                    </span>
                    <span className="relative">
                      {item.label}
                      {current ? (
                        <span
                          aria-hidden
                          className="bg-accent absolute top-1/2 -right-3.5 size-1 -translate-y-1/2 rounded-full"
                        />
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="site-menu-item mt-auto pt-12"
          style={itemStyle(NAV.length)}
        >
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
            <div>
              <p className="tracking-caps text-ink-muted text-xs font-medium uppercase">
                General enquiries
              </p>
              <a
                href={`mailto:${CONTACT.email}`}
                className={cn(
                  "hover:text-primary active:text-primary-hover active:duration-instant duration-fast ease-standard mt-2 inline-block rounded-xs text-lg transition-colors",
                  RING,
                )}
              >
                {CONTACT.email}
              </a>
              <p className="text-ink-muted mt-3 text-sm">
                {CONTACT.offices.join(" · ")}
              </p>
            </div>
            <ul className="flex gap-2" aria-label="Social">
              {SOCIALS.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${SITE.name} on ${social.label} (opens in a new tab)`}
                    className={cn(
                      "border-line text-ink-muted hover:border-line-strong hover:bg-surface-muted hover:text-ink active:duration-instant duration-fast ease-standard inline-flex size-11 items-center justify-center rounded-xs border transition-[color,border-color,background-color,transform] active:translate-y-px motion-reduce:transform-none",
                      RING,
                    )}
                  >
                    <SocialIcon name={social.id} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
