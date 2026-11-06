/**
 * WCAG 2.x contrast, and the surface table from creative brief 2.1 as data,
 * so a test can prove every pair the brief states and /styleguide can show
 * the ratios it ships with. Pure functions; no DOM.
 */

import type { Surface } from "@/types/contracts";

export type Rgb = readonly [number, number, number];
export type Rgba = readonly [number, number, number, number];

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb() and rgba(). Returns null otherwise. */
export function parseColor(input: string): Rgba | null {
  const value = input.trim().toLowerCase();
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) return null;
    const n = parseInt(hex.slice(0, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(value);
  if (!m) return null;
  const parts = (m[1] ?? "")
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((p) => (p.endsWith("%") ? parseFloat(p) / 100 : parseFloat(p)));
  if (parts.length < 3 || parts.some((p) => Number.isNaN(p))) return null;
  const [r, g, b] = parts as [number, number, number];
  const a = parts.length > 3 ? (parts[3] as number) : 1;
  return [r, g, b, a];
}

/** Flattens a translucent colour onto an opaque background. */
export function composite(fg: Rgba, bg: Rgb): Rgb {
  const a = fg[3];
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
  ];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG contrast ratio between a foreground and a background. A translucent
 * foreground is composited on the background first; a translucent
 * background on white. Returns 1 when either colour is unparseable.
 */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseColor(foreground);
  const bgRaw = parseColor(background);
  if (!fg || !bgRaw) return 1;
  const bg = composite(bgRaw, [255, 255, 255]);
  const top = composite(fg, bg);
  const l1 = relativeLuminance(top);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "AA Large" | "Fail";

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`;
}

/**
 * The darkest 8-bit sRGB grey whose relative luminance is at most
 * `luminance` (0 to 1), as a hex: the floor a scrim has to reach.
 */
export function greyOfLuminance(luminance: number): string {
  const l = Math.min(1, Math.max(0, luminance));
  const s = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
  const c = Math.floor(s * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${c}${c}${c}`;
}

/**
 * The photo surface (creative brief 2.7): the scrim must bring the lightest
 * pixel behind each kind of text down to these luminances, so the pairs are
 * tested against a grey of exactly that luminance.
 */
export const SCRIM_FLOORS = {
  /** Behind body text (white, 4.5:1). */
  body: 0.18,
  /** Behind the H1 (white, 3:1). */
  heading: 0.3,
  /** Behind the turn (pale lime, 3:1). */
  turn: 0.22,
} as const;

/** One foreground on a surface, with the threshold the brief holds it to. */
export type ContrastPair = {
  surface: Surface;
  role: string;
  foreground: string;
  background: string;
  /** 4.5 for text, 3 for large text (24px+) and graphics. */
  minimum: 4.5 | 3;
  /** The ratio the brief states, for the record. */
  stated?: number;
};

export const BRAND = {
  green: "#04923F",
  lime: "#88C029",
  red: "#D5281B",
  floodGreen: "#047A36",
  redInk: "#B8231A",
  night: "#06170E",
  nightRaised: "#0E2418",
  paper: "#F1F3EA",
  paperDeep: "#E6EBDC",
  card: "#FAFBF7",
  chartTint: "#3FCB79",
  limePale: "#D3EDA6",
  ink: "#0B1F14",
  white: "#FFFFFF",
} as const;

/** `--color-error` on night and photo. */
export const ERROR_ON_DARK = "#FFB4AA";

/**
 * The surface table (creative brief 2.1; the ground is the field of
 * DESIGN.md, Colors, since November 2026), every pair with its threshold.
 * `stated` is the ratio DESIGN.md records for the pair.
 */
