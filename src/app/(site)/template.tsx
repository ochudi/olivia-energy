import { ViewTransition, type ReactNode } from "react";

/**
 * Re-mounts on every navigation (unlike a layout), so the page it wraps
 * leaves and arrives through React's ViewTransition (DESIGN.md, Motion;
 * the Next 16 view-transitions guide): `page-exit` fades the old page out,
 * `page-enter` fades and lifts the new one in, and the H1s, named
 * "page-headline" by <Display headline>, morph from one to the next. The
 * header is pinned by name in globals.css. Without the View Transitions
 * API the swap is instant. `default="none"` keeps the page still during
 * transitions that are not navigations.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
