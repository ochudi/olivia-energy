import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { COVER_COPY } from "@/content/brand";
import { INSIGHTS_PAGE } from "@/content/insights";
import { getCommentaryCounts } from "@/lib/supabase/queries";
import { PeopleFigure } from "./people-figure";

/**
 * Insights hero (creative brief 4.4 section 1): a lime flood. Cols 1 to 6
 * carry the H1 (three words, so display-xl; static, never masked) and the
 * lede; cols 7 to 12 carry Fig. 1 on a night plate. On phones the plate
 * follows the text and starts inside the first screen. Under the lede, the
 * wall's count line, a sentence in the body face, links to the op-eds
 * (#businessday) in one tap (client review idea 2).
 */
export async function InsightsHero() {
  const { title, lede } = INSIGHTS_PAGE.hero;
  const counts = await getCommentaryCounts();
  return (
    <Section
      surface="lime"
      hero="light"
      id="overview"
      aria-labelledby="insights-title"
    >
      <Container>
        <div
          data-fold-split=""
          className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-6"
        >
          <div className="@container lg:col-span-6 lg:pr-6">
            <Display
              as="h1"
              size="xl"
              headline
              id="insights-title"
              // The display-xl size, capped so "transformation." (6.5em
              // wide, measured) never runs past the text column.
              className="text-[min(var(--text-display-xl),14.5cqi)] leading-(--text-display-xl--line-height) tracking-(--text-display-xl--letter-spacing)"
            >
              {title}
            </Display>
            <Lede className="mt-6 lg:mt-10">{lede}</Lede>
            {counts.opeds > 0 ? (
              <a
                href="#businessday"
                className="text-ink hit-area tap duration-fast ease-standard hover:text-ink-muted mt-6 inline-flex items-start gap-2 text-sm font-medium transition-colors lg:mt-8"
              >
                <FlameBullet className="mt-[0.2em] h-[1.1em] shrink-0" />
                <span className="link-underline numerals">
                  {COVER_COPY.countLine(counts)}
                </span>
              </a>
            ) : null}
          </div>
          <PeopleFigure className="lg:col-span-6" />
        </div>
      </Container>
    </Section>
  );
}
