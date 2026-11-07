import { CoverWall, QuotePanel } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { HOME_COMMENTARY } from "@/content/home";
import { getCommentaryCounts, getOpEds } from "@/lib/supabase/queries";
import { HomeSectionHeader } from "./section-header";

/**
 * On the record, in BusinessDay: the
 * founder's op-eds as a cover wall (the newest as the lime lead, then the
 * next four energy op-eds; the wall assembles on Insights, not here), his
 * Dangote line set large in the quotation panel, and the eight Insights
 * formats as chips. Op-eds and counts come from the publication data, with
 * the static list as fallback.
 */
export async function HomeCommentary() {
  const [opeds, counts] = await Promise.all([
    getOpEds(),
    getCommentaryCounts(),
  ]);
  const c = HOME_COMMENTARY;
  // The configured quotation; if that op-ed is absent, the newest with a
  // pull quote.
  const quoted =
    opeds.find((o) => o.slug === c.quoteSlug && o.pullQuote) ??
    opeds.find((o) => o.pullQuote);

  return (
    <Section
      surface="paper"
      id="businessday"
      aria-labelledby="businessday-title"
    >
      <Container>
        <HomeSectionHeader
          title={c.title}
          titleId="businessday-title"
          size="xl"
          lede={<Lede className="max-w-[46ch]">{c.lede(counts)}</Lede>}
          aside={
            <div className="flex flex-col items-start gap-4 lg:items-end lg:text-right">
              <p className="text-ink-muted numerals text-sm">
                {c.countLine(counts)}
              </p>
              <Button href={c.allLink.href} variant="text">
                {c.allLink.label}
              </Button>
            </div>
          }
        />

        <div className="mt-12 md:mt-16">
          <CoverWall opeds={opeds} layout="home" />
        </div>

        {quoted?.pullQuote ? (
          <div className="mt-6 md:mt-10">
            <QuotePanel
              quote={quoted.pullQuote}
              attribution={c.quoteAttribution(quoted)}
            />
          </div>
        ) : null}

        <div className="border-line mt-14 grid gap-6 border-t pt-8 md:mt-20 lg:grid-cols-12 lg:items-start lg:gap-x-6">
          <p className="font-display text-display-xs text-ink lg:col-span-4">
            {c.insightsLine}
          </p>
          <ul className="flex flex-wrap gap-2 lg:col-span-6">
            {c.formatChips.map((name) => (
              <Chip key={name} as="li">
                {name}
              </Chip>
            ))}
          </ul>
          <div className="lg:col-span-2 lg:justify-self-end">
            <Button href={c.insightsCta.href} variant="text">
              {c.insightsCta.label}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
