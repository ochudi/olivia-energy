"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const noopSubscribe = () => () => {};
const observerSupported = () => typeof IntersectionObserver !== "undefined";

function subscribeReduce(callback: () => void) {
  const query = window.matchMedia(REDUCE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

/** True when the user prefers reduced motion; false on the server. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false,
  );
}

export type InViewOptions = {
  /** Report only the first entry. */
  once?: boolean;
  /** Fraction of the element that must be visible (0–1). */
  amount?: number;
  /** rootMargin for the observer, e.g. "0px 0px -8% 0px". */
  margin?: string;
};

/**
 * Whether the element is in the viewport, via IntersectionObserver. Starts
 * false, so an element already on screen reports true on the first
 * observation (right after hydration) and can animate in.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { once = true, amount = 0, margin = "0px" }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);
  // Without an observer (very old browsers) everything counts as in view.
  const supported = useSyncExternalStore(
    noopSubscribe,
    observerSupported,
    () => true,
  );
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const visible =
          entry.isIntersecting &&
          (amount === 0 || entry.intersectionRatio >= amount);
        if (visible) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount, rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, amount, margin]);
  return supported ? inView : true;
}
