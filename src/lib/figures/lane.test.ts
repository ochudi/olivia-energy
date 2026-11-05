import { describe, expect, it } from "vitest";
import { laneLayout, type LaneOptions } from "./lane";

const OPTS: LaneOptions = { refWidth: 272, mark: 7, gap: 4 };

/** Left edge in px of every mark at a given plate width. */
function boxes(xs: number[], width: number, opts = OPTS) {
  return laneLayout(xs, opts).map((m) => ({
    row: m.row,
    left: m.centre * width + m.offset - opts.mark / 2,
  }));
}

function overlaps(b: ReturnType<typeof boxes>, opts = OPTS) {
  const hits: string[] = [];
  for (let i = 0; i < b.length; i++)
    for (let j = i + 1; j < b.length; j++)
      if (
        b[i]!.row === b[j]!.row &&
        Math.abs(b[i]!.left - b[j]!.left) < opts.mark + opts.gap - 1e-9
      )
        hits.push(`${i}/${j}`);
  return hits;
}

describe("laneLayout", () => {
  it("leaves marks that do not touch at their true position, in row 0", () => {
    const out = laneLayout([0.1, 0.5, 0.9], OPTS);
    expect(out.map((m) => m.row)).toEqual([0, 0, 0]);
    expect(out.map((m) => m.offset)).toEqual([0, 0, 0]);
    expect(out.map((m) => m.centre)).toEqual([0.1, 0.5, 0.9]);
  });

  it("never stacks a burst more than two rows deep", () => {
    // Six op-eds in five weeks (23 Jun to 28 Jul 2025 on a 2022 to 2026 line).
    const burst = [0.6956, 0.6978, 0.7016, 0.7053, 0.7114, 0.7141];
    const out = laneLayout(burst, OPTS);
    expect(new Set(out.map((m) => m.row))).toEqual(new Set([0, 1]));
    expect(new Set(out.map((m) => m.centre)).size).toBe(1);
    // Date order is kept left to right.
    const offsets = out.map((m) => m.offset);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
  });

  it("keeps every mark clear at the reference width and every width above it", () => {
    const xs = [
      0.6956, 0.6978, 0.7016, 0.7053, 0.7114, 0.7141, 0.801, 0.8333, 0.8463,
      0.8882, 0.9382,
    ];
    for (const width of [272, 306, 400, 512, 640]) {
      expect(overlaps(boxes(xs, width))).toEqual([]);
    }
    // The wide layout (plates from 420 px) separates more marks and is
    // equally clear from its own reference width up.
    const wide = { ...OPTS, refWidth: 420 };
    for (const width of [420, 512, 649]) {
      expect(overlaps(boxes(xs, width, wide), wide)).toEqual([]);
    }
  });

  it("keeps clusters inside the lane", () => {
    const xs = [0, 0.001, 0.002, 0.998, 0.999, 1];
    for (const b of boxes(xs, 272)) {
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.left + OPTS.mark).toBeLessThanOrEqual(272 + 1e-9);
    }
  });
});
