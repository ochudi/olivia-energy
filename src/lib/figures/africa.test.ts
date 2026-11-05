import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  AFRICA_SRC,
  AFRICA_VIEW,
  AFRICA_VIEW_BOX,
  project,
  projectPercent,
  regionWidthPercent,
  SOUTHWEST_NIGERIA,
} from "./africa";

const svgPath = path.join(process.cwd(), "public", AFRICA_SRC);

describe("africa-dots.svg", () => {
  const svg = fs.readFileSync(svgPath, "utf8");

  it("is at most 25 KB and holds exactly one path", () => {
    expect(fs.statSync(svgPath).size).toBeLessThanOrEqual(25 * 1024);
    expect(svg.match(/<path\b/g)).toHaveLength(1);
    expect(svg.match(/<(?!\/)(\w+)/g)).toEqual(["<svg", "<path"]);
  });

  it("shares its viewBox with the projection and names itself", () => {
    expect(svg).toContain(`viewBox="${AFRICA_VIEW_BOX}"`);
    expect(svg).toMatch(/aria-label="[^"]+"/);
  });
});

describe("project", () => {
  it("is plate carree on the 72 x 76 box", () => {
    expect(project(39, -19)).toEqual({ x: 0, y: 0 });
    expect(project(0, 0)).toEqual({ x: 19, y: 39 });
  });

  it("puts Southwest Nigeria inside the box, north of the Gulf of Guinea", () => {
    const { lat, lon, radius } = SOUTHWEST_NIGERIA;
    const { x, y } = project(lat, lon);
    expect(x - radius).toBeGreaterThan(0);
    expect(x + radius).toBeLessThan(AFRICA_VIEW.width);
    expect(y - radius).toBeGreaterThan(0);
    expect(y + radius).toBeLessThan(AFRICA_VIEW.height);
    expect(projectPercent(lat, lon)).toEqual({
      left: "32.361%",
      top: "41.316%",
    });
  });

  it("marks a region, not a town: the ring spans degrees of the map", () => {
    expect(SOUTHWEST_NIGERIA.radius).toBeGreaterThanOrEqual(1.5);
    expect(regionWidthPercent(SOUTHWEST_NIGERIA.radius)).toBe("6.111%");
    expect(regionWidthPercent(36)).toBe("100%");
  });
});
