"use client";

import { useEffect, useRef } from "react";
import { MARK_COLORS, MARK_HEIGHT, MARK_WIDTH } from "@/lib/brand/mark";
import { FRAGMENT, VERTEX } from "./shaders";

type Props = {
  points: Promise<ArrayBuffer>;
  /** Just before the first frame; returns false when it is too late to run. */
  onStart: () => boolean;
  /** When the cross-fade to the vector mark begins. */
  onSettle: () => void;
  /** When the loop has stopped and the context is released (or it failed). */
  onEnd: () => void;
};

/** Seconds; every particle is in place (to the pixel) by about 1.85 s. */
const PACE = 1.15;
/** The canvas's cross-fade to the vector mark, in ms. */
const FADE_MS = 450;
/** Ring sparks swirl about the ring's centre; flame sparks rise from its root. */
const RING_PIVOT = [36, 65.4] as const;
const FLAME_PIVOT = [17, 92] as const;

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];

/** Unpacks the baked binary into interleaved targets and colour indices. */
function parse(buf: ArrayBuffer) {
  const view = new DataView(buf);
  if (buf.byteLength < 8 || view.getUint32(0) !== 0x4f454d31) return null;
  const count = view.getUint16(4, true);
  const pitch = view.getUint16(6, true) / 1000;
  if (buf.byteLength < 8 + count * 3) return null;
  const bytes = new Uint8Array(buf, 8);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const c = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const v = bytes[i * 3] | (bytes[i * 3 + 1] << 8) | (bytes[i * 3 + 2] << 16);
    x[i] = ((v & 2047) / 2047) * MARK_WIDTH;
    y[i] = (((v >> 11) & 2047) / 2047) * MARK_HEIGHT;
    c[i] = (v >> 22) & 3;
  }
  return { count, pitch, x, y, c };
}

/** Where the canvas sits around its host, in CSS px: wide enough for the sparks, never past the viewport. */
function measure(host: HTMLElement) {
  const box = host.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const padX = box.width * 0.55;
  const left = Math.min(padX, Math.max(0, box.left));
  const right = Math.min(padX, Math.max(0, vw - box.right));
  const padY = box.height * 0.14;
  const scale = Math.min(box.width / MARK_WIDTH, box.height / MARK_HEIGHT);
  return {
    left: -left,
    top: -padY,
    width: box.width + left + right,
    height: box.height + padY * 2,
    // The mark's box inside the canvas (the SVG centres it the same way).
    markX: left + (box.width - MARK_WIDTH * scale) / 2,
    markY: padY + (box.height - MARK_HEIGHT * scale) / 2,
    scale,
  };
}

/** Builds the vertex data: target, start, colour, delay, duration and spin per spark. */
function build(
  p: NonNullable<ReturnType<typeof parse>>,
  frame: ReturnType<typeof measure>,
) {
  const data = new Float32Array(p.count * 8);
  // The canvas in mark units, for the ring sparks' starting ellipse.
  const cx = (frame.width / 2 - frame.markX) / frame.scale;
  const cy = (frame.height / 2 - frame.markY) / frame.scale;
  const ax = (frame.width / 2 / frame.scale) * 0.94;
  const ay = (frame.height / 2 / frame.scale) * 0.94;
  // The ring assembles clockwise from its upper tip; angles unwrapped past the gap.
  const angle = (i: number) => {
    const a = Math.atan2(p.y[i] - RING_PIVOT[1], p.x[i] - RING_PIVOT[0]);
    return a < -1.75 ? a + Math.PI * 2 : a;
  };
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < p.count; i++) {
    if (p.c[i] !== 2) continue;
    const a = angle(i);
    lo = Math.min(lo, a);
    hi = Math.max(hi, a);
  }
  let settle = 0;
  for (let i = 0; i < p.count; i++) {
    const r = Math.random();
    const o = i * 8;
    let sx: number;
    let sy: number;
    let delay: number;
    let dur: number;
    let spin: number;
    if (p.c[i] === 2) {
      const t = Math.random() * Math.PI * 2;
      const k = 0.62 + 0.38 * Math.sqrt(Math.random());
      sx = cx + Math.cos(t) * ax * k;
      sy = cy + Math.sin(t) * ay * k;
      delay = 0.42 * ((angle(i) - lo) / (hi - lo || 1)) + 0.06 * r;
      dur = 0.95 + 0.25 * Math.random();
      spin = 1.05 + 0.5 * Math.random();
    } else {
      // Flame sparks leave the flame's root and rise, bottom first: lime after red.
      const t = Math.random() * Math.PI * 2;
      const k = 7 * Math.sqrt(Math.random());
      sx = FLAME_PIVOT[0] + Math.cos(t) * k;
      sy = FLAME_PIVOT[1] + Math.abs(Math.sin(t)) * k * 0.6;
      const rise = 1 - p.y[i] / MARK_HEIGHT;
      delay = (p.c[i] === 1 ? 0.24 : 0.36) + 0.3 * rise + 0.06 * r;
      dur = 0.85 + 0.25 * Math.random();
      spin = -0.2 - 0.25 * Math.random();
    }
    delay *= PACE;
    dur *= PACE;
    data.set([p.x[i], p.y[i], sx, sy, p.c[i], delay, dur, spin], o);
    // By 70% of its run a spark is within a fraction of a pixel of home.
    settle = Math.max(settle, delay + dur * 0.7);
  }
  return { data, settle };
}

