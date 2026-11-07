import type { GlyphName } from "@/types/contracts";

/**
 * The fourteen line glyphs, as path data.
 *
 * Grammar: a 48 x 48 grid with a 4 px safe margin; stroke 2 px at 48 px,
 * round caps and joins, no fills (a dot is a zero-length stroke with round
 * caps, 3 px across); at most four elements per glyph, built only from
 *
 *   R  the ring: a circle or arc of radius 16 centred at 24,24 (smaller
 *      rings of radius 8 to 12 where a glyph needs them),
 *   T  the flame tongue: the mark's lime tongue simplified to two cubic
 *      curves in a 10 x 22 box,
 *   S  straight strokes at 0, 45 or 90 degrees,
 *   D  the dot.
 *
 * Every element is one `<path>`; strokes read `currentColor`, so a glyph is
 * flood green on paper, white on green, night or red, ink on lime. Draw-in
 * animates `stroke-dashoffset` on paths with `pathLength="1"` (dots fade).
 */

export const GLYPH_SIZE = 48;
export const GLYPH_VIEWBOX = `0 0 ${GLYPH_SIZE} ${GLYPH_SIZE}`;
/** Stroke width in grid units at 48 px. */
export const GLYPH_STROKE = 2;
/** Dot diameter in grid units at 48 px. */
export const GLYPH_DOT = 3;

export type GlyphElementKind = "ring" | "tongue" | "stroke" | "dot";
export type GlyphElement = { kind: GlyphElementKind; d: string };

const C = 24;
const R = 16;
const f = (n: number) => String(Math.round(n * 100) / 100);
const pt = (angleDeg: number, r = R, cx = C, cy = C): [number, number] => {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
};

/** Full ring as two arcs (so it is one path with a start for the draw-in at 12 o'clock). */
const ring = (r = R, cx = C, cy = C): GlyphElement => ({
  kind: "ring",
  d: `M${f(cx)} ${f(cy - r)}A${r} ${r} 0 1 1 ${f(cx)} ${f(cy + r)}A${r} ${r} 0 1 1 ${f(cx)} ${f(cy - r)}`,
});

