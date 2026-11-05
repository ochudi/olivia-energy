import { describe, expect, it } from "vitest";
import { getSeries } from "@/content/data/series";
import {
  gapAtEnd,
  layoutChart,
  spreadLabels,
  thinTicks,
  VIEWBOX,
  type LineInput,
} from "./chart-layout";

const access = getSeries("electricity_access_pct");
const line = (name: string, color: LineInput["color"]): LineInput => ({
  name,
  points: access.series.find((s) => s.name === name)!.points,
  color,
});

/** Home Fig. 1 as the page configures it. */
const HOME = {
  lines: [
    line("World", "chart-2"),
    line("Nigeria", "chart-1"),
    line("Sub-Saharan Africa", "chart-3"),
  ],
  x: { from: 2000, to: 2024, ticks: [2000, 2006, 2012, 2018, 2024] },
  y: { from: 0, to: 100, ticks: [0, 25, 50, 75, 100], format: "percent" },
  endLabels: {
    World: "World",
    Nigeria: "Nigeria",
    "Sub-Saharan Africa": "Sub-Saharan Africa",
  },
  gap: { upper: "World", lower: "Nigeria" },
  pill: { at: 0.6 },
} as const;

describe("spreadLabels", () => {
  it("leaves labels that are already apart where they are", () => {
    expect(spreadLabels([100, 200, 300], 52, 0, 560)).toEqual([100, 200, 300]);
  });

  it("pushes close labels apart in both directions and keeps the input order", () => {
    const out = spreadLabels([300, 310, 100], 52, 0, 560);
    expect(out[2]).toBe(100);
    expect(out[1] - out[0]).toBeGreaterThanOrEqual(52);
    expect(out[0]).toBeLessThan(300);
    expect(out[1]).toBeGreaterThan(310);
  });

  it("keeps the stack inside the plot when it hits an edge", () => {
    const out = spreadLabels([550, 555], 52, 14, 560);
    expect(Math.max(...out)).toBeLessThanOrEqual(560);
    expect(out[1] - out[0]).toBeGreaterThanOrEqual(52);
  });
});

