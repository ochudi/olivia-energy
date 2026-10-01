"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/utils/use-motion";

/**
 * Currents — the hero's moving background: a hundred or so thin streamlines
 * drifting slowly along a coherent vector field in the mark's greens, the
 * way a wind map moves. The pointer parts the field gently around it. The
 * field thins to a quarter behind the text block so the words stay clear.
 *
 * Cost: one canvas, no library, about 1 ms a frame on a phone. Each
 * particle keeps a short ring buffer of positions and is redrawn as one
 * polyline every frame after a full clear, so nothing ever ghosts. It only
 * runs while the hero is on screen and the tab is visible, caps the pixel
 * ratio at 1.5 and the rate at 60 fps, and draws a single still frame when
 * the visitor prefers reduced motion, has Data Saver on, or is on a
 * low-powered device. It is `aria-hidden` and sits under the text, so it
 * adds nothing to the layout or to what a reader or a search engine sees.
 */

const TRAIL = 40; // points kept per particle
const RECORD_EVERY = 4; // frames between recorded points
const MAX_DPR = 1.5;
const AVOID_MARGIN = 40; // px around the text block where the field thins
const AVOID_ALPHA = 0.25;

type Particle = {
  x: number;
  y: number;
  life: number;
  max: number;
  speed: number;
  tone: 0 | 1;
  /** Ring buffer of past positions (x, y pairs) and the write index. */
  trail: Float32Array;
  head: number;
  count: number;
};

type Rect = { left: number; top: number; right: number; bottom: number };

function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/**
 * Direction of the field at (x, y) at time t: a drift rising gently left to
 * right, varying by about a third of a turn, meandering every few hundred
 * pixels. Layered sines are smooth and cheap.
 */
function fieldAngle(x: number, y: number, t: number): number {
  const a =
    Math.sin(x * 0.0055 + t * 0.00012) * Math.cos(y * 0.0045 - t * 0.0001);
  const b = Math.sin((x + y) * 0.0012 + t * 0.00006);
  const c = Math.cos(x * 0.0009 - y * 0.0016 + t * 0.00008);
  return -0.28 + (a + b * 0.6 + c * 0.4) * 0.3;
}

function lowPower(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return (
    nav.connection?.saveData === true ||
    (typeof nav.hardwareConcurrency === "number" &&
      nav.hardwareConcurrency <= 2)
  );
}

