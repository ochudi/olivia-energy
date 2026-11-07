import { describe, expect, it } from "vitest";
import {
  BRAND,
  SCRIM_FLOORS,
  SURFACE_PAIRS,
  composite,
  contrastRatio,
  failingPairs,
  formatRatio,
  greyOfLuminance,
  parseColor,
  relativeLuminance,
  wcagLevel,
} from "./contrast";

describe("parseColor", () => {
  it("reads hex in three, six and eight digits", () => {
    expect(parseColor("#fff")).toEqual([255, 255, 255, 1]);
    expect(parseColor("#04923F")).toEqual([4, 146, 63, 1]);
    expect(parseColor("#04923f99")).toEqual([4, 146, 63, 0x99 / 255]);
  });
  it("reads rgb() and rgba() with commas, spaces or a slash", () => {
    expect(parseColor("rgb(11, 31, 20)")).toEqual([11, 31, 20, 1]);
    expect(parseColor("rgba(11,31,20,.14)")).toEqual([11, 31, 20, 0.14]);
    expect(parseColor("rgb(11 31 20 / 50%)")).toEqual([11, 31, 20, 0.5]);
  });
  it("returns null for anything else", () => {
    expect(parseColor("var(--color-ink)")).toBeNull();
    expect(parseColor("#12345")).toBeNull();
    expect(parseColor("ink")).toBeNull();
  });
});

describe("relativeLuminance and composite", () => {
  it("has white at 1 and black at 0", () => {
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 6);
    expect(relativeLuminance([0, 0, 0])).toBe(0);
  });
  it("flattens a translucent colour onto its background", () => {
    expect(composite([0, 0, 0, 0.5], [255, 255, 255])).toEqual([
      127.5, 127.5, 127.5,
    ]);
    expect(composite([10, 20, 30, 1], [255, 255, 255])).toEqual([10, 20, 30]);
  });
  it("greyOfLuminance inverts relativeLuminance", () => {
    for (const l of [0.18, 0.22, 0.3, 0.5]) {
      const grey = parseColor(greyOfLuminance(l));
      expect(grey).not.toBeNull();
      const [r, g, b] = grey as readonly [number, number, number, number];
      expect(relativeLuminance([r, g, b])).toBeCloseTo(l, 2);
    }
  });
});

describe("contrastRatio", () => {
  it("gives 21:1 for black on white and 1:1 for the same colour", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 2);
    expect(contrastRatio("#04923F", "#04923F")).toBe(1);
  });
  it("is symmetric", () => {
    expect(contrastRatio(BRAND.ink, BRAND.paper)).toBeCloseTo(
      contrastRatio(BRAND.paper, BRAND.ink),
      6,
    );
  });
  it("composites a translucent foreground before measuring", () => {
    const solid = contrastRatio(BRAND.ink, BRAND.paper);
    const faint = contrastRatio("rgba(11, 31, 20, 0.14)", BRAND.paper);
    expect(faint).toBeLessThan(solid);
    expect(faint).toBeLessThan(1.5);
  });
  it("returns 1 when a colour cannot be parsed", () => {
    expect(contrastRatio("var(--x)", "#fff")).toBe(1);
  });
  it("formats to one decimal, rounding down, and grades to WCAG levels", () => {
    expect(formatRatio(4.49)).toBe("4.4:1");
    expect(formatRatio(15.13)).toBe("15.1:1");
    expect(wcagLevel(7)).toBe("AAA");
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(3)).toBe("AA Large");
    expect(wcagLevel(2.99)).toBe("Fail");
  });
});

describe("the surface table", () => {
  it("covers every surface", () => {
    const surfaces = new Set(SURFACE_PAIRS.map((p) => p.surface));
    for (const s of [
      "paper",
      "paper-deep",
      "night",
      "green",
      "lime",
      "red",
      "photo",
    ]) {
      expect(surfaces.has(s as never)).toBe(true);
    }
  });

  it.each(SURFACE_PAIRS.map((p) => [p.surface, p.role, p] as const))(
    "%s: %s meets its threshold",
    (_surface, _role, pair) => {
      const ratio = contrastRatio(pair.foreground, pair.background);
      expect(ratio).toBeGreaterThanOrEqual(pair.minimum);
    },
  );

  it.each(
    SURFACE_PAIRS.filter((p) => p.stated !== undefined).map(
      (p) => [p.surface, p.role, p] as const,
    ),
  )("%s: %s matches the ratio the design states", (_surface, _role, pair) => {
    const ratio = contrastRatio(pair.foreground, pair.background);
    // DESIGN.md rounds to one decimal below 10:1 and to a whole number above.
    const stated = pair.stated as number;
    expect(Math.abs(ratio - stated)).toBeLessThan(stated >= 10 ? 0.5 : 0.1);
  });

  it("has no failing pair", () => {
    expect(failingPairs()).toEqual([]);
  });

  it("reports a pair that fails", () => {
    expect(
      failingPairs([
        {
          surface: "paper",
          role: "Lime text on paper (forbidden)",
          foreground: BRAND.lime,
          background: BRAND.paper,
          minimum: 4.5,
        },
      ]),
    ).toHaveLength(1);
  });

  it("documents the rules the design gives as exceptions", () => {
    // Subtle ink is only 4.2:1 on paper-deep, so paper-deep uses the muted step.
    expect(contrastRatio("#5E6D63", BRAND.paperDeep)).toBeLessThan(4.5);
    expect(contrastRatio("#4A5A50", BRAND.paperDeep)).toBeGreaterThanOrEqual(
      4.5,
    );
    // Green text on the deep field passes only as large text.
    const greenDeep = contrastRatio(BRAND.floodGreen, BRAND.paperDeep);
    expect(greenDeep).toBeGreaterThanOrEqual(3);
    expect(greenDeep).toBeLessThan(4.5);
    // Lime is never text on paper, green or red.
    expect(contrastRatio(BRAND.lime, BRAND.paper)).toBeLessThan(3);
    expect(contrastRatio(BRAND.lime, BRAND.floodGreen)).toBeLessThan(3);
    expect(contrastRatio(BRAND.lime, BRAND.red)).toBeLessThan(3);
    // Red reaches 4.5:1 on the field by a hair, which leaves no margin for
    // the browser's rendering, so small red text still uses red ink (5.7:1).
    expect(contrastRatio(BRAND.red, BRAND.paper)).toBeLessThan(4.6);
    expect(contrastRatio(BRAND.redInk, BRAND.paper)).toBeGreaterThanOrEqual(
      5.5,
    );
    // The scrim floors are the exact thresholds for white and pale lime.
    expect(
      contrastRatio(BRAND.white, greyOfLuminance(SCRIM_FLOORS.body)),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(BRAND.white, greyOfLuminance(SCRIM_FLOORS.heading)),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(BRAND.limePale, greyOfLuminance(SCRIM_FLOORS.turn)),
    ).toBeGreaterThanOrEqual(3);
  });
});
