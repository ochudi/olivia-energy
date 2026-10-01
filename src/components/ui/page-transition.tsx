"use client";

import { useEffect, useState, type ReactNode } from "react";

let hasLoadedOnce = false;

/**
 * PageTransition — wraps each page (via the (site) template, which re-mounts
 * on navigation). The fade-and-lift runs on client-side navigations only:
 * the site's first paint is never faded in, so nothing is hidden before
 * hydration and Largest Contentful Paint is measured on the real hero.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasLoadedOnce);
  useEffect(() => {
    hasLoadedOnce = true;
  }, []);
  return (
    <div className={animate ? "animate-page-enter" : undefined}>{children}</div>
  );
}
