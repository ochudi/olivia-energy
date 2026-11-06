import type { FactTag, GlyphSpec, SourceRef } from "@/types/contracts";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { Source } from "@/components/ui/source";
import { formatNumber } from "@/lib/figures/format";
import { cn } from "@/lib/utils/cn";
import { GlyphFor } from "./glyphs";

export type NumeralFigureProps = {
  numeral: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** "million", "GW": set beside the numeral in display-sm. */
  unit?: string;
  tag: FactTag;
  caption: string;
  glyph?: GlyphSpec;
  /** "Each dot is one million people." */
  glyphCaption?: string;
  source: SourceRef;
  retrieved: string;
  /**
   * band: a tile of the numbers band (no fill, a 1 px ink line on top).
   * card: the numeral card inside a chapter (card surface, square corners:
   * an instrument, DESIGN.md Shapes).
   */
  size: "band" | "card";
  /** For a share glyph: which part is hatched (see ShareBar). */
  shareHatch?: "value" | "remainder";
  className?: string;
};

/* Gap is the solid red pill; Opening answers it; Target and Context are quiet. */
const TAG_TONE: Record<FactTag, ChipTone> = {
  Gap: "gap",
  Opening: "opening",
  Target: "outline",
  Context: "outline",
};

/**
 * NumeralFigure — a big number with its tag, caption, comparison glyph and
 * source line (creative brief 2.6: numeral cards carry a tag, not a Fig.
 * number). The numeral is final, always; the glyph beside it is what moves
 * as the tile scrolls into view (DESIGN.md, Motion).
 */
export function NumeralFigure({
  numeral,
  decimals = 0,
  prefix,
  suffix,
  unit,
  tag,
  caption,
  glyph,
  glyphCaption,
  source,
  retrieved,
  size,
  shareHatch,
  className,
}: NumeralFigureProps) {
  const band = size === "band";
  return (
    <div
      className={cn(
        "text-ink flex flex-col gap-5",
        band
          ? "border-ink/60 border-t pt-5"
          : "bg-surface border-line rounded-xs border p-6 sm:p-7",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-3">
        <span
          className="font-display numerals text-numeral text-ink"
          // Inside a card the numeral is capped at 96 px (brief 4.2).
          style={
            band ? undefined : { fontSize: "min(var(--text-numeral), 6rem)" }
          }
        >
          {prefix}
          {formatNumber(numeral, decimals)}
          {suffix}
        </span>
        {unit ? (
          <span className="font-display text-display-sm text-ink">{unit}</span>
        ) : null}
        <Chip tone={TAG_TONE[tag]} className="self-center">
          {tag}
        </Chip>
      </div>

      <div
        className={cn(
          "grid gap-x-8 gap-y-4",
          glyph &&
            band &&
            "md:grid-cols-[minmax(0,1fr)_17.5rem] md:items-start",
        )}
      >
        <p className="text-ink max-w-[42ch] text-base text-pretty">{caption}</p>
        {glyph ? (
          <div className="figure-scope flex flex-col gap-2">
            <GlyphFor spec={glyph} shareHatch={shareHatch} />
            {glyphCaption ? (
              <p className="text-ink-muted text-xs">{glyphCaption}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <Source sources={source} retrieved={retrieved} className="mt-auto" />
    </div>
  );
}
