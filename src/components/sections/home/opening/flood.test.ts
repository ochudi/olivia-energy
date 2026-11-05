import { describe, expect, it } from "vitest";
import { MARK_MONO_PATH } from "@/lib/brand/mark";
import {
  ANCHOR,
  FLOOD_PATH,
  P,
  easeInOut,
  floodFrame,
  floodProgress,
  floodScale,
  floodTransform,
} from "./flood";

const parse = (t: string) => {
  const m = t.match(/^translate\((-?[\d.]+) (-?[\d.]+)\) scale\((-?[\d.]+)\)$/);
  if (!m) throw new Error(`bad transform ${t}`);
  return { tx: Number(m[1]), ty: Number(m[2]), s: Number(m[3]) };
};

/* A stand-in for Path2D: the flame's broad lower body as a box around the
   anchor, wide enough that a large scale covers any stage. */
const insideBox = (x: number, y: number) =>
  x > ANCHOR.x - 8 &&
  x < ANCHOR.x + 8 &&
  y > ANCHOR.y - 20 &&
  y < ANCHOR.y + 20;

describe("flood geometry", () => {
  it("keeps the mark silhouette as the hole of one even-odd path", () => {
    expect(FLOOD_PATH.startsWith("M-2000 -2000H2072V2100H-2000Z")).toBe(true);
    expect(FLOOD_PATH.endsWith(MARK_MONO_PATH)).toBe(true);
  });

  it("eases from 0 to 1 symmetrically", () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5);
    expect(easeInOut(0.25) + easeInOut(0.75)).toBeCloseTo(1);
  });

  it("holds the flood open before 0.08 and closed after 0.42", () => {
    expect(floodProgress(0)).toBe(0);
    expect(floodProgress(P.floodFrom)).toBe(0);
    expect(floodProgress(P.floodTo)).toBe(1);
    expect(floodProgress(1)).toBe(1);
  });

  const stage = { w: 1440, h: 900 };
  const slot = { x: 881, y: 162, h: 576 };
  const frame = floodFrame(stage, slot, insideBox);

  it("finds a starting scale at which the hole covers the stage", () => {
    expect(frame.sf).toBeCloseTo(5.76);
    expect(frame.s0).toBeGreaterThan(frame.sf * 10);
    for (const [x, y] of [
      [0, 0],
      [stage.w, 0],
      [0, stage.h],
      [stage.w, stage.h],
    ] as const) {
      const mx = ANCHOR.x + (x - frame.ax) / frame.s0;
      const my = ANCHOR.y + (y - frame.ay) / frame.s0;
      expect(insideBox(mx, my)).toBe(true);
    }
  });

  it("lands the mark exactly on the slot at the end", () => {
    const { tx, ty, s } = parse(floodTransform(frame, 1));
    expect(s).toBeCloseTo(frame.sf, 3);
    expect(tx).toBeCloseTo(slot.x, 1);
    expect(ty).toBeCloseTo(slot.y, 1);
  });

  it("shrinks monotonically", () => {
    let last = Infinity;
    for (let e = 0; e <= 1.0001; e += 0.05) {
      const s = floodScale(frame, Math.min(1, e));
      expect(s).toBeLessThanOrEqual(last);
      last = s;
    }
  });
});