export function HeroCurrents({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = reduced || lowPower();
    const colours = [
      readToken("--color-green-500", "#04923f"),
      readToken("--color-green-300", "#79d88d"),
    ];
    const alphas = [0.4, 0.3];
    const avoidEl = host.querySelector<HTMLElement>("[data-currents-avoid]");
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let avoid: Rect | null = null;
    let frame = 0;
    let last = 0;
    let running = false;
    let visible = true;
    let onScreen = true;
    const pointer = { x: -1e4, y: -1e4, at: -1e4 };

    const spawn = (p: Partial<Particle> = {}): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      life: 0,
      max: 240 + Math.random() * 240,
      speed: 0.3 + Math.random() * 0.4,
      tone: Math.random() < 0.85 ? 0 : 1,
      trail: new Float32Array(TRAIL * 2),
      head: 0,
      count: 0,
      ...p,
    });

    const respawn = (p: Particle) => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.life = 0;
      p.max = 240 + Math.random() * 240;
      p.speed = 0.3 + Math.random() * 0.4;
      p.head = 0;
      p.count = 0;
    };

    const measureAvoid = () => {
      if (!avoidEl) return;
      const h = host.getBoundingClientRect();
      const r = avoidEl.getBoundingClientRect();
      avoid = {
        left: r.left - h.left - AVOID_MARGIN,
        top: r.top - h.top - AVOID_MARGIN,
        right: r.right - h.left + AVOID_MARGIN,
        bottom: r.bottom - h.top + AVOID_MARGIN,
      };
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 1;
      const phone = width < 640;
      const count = Math.round(
        Math.min(
          phone ? 60 : 170,
          Math.max(phone ? 40 : 80, (width * height) / 11000),
        ),
      );
      particles = Array.from({ length: count }, () =>
        spawn({ life: Math.random() * 240 }),
      );
      measureAvoid();
      if (still) drawStill();
    };

    const inAvoid = (x: number, y: number) =>
      !!avoid &&
      x > avoid.left &&
      x < avoid.right &&
      y > avoid.top &&
      y < avoid.bottom;

    const advance = (dt: number, now: number) => {
      const scale = Math.min(dt / 16.7, 2.5);
      const since = now - pointer.at;
      const bend = since < 900 ? 1 - since / 900 : 0;
      const record = frame % RECORD_EVERY === 0;
      for (const p of particles) {
        const angle = fieldAngle(p.x, p.y, now);
        let vx = Math.cos(angle) * p.speed;
        let vy = Math.sin(angle) * p.speed;
        if (bend > 0) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist > 0.01) {
            // A gentle parting away from the pointer, strongest at its centre.
            const k = (1 - dist / 200) ** 2 * bend * 0.5;
            vx += (dx / dist) * k;
            vy += (dy / dist) * k;
          }
        }
        p.x += vx * scale;
        p.y += vy * scale;
        p.life += scale;
        if (record) {
          p.trail[p.head * 2] = p.x;
          p.trail[p.head * 2 + 1] = p.y;
          p.head = (p.head + 1) % TRAIL;
          if (p.count < TRAIL) p.count++;
        }
        if (
          p.life > p.max ||
          p.x < -8 ||
          p.y < -8 ||
          p.x > width + 8 ||
          p.y > height + 8
        ) {
          respawn(p);
        }
      }
      frame++;
    };

    /** Draws every trail as a polyline in three alpha bands, tail to head. */
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const bands = [0.35, 0.7, 1];
      for (let tone = 0; tone < 2; tone++) {
        for (let zone = 0; zone < 2; zone++) {
          for (let band = 0; band < 3; band++) {
            ctx.strokeStyle = colours[tone];
            ctx.globalAlpha =
              alphas[tone] * bands[band] * (zone ? AVOID_ALPHA : 1);
            ctx.beginPath();
            for (const p of particles) {
              if (p.tone !== tone || p.count < 2) continue;
              if (inAvoid(p.x, p.y) !== (zone === 1)) continue;
              const n = p.count;
              const from = Math.floor((n * band) / 3);
              const to = band === 2 ? n : Math.floor((n * (band + 1)) / 3) + 1;
              for (let i = from; i < to && i < n; i++) {
                const idx = ((p.head - n + i + TRAIL * 2) % TRAIL) * 2;
                const x = p.trail[idx];
                const y = p.trail[idx + 1];
                if (i === from) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawStill = () => {
      const t = 1e6;
      for (let i = 0; i < 300; i++) advance(16.7, t + i * 16.7);
      draw();
    };

    const loop = (now: number) => {
      if (!running) return;
      if (last && now - last < 15) {
        requestAnimationFrame(loop);
        return;
      }
      const dt = last ? now - last : 16.7;
      last = now;
      advance(dt, now);
      draw();
      requestAnimationFrame(loop);
    };

    const update = () => {
      const should = !still && visible && onScreen;
      if (should && !running) {
        running = true;
        last = 0;
        requestAnimationFrame(loop);
      } else if (!should) {
        running = false;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.at = performance.now();
    };
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      update();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? true;
        update();
      },
      { threshold: 0 },
    );
    const resizer = new ResizeObserver(() => resize());
    const avoidWatcher = avoidEl
      ? new ResizeObserver(() => measureAvoid())
      : null;

    resize();
    update();
    observer.observe(host);
    resizer.observe(host);
    if (avoidEl) avoidWatcher?.observe(avoidEl);
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      observer.disconnect();
      resizer.disconnect();
      avoidWatcher?.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
