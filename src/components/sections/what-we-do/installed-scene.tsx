"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The gate of the pinned scene, the same query as the CSS (brief 2.8).
 * Below it (phones, tablets, short screens, reduced motion) the plate is
 * static in its final state and nothing here runs.
 */
const PINNED_QUERY =
  "(scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 640px)";

/**
 * A step is current once its top passes this fraction of the viewport.
 * 0.65, not 0.55 (client review P2-1): the plate changes as the step's
 * heading enters the lower third, so it never lags the text being read.
 */
const LINE = 0.65;

/**
 * InstalledScene — the step controller of Fig. 2 (What we do, chapter 02).
 * It writes one attribute, `data-step` (1 installed, 2 available, 3
 * delivered), on its own element, which the Waffle inside reads in CSS,
 * and `data-active` on the step texts (`[data-scene-step]`). Without
 * JavaScript, below the gate, or before hydration there is no `data-step`
 * and the Waffle shows its final state. One passive scroll listener and
 * one rAF a frame, attached only while the scene is near the viewport.
 */
export function InstalledScene({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const steps = Array.from(
      root.querySelectorAll<HTMLElement>("[data-scene-step]"),
    );
    const mq = window.matchMedia(PINNED_QUERY);
    let frame = 0;
    let listening = false;

    const update = () => {
      frame = 0;
      if (!mq.matches) return;
      const line = window.innerHeight * LINE;
      let step = 1;
      steps.forEach((el, i) => {
        if (i > 0 && el.getBoundingClientRect().top <= line) step = i + 1;
      });
      const value = String(step);
      if (root.dataset.step !== value) root.dataset.step = value;
      steps.forEach((el, i) => {
        const active = i + 1 === step ? "true" : "false";
        if (el.dataset.active !== active) el.dataset.active = active;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) window.addEventListener("scroll", schedule, { passive: true });
      else window.removeEventListener("scroll", schedule);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        listen(Boolean(entry?.isIntersecting) && mq.matches);
        if (entry?.isIntersecting && mq.matches) schedule();
      },
      { rootMargin: "50% 0px 50% 0px" },
    );

    const apply = () => {
      if (mq.matches) {
        update();
        observer.observe(root);
      } else {
        observer.disconnect();
        listen(false);
        delete root.dataset.step;
        for (const el of steps) delete el.dataset.active;
      }
    };
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", schedule);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
