import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GlyphName } from "@/types/contracts";
import { Glyph, glyphStrokeWidth } from "./glyph";
import {
  GLYPH_DOT,
  GLYPH_NAMES,
  GLYPH_SIZE,
  GLYPH_STROKE,
  GLYPH_VIEWBOX,
  GLYPHS,
  type GlyphElement,
} from "./glyphs";

const EXPECTED: readonly GlyphName[] = [
  "transition",
  "economics-policy",
  "esg",
  "research-analytics",
  "capacity",
  "project",
  "research",
  "advisory",
  "innovation",
  "impact",
  "excellence",
  "integrity",
  "sustainability",
  "collaboration",
];

/** The 48 grid with its 4 unit safe margin. */
const SAFE_MIN = 4;
const SAFE_MAX = GLYPH_SIZE - 4;

/**
 * Every absolute point a path visits: the end points of M, L and C and the
 * end point of each arc (the arc's radii and flags are skipped). Enough to
 * prove a glyph stays inside the safe area, since every element is convex
 * between its points or is an arc of the ring.
 */
function pointsOf(d: string): [number, number][] {
  const out: [number, number][] = [];
  const tokens = d.match(/[MLCAh]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  let cmd = "";
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const t = tokens[i] as string;
    if (/^[MLCAh]$/.test(t)) {
      cmd = t;
      i++;
      continue;
    }
    switch (cmd) {
      case "M":
      case "L":
        out.push([num(), num()]);
        break;
      case "C":
        out.push([num(), num()], [num(), num()], [num(), num()]);
        break;
      case "A":
        num(); // rx
        num(); // ry
        num(); // rotation
        num(); // large arc
        num(); // sweep
        out.push([num(), num()]);
        break;
      case "h":
        num();
        break;
      default:
        throw new Error(`Unexpected path token "${t}" in "${d}"`);
    }
  }
  return out;
}

describe("the glyph family", () => {
  it("has exactly the fourteen names of the contract", () => {
    expect([...GLYPH_NAMES].sort()).toEqual([...EXPECTED].sort());
    expect(GLYPH_NAMES).toHaveLength(14);
  });

  it("is drawn on a 48 grid with a 2 unit stroke and a 3 unit dot", () => {
    expect(GLYPH_VIEWBOX).toBe("0 0 48 48");
    expect(GLYPH_STROKE).toBe(2);
    expect(GLYPH_DOT).toBe(3);
  });

  it.each(EXPECTED)("%s: at most four elements of the four kinds", (name) => {
    const elements = GLYPHS[name];
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.length).toBeLessThanOrEqual(4);
    for (const el of elements) {
      expect(["ring", "tongue", "stroke", "dot"]).toContain(el.kind);
      expect(el.d).toMatch(/^M/);
    }
  });

  it.each(EXPECTED)("%s: stays inside the safe margin", (name) => {
    for (const el of GLYPHS[name] as readonly GlyphElement[]) {
      for (const [x, y] of pointsOf(el.d)) {
        expect(x).toBeGreaterThanOrEqual(SAFE_MIN - 0.01);
        expect(x).toBeLessThanOrEqual(SAFE_MAX + 0.01);
        expect(y).toBeGreaterThanOrEqual(SAFE_MIN - 0.01);
        expect(y).toBeLessThanOrEqual(SAFE_MAX + 0.01);
      }
    }
  });

  it.each(EXPECTED)("%s: uses only the grammar's primitives", (name) => {
    for (const el of GLYPHS[name]) {
      switch (el.kind) {
        case "ring":
          // Arcs only.
          expect(el.d).toMatch(/A/);
          expect(el.d).not.toMatch(/[LCh]/);
          break;
        case "tongue":
          // Two cubic curves, nothing else.
          expect(el.d.match(/C/g)).toHaveLength(2);
          expect(el.d).not.toMatch(/[LAh]/);
          break;
        case "stroke": {
          // Straight runs at 0, 45 or 90 degrees.
          expect(el.d).not.toMatch(/[CAh]/);
          const runs = el.d.split("M").filter(Boolean);
          for (const run of runs) {
            const pts = pointsOf(`M${run}`);
            for (let i = 1; i < pts.length; i++) {
              const [x1, y1] = pts[i - 1] as [number, number];
              const [x2, y2] = pts[i] as [number, number];
              const dx = Math.abs(x2 - x1);
              const dy = Math.abs(y2 - y1);
              const straight =
                dx < 0.02 || dy < 0.02 || Math.abs(dx - dy) < 0.02;
              expect(straight, `${name}: (${x1},${y1}) to (${x2},${y2})`).toBe(
                true,
              );
            }
          }
          break;
        }
        case "dot":
          // Zero-length moves only (round caps make the dot).
          expect(el.d).toMatch(/^(M-?[\d.]+ -?[\d.]+h0)+$/);
          break;
      }
    }
  });

  it("scales the stroke from 2px at 48 to 2.5px at 64", () => {
    expect(glyphStrokeWidth(48)).toBe(2);
    expect(glyphStrokeWidth(64) * (64 / 48)).toBeCloseTo(2.5, 1);
    expect(glyphStrokeWidth(96) * 2).toBeCloseTo(3.5, 1);
  });
});

describe("<Glyph>", () => {
  it.each(EXPECTED)(
    "%s renders a 48 viewBox, stroke-only SVG with at most four paths",
    (name) => {
      const html = renderToStaticMarkup(createElement(Glyph, { name }));
      expect(html).toContain('viewBox="0 0 48 48"');
      expect(html).toContain('width="48"');
      expect(html).toContain('fill="none"');
      expect(html).toContain('stroke="currentColor"');
      expect(html).toContain('stroke-linecap="round"');
      expect(html).toContain('stroke-linejoin="round"');
      expect(html).toContain('aria-hidden="true"');
      const paths = html.match(/<path /g) ?? [];
      expect(paths.length).toBeGreaterThan(0);
      expect(paths.length).toBeLessThanOrEqual(4);
      // No path carries its own fill.
      expect(html.match(/<path [^>]*fill=/g)).toBeNull();
    },
  );

  it("is labelled only when it has a title", () => {
    const plain = renderToStaticMarkup(
      createElement(Glyph, { name: "research" }),
    );
    expect(plain).not.toContain("<title>");
    expect(plain).not.toContain('role="img"');
    const named = renderToStaticMarkup(
      createElement(Glyph, { name: "research", title: "Research" }),
    );
    expect(named).toContain("<title>Research</title>");
    expect(named).toContain('role="img"');
    expect(named).not.toContain("aria-hidden");
  });

  it("marks strokes for the draw reveal and sizes the stroke with the glyph", () => {
    const html = renderToStaticMarkup(
      createElement(Glyph, { name: "integrity", size: 64, draw: true }),
    );
    expect(html).toContain('width="64"');
    expect(html).toContain('pathLength="1"');
    expect(html).toContain('class="draw draw-glyph"');
    expect(html).toContain(`stroke-width="${glyphStrokeWidth(64)}"`);
  });
});
