"use client";

import { useEffect, useRef } from "react";
import { MARK_MONO_PATH } from "@/lib/brand/mark";
import {
  P,
  clamp01,
  floodFrame,
  floodTransform,
  type FloodFrame,
} from "./flood";

/** The pinned layout's gate: the same query as the CSS (brief 2.8). */
export const PINNED_QUERY =
  "(scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 640px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

type Parts = {
  root: HTMLElement;
  stage: HTMLElement;
  flood: SVGGElement;
  slot: HTMLElement;
  heroCopy: HTMLElement;
  lines: HTMLElement[];
};

function setLit(el: HTMLElement, lit: boolean) {
  const value = lit ? "true" : "false";
  if (el.dataset.lit !== value) el.dataset.lit = value;
}

/**
 * Static layout (phones, tablets, reduced motion): each Why Olivia line
 * lights as it crosses 60% of the viewport and dims again below it. Lines
 * already above the band stay lit. Reduced motion leaves every line lit.
 */
function lighting({ lines }: Parts): () => void {
  if (window.matchMedia(REDUCE_QUERY).matches) return () => {};
  if (typeof IntersectionObserver === "undefined") return () => {};
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const top = entry.rootBounds?.top ?? 0;
        setLit(
          entry.target as HTMLElement,
          entry.isIntersecting || entry.boundingClientRect.bottom <= top,
        );
      }
    },
    { rootMargin: "0px 0px -40% 0px" },
  );
  for (const line of lines) observer.observe(line);
  return () => {
    observer.disconnect();
    for (const line of lines) delete line.dataset.lit;
  };
}

/**
 * Pinned layout (desktop, motion allowed, scripting on): one passive scroll
 * listener and one requestAnimationFrame write `--p` on the stage, the
 * phase in `data-step`, `data-lit` on the lines as they cross their
 * thresholds, and the flood's transform attribute. Everything else is CSS.
 * The listener is attached only while the opening is on screen.
 */
function pinned(parts: Parts): () => void {
  const { root, stage, flood, slot, heroCopy, lines } = parts;
  const ctx = document.createElement("canvas").getContext("2d");
  const mark = new Path2D(MARK_MONO_PATH);
  const inside = (x: number, y: number) =>
    ctx ? ctx.isPointInPath(mark, x, y) : false;

  let frame: FloodFrame | null = null;
  let top = 0;
  let range = 1;
  let raf = 0;
  let lastP = -1;
  let attached = false;

  const measure = () => {
    const rootRect = root.getBoundingClientRect();
    top = rootRect.top + window.scrollY;
    range = Math.max(1, root.offsetHeight - window.innerHeight);
    const stageRect = stage.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    frame = floodFrame(
      { w: stageRect.width, h: stageRect.height },
      {
        x: slotRect.left - stageRect.left,
        y: slotRect.top - stageRect.top,
        h: slotRect.height,
      },
      inside,
    );
    lastP = -1;
  };

  const render = () => {
    raf = 0;
    if (!frame) return;
    const p = clamp01((window.scrollY - top) / range);
    if (p === lastP) return;
    lastP = p;
    stage.style.setProperty("--p", p.toFixed(4));
    flood.setAttribute("transform", floodTransform(frame, p));
    const step = p < P.heroFadeTo ? "rest" : p < P.why ? "flood" : "why";
    if (stage.dataset.step !== step) {
      stage.dataset.step = step;
      // Once the hero copy has gone, the green flood covers the header's
      // side of the stage: the header takes green, not the photo's night.
      if (step === "rest") delete root.dataset.headerSurface;
      else root.dataset.headerSurface = "green";
    }
    lines.forEach((line, i) => {
      const at =
        i < lines.length - 1 ? P.firstLine + P.lineStep * i : P.closing;
      setLit(line, p >= at);
    });
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };
  const attach = () => {
    if (attached) return;
    attached = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };
  const detach = () => {
    if (!attached) return;
    attached = false;
    window.removeEventListener("scroll", onScroll);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const onResize = () => {
    measure();
    onScroll();
  };

  /* A hero link that takes focus while the copy is lifted away brings the
     page back to the top of the opening, so the focused link is visible. */
  const onFocus = (event: FocusEvent) => {
    if (!heroCopy.contains(event.target as Node)) return;
    if (window.scrollY - top > range * P.heroFadeFrom) {
      window.scrollTo({ top, behavior: "instant" });
    }
  };

  /* The first render can land mid-stage (a reload, scroll restoration or
     a scroll before hydration). The server HTML has every line lit, so
     without this the lines would visibly fade from lit to unlit before
     lighting one by one. `data-settling` turns their transitions off for
     that first frame only. */
  stage.dataset.settling = "";
  measure();
  render();
  stage.dataset.ready = "";
  let settle = requestAnimationFrame(() => {
    settle = requestAnimationFrame(() => {
      settle = 0;
      delete stage.dataset.settling;
    });
  });
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(stage);
  const viewObserver = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) attach();
    else detach();
  });
  viewObserver.observe(root);
  heroCopy.addEventListener("focusin", onFocus);

  return () => {
    detach();
    if (settle) cancelAnimationFrame(settle);
    delete stage.dataset.settling;
    resizeObserver.disconnect();
    viewObserver.disconnect();
    heroCopy.removeEventListener("focusin", onFocus);
    stage.style.removeProperty("--p");
    delete stage.dataset.step;
    delete stage.dataset.ready;
    delete root.dataset.headerSurface;
    flood.removeAttribute("transform");
    for (const line of lines) delete line.dataset.lit;
  };
}

/**
 * OpeningMotion — the home opening's only client code. It renders nothing
 * visible: it finds the opening around it and runs the pinned stage or the
 * line lighting, switching when the media query changes. Server HTML is the
 * final state (every line lit, hero copy visible) until this runs.
 */
export function OpeningMotion() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-opening]");
    if (!root) return;
    const stage = root.querySelector<HTMLElement>("[data-stage]");
    const flood = root.querySelector<SVGGElement>("[data-flood]");
    const slot = root.querySelector<HTMLElement>("[data-mark-slot]");
    const heroCopy = root.querySelector<HTMLElement>("[data-hero-copy]");
    if (!stage || !flood || !slot || !heroCopy) return;
    const parts: Parts = {
      root,
      stage,
      flood,
      slot,
      heroCopy,
      lines: Array.from(root.querySelectorAll<HTMLElement>("[data-line]")),
    };

    const query = window.matchMedia(PINNED_QUERY);
    const reduce = window.matchMedia(REDUCE_QUERY);
    let cleanup = () => {};
    const setup = () => {
      cleanup();
      cleanup = query.matches ? pinned(parts) : lighting(parts);
    };
    setup();
    query.addEventListener("change", setup);
    reduce.addEventListener("change", setup);
    return () => {
      query.removeEventListener("change", setup);
      reduce.removeEventListener("change", setup);
      cleanup();
    };
  }, []);

  return <span ref={ref} hidden />;
}