export const SURFACE_PAIRS: readonly ContrastPair[] = [
  // paper
  {
    surface: "paper",
    role: "Text",
    foreground: BRAND.ink,
    background: BRAND.paper,
    minimum: 4.5,
    stated: 15,
  },
  {
    surface: "paper",
    role: "Muted text",
    foreground: "#4A5A50",
    background: BRAND.paper,
    minimum: 4.5,
    stated: 6.5,
  },
  {
    surface: "paper",
    role: "Subtle text",
    foreground: "#5E6D63",
    background: BRAND.paper,
    minimum: 4.5,
    stated: 4.8,
  },
  {
    surface: "paper",
    role: "Turn and green text",
    foreground: BRAND.floodGreen,
    background: BRAND.paper,
    minimum: 4.5,
    stated: 4.8,
  },
  {
    surface: "paper",
    role: "Red ink (small text, errors)",
    foreground: BRAND.redInk,
    background: BRAND.paper,
    minimum: 4.5,
  },
  {
    surface: "paper",
    role: "Primary button text",
    foreground: BRAND.white,
    background: BRAND.floodGreen,
    minimum: 4.5,
    stated: 5.5,
  },
  {
    surface: "paper",
    role: "Display type in brand green (24px+)",
    foreground: BRAND.green,
    background: BRAND.paper,
    minimum: 3,
  },
  {
    surface: "paper",
    role: "Text on a card",
    foreground: BRAND.ink,
    background: BRAND.card,
    minimum: 4.5,
  },
  {
    surface: "paper",
    role: "Muted text on a card",
    foreground: "#4A5A50",
    background: BRAND.card,
    minimum: 4.5,
  },
  {
    surface: "paper",
    role: "Gap pill text",
    foreground: BRAND.white,
    background: BRAND.red,
    minimum: 4.5,
  },
  {
    surface: "paper",
    role: "Form error (red ink)",
    foreground: BRAND.redInk,
    background: BRAND.card,
    minimum: 4.5,
  },
  // paper-deep
  {
    surface: "paper-deep",
    role: "Text",
    foreground: BRAND.ink,
    background: BRAND.paperDeep,
    minimum: 4.5,
  },
  {
    surface: "paper-deep",
    role: "Muted and subtle text",
    foreground: "#4A5A50",
    background: BRAND.paperDeep,
    minimum: 4.5,
    stated: 6.0,
  },
  {
    surface: "paper-deep",
    role: "Green text (large text only)",
    foreground: BRAND.floodGreen,
    background: BRAND.paperDeep,
    minimum: 3,
    stated: 4.5,
  },
  {
    surface: "paper-deep",
    role: "Primary button text",
    foreground: BRAND.white,
    background: BRAND.floodGreen,
    minimum: 4.5,
  },
  {
    surface: "paper-deep",
    role: "Form error (red ink)",
    foreground: BRAND.redInk,
    background: BRAND.paperDeep,
    minimum: 4.5,
  },
  // night
  {
    surface: "night",
    role: "Text",
    foreground: BRAND.white,
    background: BRAND.night,
    minimum: 4.5,
  },
  {
    surface: "night",
    role: "Muted text",
    foreground: "#B9C7BE",
    background: BRAND.night,
    minimum: 4.5,
    stated: 10.5,
  },
  {
    surface: "night",
    role: "Turn (lime)",
    foreground: BRAND.lime,
    background: BRAND.night,
    minimum: 4.5,
    stated: 8.5,
  },
  {
    surface: "night",
    role: "Primary button text (ink on lime)",
    foreground: BRAND.ink,
    background: BRAND.lime,
    minimum: 4.5,
  },
  {
    surface: "night",
    role: "Text on a raised panel",
    foreground: BRAND.white,
    background: BRAND.nightRaised,
    minimum: 4.5,
  },
  {
    surface: "night",
    role: "Muted text on a raised panel",
    foreground: "#B9C7BE",
    background: BRAND.nightRaised,
    minimum: 4.5,
  },
  {
    surface: "night",
    role: "Third chart series (graphic)",
    foreground: BRAND.chartTint,
    background: BRAND.night,
    minimum: 3,
  },
  {
    surface: "night",
    role: "Form error (light red)",
    foreground: ERROR_ON_DARK,
    background: BRAND.nightRaised,
    minimum: 4.5,
  },
  // green
  {
    surface: "green",
    role: "Text",
    foreground: BRAND.white,
    background: BRAND.floodGreen,
    minimum: 4.5,
    stated: 5.5,
  },
  {
    surface: "green",
    role: "Muted text",
    foreground: "#E1F0E6",
    background: BRAND.floodGreen,
    minimum: 4.5,
    stated: 4.6,
  },
  {
    surface: "green",
    role: "Primary button text (ink on paper)",
    foreground: BRAND.ink,
    background: BRAND.paper,
    minimum: 4.5,
  },
  {
    surface: "green",
    role: "Gap pill text (flood green on white)",
    foreground: BRAND.floodGreen,
    background: BRAND.white,
    minimum: 4.5,
  },
  // lime
  {
    surface: "lime",
    role: "Text",
    foreground: BRAND.ink,
    background: BRAND.lime,
    minimum: 4.5,
    stated: 7.9,
  },
  {
    surface: "lime",
    role: "Muted text",
    foreground: "#23401C",
    background: BRAND.lime,
    minimum: 4.5,
    stated: 5.3,
  },
  {
    surface: "lime",
    role: "Primary button text (lime on ink)",
    foreground: BRAND.lime,
    background: BRAND.ink,
    minimum: 4.5,
  },
  {
    surface: "lime",
    role: "Gap pill text",
    foreground: BRAND.white,
    background: BRAND.red,
    minimum: 4.5,
  },
  // red
  {
    surface: "red",
    role: "Text (white only)",
    foreground: BRAND.white,
    background: BRAND.red,
    minimum: 4.5,
    stated: 5.1,
  },
  {
    surface: "red",
    role: "Primary button text (ink on paper)",
    foreground: BRAND.ink,
    background: BRAND.paper,
    minimum: 4.5,
  },
  {
    surface: "red",
    role: "Gap pill text (brand red on white)",
    foreground: BRAND.red,
    background: BRAND.white,
    minimum: 4.5,
  },
  // photo: each pair sits on the lightest pixel the scrim allows behind it
  {
    surface: "photo",
    role: "Body text on the scrim floor",
    foreground: BRAND.white,
    background: greyOfLuminance(SCRIM_FLOORS.body),
    minimum: 4.5,
  },
  {
    surface: "photo",
    role: "H1 on its scrim floor",
    foreground: BRAND.white,
    background: greyOfLuminance(SCRIM_FLOORS.heading),
    minimum: 3,
  },
  {
    surface: "photo",
    role: "Turn (pale lime) on its scrim floor",
    foreground: BRAND.limePale,
    background: greyOfLuminance(SCRIM_FLOORS.turn),
    minimum: 3,
  },
  {
    surface: "photo",
    role: "Muted text on at least 70% scrim",
    foreground: "#E6ECE8",
    background: "rgba(6, 23, 14, 0.7)",
    minimum: 4.5,
  },
];

/** The pairs that fail their threshold (empty when the table is sound). */
export function failingPairs(
  pairs: readonly ContrastPair[] = SURFACE_PAIRS,
): ContrastPair[] {
  return pairs.filter(
    (p) => contrastRatio(p.foreground, p.background) < p.minimum,
  );
}
