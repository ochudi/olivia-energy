import { MARK_PATHS } from "@/lib/brand/mark";

export type QuotePanelProps = {
  /** The quotation, verbatim (no quotation marks: the flames are the marks). */
  quote: string;
  /** "Dr Olugbenga Olaoye, “{title}”, BusinessDay, {long date}" (COVER_COPY.attribution). */
  attribution: string;
};

/**
 * The large quotation mark: two of the mark's flames side by side, in the
 * brand red (creative brief 2.1: "the big quotation flame").
 */
function FlameQuote() {
  return (
    <svg
      viewBox="0 0 96 92"
      aria-hidden="true"
      focusable="false"
      className="text-brand-red h-16 w-auto shrink-0 md:h-24 lg:h-28"
    >
      <path d={MARK_PATHS.flame} fill="currentColor" />
      <path
        d={MARK_PATHS.flame}
        fill="currentColor"
        transform="translate(52 0)"
      />
    </svg>
  );
}

/**
 * QuotePanel — one quotation set large on a deep-field panel with square
 * corners (an instrument of the record, DESIGN.md Shapes): the red flame
 * quotation mark, the quote in display-md, the attribution in text-sm.
 * Text is static (DESIGN.md, Motion).
 */
export function QuotePanel({ quote, attribution }: QuotePanelProps) {
  return (
    <figure
      data-surface="paper-deep"
      className="bg-canvas text-ink relative grid gap-6 rounded-xs px-6 py-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-10 md:px-12 md:py-14 lg:gap-x-16 lg:px-16 lg:py-20"
    >
      <FlameQuote />
      <div>
        <blockquote>
          <p className="font-display text-display-md text-ink max-w-[28ch] font-normal text-balance">
            {quote}
          </p>
        </blockquote>
        <figcaption className="text-ink-muted mt-6 max-w-[60ch] text-sm md:mt-8">
          {attribution}
        </figcaption>
      </div>
    </figure>
  );
}
