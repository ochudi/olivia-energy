"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ignitionEligible } from "./eligible";
import type { IgnitionCanvas } from "./ignition-canvas";

/**
 * The canvas and its shaders are a separate chunk, imported in the effect
 * below only on an eligible device, in parallel with the points file. A
 * plain import() does what next/dynamic would here (the canvas renders only
 * after a client-side decision) without shipping the loadable runtime in
 * this always-loaded wrapper.
 */
const loadCanvas = () =>
  import("./ignition-canvas").then((m) => m.IgnitionCanvas);

/** The baked particle targets (scripts/bake-mark-points.mjs). */
const POINTS_URL = "/data/mark-points.bin";
/** If the canvas has not started by then, the vector mark plays instead. */
const DEADLINE_MS = 1500;

let pointsRequest: Promise<ArrayBuffer> | null = null;
function loadPoints(): Promise<ArrayBuffer> {
  pointsRequest ??= fetch(POINTS_URL).then((r) =>
    r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status}`)),
  );
  // A failed fetch is not cached: a later page view may try again.
  pointsRequest.catch(() => {
    pointsRequest = null;
  });
  return pointsRequest;
}

type IgnitionState = "running" | "done" | "skipped";

/**
 * Ignition (About hero): on capable desktops, sparks in
 * the three colours of the mark converge into it, then the canvas hands
 * over to the vector mark and stops. Everywhere else it marks its host
 * `skipped` and loads nothing, and the host's own stroke draw-in plays.
 *
 * Protocol (build spec 2.9): render inside `[data-ignition-host]`, next to
 * the SVG mark (class `ignition-mark`), as `<IgnitionLazy className=
 * "absolute inset-0" />`. This component writes `data-ignition` on that
 * host: `running` before the first frame, `done` when the vector mark
 * takes over, `skipped` when it does not run.
 */
export function IgnitionLazy({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const run = useRef({ started: false, over: false });
  const [stage, setStage] = useState<{
    Canvas: typeof IgnitionCanvas;
    points: Promise<ArrayBuffer>;
  } | null>(null);

  const mark = useCallback((state: IgnitionState) => {
    root.current
      ?.closest<HTMLElement>("[data-ignition-host]")
      ?.setAttribute("data-ignition", state);
  }, []);

  useEffect(() => {
    const host = root.current?.closest<HTMLElement>("[data-ignition-host]");
    if (!host) return;
    run.current = { started: false, over: false };
    if (!ignitionEligible(host)) {
      mark("skipped");
      return;
    }
    let live = true;
    const points = loadPoints();
    loadCanvas().then(
      (Canvas) => {
        if (live && !run.current.over) setStage({ Canvas, points });
      },
      () => {
        if (live && !run.current.over) {
          run.current.over = true;
          mark("skipped");
        }
      },
    );
    const deadline = window.setTimeout(() => {
      if (run.current.started) return;
      run.current.over = true;
      mark("skipped");
      setStage(null);
    }, DEADLINE_MS);
    return () => {
      live = false;
      window.clearTimeout(deadline);
    };
  }, [mark]);

  /** Called by the canvas just before its first frame; false if too late. */
  const start = useCallback(() => {
    if (run.current.over) return false;
    run.current.started = true;
    mark("running");
    return true;
  }, [mark]);

  /** Called when the canvas begins its cross-fade to the vector mark. */
  const settle = useCallback(() => mark("done"), [mark]);

  /** Called when the canvas has stopped (finished, failed or lost). */
  const end = useCallback(() => {
    const { started, over } = run.current;
    run.current.over = true;
    if (!over) mark(started ? "done" : "skipped");
    setStage(null);
  }, [mark]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
    >
      {stage && (
        <stage.Canvas
          points={stage.points}
          onStart={start}
          onSettle={settle}
          onEnd={end}
        />
      )}
    </div>
  );
}