/**
 * The Ignition canvas: one WebGL1 program, one static buffer, GL_POINTS.
 * No pointer interaction, no idle drift; DPR capped at 2. It runs once,
 * cross-fades to the vector mark, stops its loop and releases the context.
 */
export function IgnitionCanvas({ points, onStart, onSettle, onEnd }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.closest<HTMLElement>("[data-ignition-host]");
    if (!canvas || !host) return;
    let alive = true;
    let raf = 0;
    let timer = 0;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let observer: ResizeObserver | null = null;

    const release = () => {
      if (!alive) return;
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      observer?.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      if (gl && !gl.isContextLost()) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      gl = null;
    };
    const fail = () => {
      if (!alive) return;
      release();
      onEnd();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      fail();
    };

    points
      .then((buf) => {
        if (!alive) return;
        const parsed = parse(buf);
        if (!parsed) return fail();
        gl = canvas.getContext("webgl", {
          alpha: true,
          antialias: false,
          depth: false,
          premultipliedAlpha: true,
          powerPreference: "high-performance",
        });
        if (!gl) return fail();
        canvas.addEventListener("webglcontextlost", lost);

        const compile = (type: number, src: string) => {
          const s = gl!.createShader(type)!;
          gl!.shaderSource(s, src);
          gl!.compileShader(s);
          return s;
        };
        const vs = compile(gl.VERTEX_SHADER, VERTEX);
        const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
        program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fail();
        gl.useProgram(program);

        let frame = measure(host);
        const { data, settle } = build(parsed, frame);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const attrib = (name: string, offset: number) => {
          const at = gl!.getAttribLocation(program!, name);
          gl!.enableVertexAttribArray(at);
          gl!.vertexAttribPointer(at, 4, gl!.FLOAT, false, 32, offset);
        };
        attrib("aPos", 0);
        attrib("aMeta", 16);

        const u = (name: string) => gl!.getUniformLocation(program!, name);
        const uTime = u("uTime");
        const uView = u("uView");
        const uBox = u("uBox");
        const uDpr = u("uDpr");
        const uSize = u("uSize");
        gl.uniform4f(u("uPivots"), ...RING_PIVOT, ...FLAME_PIVOT);
        gl.uniform3f(u("uLime"), ...rgb(MARK_COLORS.lime));
        gl.uniform3f(u("uRed"), ...rgb(MARK_COLORS.red));
        gl.uniform3f(u("uGreen"), ...rgb(MARK_COLORS.green));
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        const resize = () => {
          if (!gl) return;
          frame = measure(host);
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          Object.assign(canvas.style, {
            left: `${frame.left}px`,
            top: `${frame.top}px`,
            width: `${frame.width}px`,
            height: `${frame.height}px`,
          });
          canvas.width = Math.round(frame.width * dpr);
          canvas.height = Math.round(frame.height * dpr);
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.uniform2f(uView, frame.width, frame.height);
          gl.uniform3f(uBox, frame.markX, frame.markY, frame.scale);
          gl.uniform1f(uDpr, canvas.width / frame.width);
          // Dots at rest overlap a little, so the mark reads solid.
          gl.uniform1f(uSize, parsed.pitch * frame.scale * 1.75);
        };
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(host);

        if (!onStart()) {
          release();
          return;
        }
        let t0 = -1;
        let settled = false;
        const draw = (now: number) => {
          if (!gl) return;
          if (t0 < 0) t0 = now;
          const t = (now - t0) / 1000;
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1f(uTime, t);
          gl.drawArrays(gl.POINTS, 0, parsed.count);
          if (!settled && t >= settle) {
            settled = true;
            canvas.style.opacity = "0";
            onSettle();
            timer = window.setTimeout(fail, FADE_MS + 40);
          }
          raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
      })
      .catch(fail);

    return release;
  }, [points, onStart, onSettle, onEnd]);

  return (
    <canvas
      ref={ref}
      className="absolute"
      style={{ transition: `opacity ${FADE_MS}ms ease-out` }}
    />
  );
}
