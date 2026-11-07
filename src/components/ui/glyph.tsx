import type { GlyphName } from "@/types/contracts";
import { cn } from "@/lib/utils/cn";
import {
  GLYPH_DOT,
  GLYPH_SIZE,
  GLYPH_STROKE,
  GLYPH_VIEWBOX,
  GLYPHS,
} from "./glyphs";

export type GlyphProps = {
  name: GlyphName;
  /** Rendered size in px (default 48). The stroke scales gently: 2px at 48, 2.5px at 64. */
  size?: number;
  /**
   * The `draw` reveal (DESIGN.md, Motion): the strokes draw themselves as
   * the glyph scrolls into view, on a view timeline the glyph itself
   * names. Server HTML is the finished glyph.
   */
  draw?: boolean;
  /** Accessible name. Without it the glyph is decorative (aria-hidden). */
  title?: string;
  className?: string;
};

/** Stroke width in grid units for a rendered size, from 2px at 48 to 2.5px at 64. */
export function glyphStrokeWidth(size: number): number {
  const px = 2 + (size - GLYPH_SIZE) / 32;
  return Math.round(((px * GLYPH_SIZE) / size) * 100) / 100;
}

/**
 * Glyph — one of the fourteen line glyphs. Strokes are
 * `currentColor`, and the `glyph` class sets that to the surface's glyph
 * colour: flood green on the field, white on green, night or red, ink on
 * lime. A text-* utility in `className` overrides it. Stroke only; dots
 * are round-capped zero-length strokes.
 */
export function Glyph({
  name,
  size = GLYPH_SIZE,
  draw = false,
  title,
  className,
}: GlyphProps) {
  const elements = GLYPHS[name];
  const stroke = glyphStrokeWidth(size);
  const dot = (stroke * GLYPH_DOT) / GLYPH_STROKE;
  return (
    <svg
      viewBox={GLYPH_VIEWBOX}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("glyph shrink-0", draw && "draw-scope", className)}
      data-glyph={name}
    >
      {title ? <title>{title}</title> : null}
      {elements.map((el, i) =>
        el.kind === "dot" ? (
          <path
            key={i}
            d={el.d}
            strokeWidth={dot}
            className={draw ? "draw-dot" : undefined}
          />
        ) : (
          <path
            key={i}
            d={el.d}
            pathLength={draw ? 1 : undefined}
            className={draw ? "draw draw-glyph" : undefined}
          />
        ),
      )}
    </svg>
  );
}