/** Arc from `fromDeg` clockwise (on screen) to `toDeg`; angles are mathematical, 0 at 3 o'clock, counter-clockwise positive. */
const arc = (
  fromDeg: number,
  toDeg: number,
  r = R,
  cx = C,
  cy = C,
): GlyphElement => {
  const [x1, y1] = pt(fromDeg, r, cx, cy);
  const [x2, y2] = pt(toDeg, r, cx, cy);
  const sweep = (((fromDeg - toDeg) % 360) + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  return {
    kind: "ring",
    d: `M${f(x1)} ${f(y1)}A${r} ${r} 0 ${large} 1 ${f(x2)} ${f(y2)}`,
  };
};

const stroke = (
  points: readonly (readonly [number, number])[],
): GlyphElement => ({
  kind: "stroke",
  d: points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${f(x)} ${f(y)}`)
    .join(""),
});

/** Several separate straight runs in one path. */
const strokes = (
  runs: readonly (readonly (readonly [number, number])[])[],
): GlyphElement => ({
  kind: "stroke",
  d: runs
    .map((run) =>
      run.map(([x, y], i) => `${i === 0 ? "M" : "L"}${f(x)} ${f(y)}`).join(""),
    )
    .join(""),
});

const dots = (
  points: readonly (readonly [number, number])[],
): GlyphElement => ({
  kind: "dot",
  d: points.map(([x, y]) => `M${f(x)} ${f(y)}h0`).join(""),
});

/**
 * The tongue in its own 10 x 22 box: tip at the top, the belly leaning
 * right, the base a point at the bottom (as the mark's lime tongue ends).
 * Two cubic curves. `place` maps it onto the grid with a translation, a
 * uniform scale and a rotation about the box centre (5, 11).
 */
const TONGUE: readonly (readonly [number, number])[] = [
  [6, 0], // start: tip
  [11, 7],
  [9, 15],
  [3, 22], // end of curve 1: base
  [0, 15],
  [1, 7],
  [6, 0], // end of curve 2: back to the tip
];

const tongue = (
  x: number,
  y: number,
  { scale = 1, rotate = 0 }: { scale?: number; rotate?: number } = {},
): GlyphElement => {
  const a = (rotate * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const map = ([px, py]: readonly [number, number]): [number, number] => {
    const dx = (px - 5) * scale;
    const dy = (py - 11) * scale;
    return [
      x + 5 * scale + dx * cos - dy * sin,
      y + 11 * scale + dx * sin + dy * cos,
    ];
  };
  const p = TONGUE.map(map);
  const seg = (i: number) =>
    `C${f(p[i]![0])} ${f(p[i]![1])} ${f(p[i + 1]![0])} ${f(p[i + 1]![1])} ${f(p[i + 2]![0])} ${f(p[i + 2]![1])}`;
  return {
    kind: "tongue",
    d: `M${f(p[0]![0])} ${f(p[0]![1])}${seg(1)}${seg(4)}`,
  };
};

const SQ = Math.SQRT1_2;

export const GLYPHS: Record<GlyphName, readonly GlyphElement[]> = {
  /* Energy Transition Advisory: a 300° ring open at one o'clock, a short
     arrowhead continuing clockwise at its end, the tongue rising inside
     from the bottom centre. */
  transition: [
    arc(30, 90),
    strokes([
      [
        [20, 4],
        [24, 8],
        [20, 12],
      ],
    ]),
    tongue(19, 15),
  ],

  /* Energy Economics and Policy: the upper half of the ring as a dial, a
     needle from the centre towards two o'clock (drawn at 45°), three dot
     ticks on the dial. */
  "economics-policy": [
    arc(180, 0),
    stroke([
      [24, 24],
      [24 + 10.5 * SQ, 24 - 10.5 * SQ],
    ]),
    dots([
      [12.5, 24],
      [24, 12.5],
      [35.5, 24],
    ]),
  ],

  /* ESG and Sustainability: full ring, a leaf of two mirrored tongue
     curves, a stem below. */
  esg: [
    ring(),
    {
      kind: "tongue",
      d: "M24 11C29 17 29 24 24 31C19 24 19 17 24 11",
    },
    stroke([
      [24, 31],
      [24, 38],
    ]),
  ],

  /* Research and Analytics: a lens (ring r 12) offset up-left, a handle at
     45°, a three-segment rising line inside the lens. */
  "research-analytics": [
    ring(12, 20, 20),
    stroke([
      [20 + 12 * SQ, 20 + 12 * SQ],
      [40.5, 40.5],
    ]),
    stroke([
      [13, 26],
      [18, 21],
      [21, 21],
      [27, 15],
    ]),
  ],

  /* Capacity Development: three steps rising left to right, the tongue on
     the top step. */
  capacity: [
    stroke([
      [5, 44],
      [17, 44],
      [17, 36],
      [29, 36],
      [29, 28],
      [43, 28],
    ]),
    tongue(31, 6),
  ],

  /* Project Advisory: a route of three segments from bottom-left to
     top-right, dot nodes at the two bends, ending in a small ring (r 6)
     milestone. The route breaks 2.5 units around each node so the dots
     read as nodes, not bumps; the bends are 14 apart so the middle
     segment keeps its length at 48 px. */
  project: [
    strokes([
      [
        [5, 43],
        [11.5, 36.5],
      ],
      [
        [16.5, 34],
        [25.5, 34],
      ],
      [
        [30.3, 31.7],
        [38 - 6 * SQ, 24 + 6 * SQ],
      ],
    ]),
    dots([
      [14, 34],
      [28, 34],
    ]),
    ring(6, 38, 24),
  ],

  /* Pillar: Research. Full ring with a dot at its centre. */
  research: [ring(), dots([[24, 24]])],

  /* Pillar: Advisory. The tongue on its side as a speech mark (tip down and
     left, like the tail of an opening quotation mark), a second, smaller
     one beside it, both hanging from the same line. */
  advisory: [
    tongue(10, 11, { rotate: 150 }),
    tongue(30, 13, { rotate: 150, scale: 0.72 }),
  ],

  /* Pillar and value: Innovation. One large upright tongue with a dot spark
     above its tip. */
  innovation: [tongue(17.5, 15, { scale: 1.25 }), dots([[26, 8]])],

  /* Pillar: Impact. The upright tongue landing on a surface, with two
     ripples spreading out under it: concentric ring arcs (radius 8 and 15)
     round its base, open above. Replaces a dot with quarter arcs up and
     right, which read as the feed or Wi-Fi icon. */
  impact: [tongue(19, 5), arc(340, 200, 8, 24, 27), arc(345, 195, 15, 24, 27)],

  /* Value: Excellence. Full ring with an upward chevron inside. */
  excellence: [
    ring(),
    stroke([
      [16.5, 28],
      [24, 20.5],
      [31.5, 28],
    ]),
  ],

  /* Value: Integrity. Full ring with a vertical stroke through its centre,
     top to bottom of the ring. */
  integrity: [
    ring(),
    stroke([
      [24, 8],
      [24, 40],
    ]),
  ],

  /* Value: Sustainability. Two 150° arcs chasing each other, each with an
     arrowhead at its leading end. */
  sustainability: [
    arc(105, -45),
    strokes([
      [
        [24 + R * SQ + 5.5, 24 + R * SQ],
        [24 + R * SQ, 24 + R * SQ],
        [24 + R * SQ, 24 + R * SQ - 5.5],
      ],
    ]),
    arc(-75, 135),
    strokes([
      [
        [24 - R * SQ - 5.5, 24 - R * SQ],
        [24 - R * SQ, 24 - R * SQ],
        [24 - R * SQ, 24 - R * SQ + 5.5],
      ],
    ]),
  ],

  /* Value: Collaboration. Two interlocking rings of radius 11, centres 12
     units apart. */
  collaboration: [ring(11, 18, 24), ring(11, 30, 24)],
};

export const GLYPH_NAMES = Object.keys(GLYPHS) as readonly GlyphName[];
