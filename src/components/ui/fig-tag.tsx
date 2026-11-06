/**
 * FigTag — "Fig. n", the figure number that opens every figure plate. Set
 * as a journal caption: Newsreader at the title's size, roman, muted, no
 * pill (DESIGN.md: the numbering is the evidence register of the papers
 * and reports the site is built on; the dress is not a badge).
 */
export function FigTag({ n }: { n: number }) {
  return (
    <span className="font-display text-display-xs text-ink-muted numerals shrink-0">
      Fig. {n}
    </span>
  );
}
