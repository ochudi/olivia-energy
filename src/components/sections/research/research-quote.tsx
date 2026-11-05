import type { OpEd } from "@/types/contracts";
import { QuotePanel } from "@/components/blocks";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { HOME_COMMENTARY } from "@/content/home";

/**
 * His Dangote line a second time (client review idea 4): the home page's
 * quotation panel, the same op-ed and attribution, between the print
 * timeline and the journal articles, where a reader checks his record.
 * The hero above already gives the paper its bottom padding, so this band
 * only pads below. Renders nothing if no op-ed carries a pull quote.
 */
export function ResearchQuote({ opeds }: { opeds: readonly OpEd[] }) {
  const c = HOME_COMMENTARY;
  const quoted =
    opeds.find((o) => o.slug === c.quoteSlug && o.pullQuote) ??
    opeds.find((o) => o.pullQuote);
  if (!quoted?.pullQuote) return null;
  return (
    <Section surface="paper" spacing="none" className="pb-section-sm">
      <Container>
        <QuotePanel
          quote={quoted.pullQuote}
          attribution={c.quoteAttribution(quoted)}
        />
      </Container>
    </Section>
  );
}