describe("layoutChart", () => {
  const wide = layoutChart({ variant: "wide", ...HOME });
  const tall = layoutChart({ variant: "tall", ...HOME });

  it("draws one rounded path per line inside the plot", () => {
    expect(wide.lines.map((l) => l.name)).toEqual([
      "World",
      "Nigeria",
      "Sub-Saharan Africa",
    ]);
    for (const l of [...wide.lines, ...tall.lines]) {
      expect(l.d).toMatch(
        /^M-?\d+(\.\d)? -?\d+(\.\d)?(L-?\d+(\.\d)? -?\d+(\.\d)?)+$/,
      );
      expect(l.d).not.toMatch(/\.\d\d/);
    }
    const first = wide.lines[0].d.match(/^M(\d+) /)!;
    expect(Number(first[1])).toBe(VIEWBOX.wide.plotLeft);
  });

  it("puts the end labels at the last point, spread at least a label apart", () => {
    const ys = wide.endLabels.map((l) => (l.labelY / 100) * VIEWBOX.wide.h);
    const sorted = [...ys].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(52 - 0.5);
    }
    const nigeria = wide.endLabels.find((l) => l.name === "Nigeria")!;
    expect(nigeria.value).toBe("62.5%");
    expect(nigeria.text).toBe("Nigeria 62.5%");
    expect(nigeria.before).toBe("Nigeria");
    expect(nigeria.after).toBe("");
    expect(nigeria.x).toBe(wide.plotRightPct);
  });

  it("splits a finished label and a template around the value", () => {
    const l = layoutChart({
      variant: "wide",
      ...HOME,
      endLabels: { World: "World {value} in {x}", Nigeria: "Nigeria 62.5%" },
    });
    const world = l.endLabels.find((e) => e.name === "World")!;
    expect(world.text).toBe("World 91.9% in 2024");
    expect(world.after).toBe("in 2024");
    expect(l.endLabels.find((e) => e.name === "Nigeria")!.before).toBe(
      "Nigeria",
    );
  });

  it("hatches the gap band and centres the pill on it", () => {
    expect(wide.gap).toBeDefined();
    expect(wide.gap!.d.endsWith("Z")).toBe(true);
    expect(wide.gap!.pillX).toBeGreaterThan(wide.plotLeftPct);
    expect(wide.gap!.pillX).toBeLessThan(wide.plotRightPct);
    expect(wide.pill).toEqual({
      x: wide.gap!.pillX,
      y: wide.gap!.pillY,
      anchor: "centre",
    });
  });

  it("hatches the area under a line down to the axis", () => {
    const l = layoutChart({ variant: "wide", ...HOME, hatchArea: "Nigeria" });
    expect(l.area!.d).toContain(` ${VIEWBOX.wide.bottom}L`);
    expect(l.area!.d.endsWith(`${VIEWBOX.wide.bottom}Z`)).toBe(true);
  });

  it("supports a log y axis with start labels and an annotation pill", () => {
    const price = getSeries("solar_pv_module_price");
    const l = layoutChart({
      variant: "tall",
      lines: [
        { name: "World", points: price.series[0].points, color: "chart-1" },
      ],
      x: { from: 1975, to: 2024, ticks: [1975, 1990, 2005, 2024] },
      y: {
        from: 0.1,
        to: 200,
        ticks: [0.1, 1, 10, 100],
        scale: "log",
        format: "usd",
      },
      endLabels: { World: "{value} in {x}" },
      startLabels: { World: "{value} in {x}" },
      pill: { at: 0.55 },
    });
    expect(l.startLabels[0].text).toBe("$132.38 in 1975");
    expect(l.endLabels[0].text).toBe("$0.27 in 2024");
    expect(l.gridY.map((g) => g.label)).toEqual(["$0.10", "$1", "$10", "$100"]);
    // Equal spacing between decades on a log axis.
    const [a, b, c] = l.gridY.map((g) => g.y);
    expect(b - a).toBeCloseTo(c - b, 5);
    // A falling line leaves the space above and to the right clear.
    expect(l.pill!.anchor).toBe("above");
  });

  it("is stable: the home layout snapshot", () => {
    expect({ wide, tall }).toMatchSnapshot();
  });
});

describe("thinTicks", () => {
  it("keeps the first, the last and evenly picked ticks between", () => {
    expect(thinTicks([2000, 2006, 2012, 2018, 2024], 3)).toEqual([
      2000, 2012, 2024,
    ]);
    expect(thinTicks([1975, 1990, 2005, 2024], 3)).toEqual([1975, 2005, 2024]);
    expect(thinTicks([2000, 2024], 3)).toEqual([2000, 2024]);
  });

  it("thins the phone axis only", () => {
    expect(tallTicks()).toEqual(["2000", "2012", "2024"]);
  });
});

function tallTicks() {
  return layoutChart({ variant: "tall", ...HOME }).ticksX.map((t) => t.label);
}

describe("half", () => {
  it("is taller than wide, with labels at least 104 units apart", () => {
    const half = layoutChart({ variant: "half", ...HOME });
    expect(VIEWBOX.half.h / VIEWBOX.half.w).toBeGreaterThan(
      VIEWBOX.wide.h / VIEWBOX.wide.w,
    );
    const ys = half.endLabels
      .map((l) => (l.labelY / 100) * VIEWBOX.half.h)
      .sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(104 - 0.5);
    }
  });
});

describe("gapAtEnd", () => {
  it("reads the difference at the last shared year", () => {
    const world = access.series.find((s) => s.name === "World")!.points;
    const nigeria = access.series.find((s) => s.name === "Nigeria")!.points;
    expect(gapAtEnd(world, nigeria)).toEqual({
      x: 2024,
      value: expect.closeTo(29.4, 1),
      text: "29.4",
    });
  });
});
