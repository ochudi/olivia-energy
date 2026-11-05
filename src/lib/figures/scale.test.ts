import { describe, expect, it } from "vitest";
import {
  areaPath,
  bandPath,
  dotsPath,
  fixed,
  linear,
  linePath,
  log10,
  logTicks,
  rectsPath,
  ticks,
} from "./scale";

const pts = [
  [2000, 43.2],
  [2006, 50.9],
  [2012, 55.6],
  [2018, 56.5],
  [2024, 62.5],
] as const;

describe("linear", () => {
  it("maps the domain ends to the range ends and interpolates between", () => {
    const s = linear([2000, 2024], [76, 940]);
    expect(s(2000)).toBe(76);
    expect(s(2024)).toBe(940);
    expect(s(2012)).toBe(508);
  });

  it("inverts a range for a y axis and extrapolates outside the domain", () => {
    const y = linear([0, 100], [548, 14]);
    expect(y(0)).toBe(548);
    expect(y(100)).toBe(14);
    expect(y(50)).toBe(281);
    expect(y(110)).toBeCloseTo(-39.4, 6);
  });

  it("collapses to the range start on a zero-width domain", () => {
    expect(linear([5, 5], [0, 10])(7)).toBe(0);
  });
});

describe("log10", () => {
  it("places powers of ten evenly", () => {
    const s = log10([0.1, 100], [300, 0]);
    expect(s(0.1)).toBeCloseTo(300);
    expect(s(1)).toBeCloseTo(200);
    expect(s(10)).toBeCloseTo(100);
    expect(s(100)).toBeCloseTo(0);
  });

  it("rejects a non-positive domain", () => {
    expect(() => log10([0, 10], [0, 1])).toThrow();
  });
});

describe("ticks", () => {
  it("picks round steps of 1, 2 or 5 and clamps to the domain", () => {
    expect(ticks([0, 100], 4)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(ticks([2000, 2024], 4)).toEqual([2000, 2005, 2010, 2015, 2020]);
    expect(ticks([0, 1.5e9], 3)).toEqual([0, 5e8, 1e9, 1.5e9]);
    expect(ticks([0.1, 0.5], 4)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
  });

  it("returns the single value for a degenerate domain", () => {
    expect(ticks([3, 3], 5)).toEqual([3]);
  });

  it("reverses for a descending domain", () => {
    expect(ticks([100, 0], 2)).toEqual([100, 50, 0]);
  });

  it("gives powers of ten for a log axis", () => {
    expect(logTicks([0.1, 200])).toEqual([0.1, 1, 10, 100]);
  });
});

describe("fixed", () => {
  it("drops trailing zeros and never prints -0", () => {
    expect(fixed(12.0)).toBe("12");
    expect(fixed(12.34)).toBe("12.3");
    expect(fixed(-0.04)).toBe("0");
    expect(fixed(1.25, 2)).toBe("1.25");
  });
});

describe("paths", () => {
  const x = linear([2000, 2024], [76, 940]);
  const y = linear([0, 100], [548, 14]);

  it("linePath snapshot (one decimal)", () => {
    expect(linePath(pts, x, y)).toMatchInlineSnapshot(
      `"M76 317.3L292 276.2L508 251.1L724 246.3L940 214.3"`,
    );
  });

  it("linePath honours the precision argument", () => {
    expect(linePath(pts.slice(0, 2), x, y, 0)).toBe("M76 317L292 276");
    expect(linePath([], x, y)).toBe("");
  });

  it("bandPath closes the region between two lines", () => {
    const upper = [
      [2000, 78.3],
      [2024, 91.9],
    ] as const;
    expect(bandPath(upper, pts.slice(0, 2), x, y)).toMatchInlineSnapshot(
      `"M76 129.9L940 57.3L292 276.2L76 317.3Z"`,
    );
    expect(bandPath([], pts, x, y)).toBe("");
  });

  it("areaPath drops to the baseline and back", () => {
    expect(areaPath(pts.slice(0, 3), 0, x, y)).toMatchInlineSnapshot(
      `"M76 317.3L292 276.2L508 251.1L508 548L76 548Z"`,
    );
  });

  it("dotsPath draws every dot as two arcs in one string", () => {
    const d = dotsPath(
      [
        [5, 5],
        [15, 5],
      ],
      3.2,
    );
    expect(d).toMatchInlineSnapshot(
      `"M1.8 5a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0M11.8 5a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0"`,
    );
    expect(d.match(/M/g)).toHaveLength(2);
  });

  it("rectsPath draws every square as a closed subpath", () => {
    expect(
      rectsPath(
        [
          [0, 0],
          [30, 0],
        ],
        24,
        24,
      ),
    ).toBe("M0 0h24v24h-24ZM30 0h24v24h-24Z");
  });
});
