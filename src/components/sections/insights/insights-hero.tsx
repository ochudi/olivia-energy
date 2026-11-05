import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { COVER_COPY } from "@/content/brand";
import { INSIGHTS_PAGE } from "@/content/insights";
import { getCommentaryCounts } from "@/lib/supabase/queries";
import { PeopleFigure } from "./people-figure";

/**
 * Insights hero (creative brief 4.4 section 1): a lime flood. Cols 1 to 6
 * carry the eyebrow, the H1 (static, never masked) and the lede; cols 7 to
 * 12 carry Fig. 1 on a night plate. On phones the plate follows the text and
 * starts inside the first screen. Under the lede, the wall's count line
 * links to the op-eds (#businessday) in one tap (client review idea 2).
 */
export async function InsightsHero() {
  const { eyebrow, title, lede } = INSIGHTS_PAGE.hero;
  const counts = await getCommentaryCounts();
  return (
    <Section
      surface="lime"
      hero="light"
      id="overview"
      aria-labelledby="insights-title"
    >
      <Container>
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-6">
          <div className="@container lg:col-span-6 lg:pr-6">
            <Eyebrow flame>{eyebrow}</Eyebrow>
            <Display
              as="h1"
              size="xl"
              id="insights-title"
              // The display-xl size, capped so "transformation." never runs
              // past the text column into the plate (it is about 5.9em wide).
              className="mt-6 text-[min(var(--text-display-xl),16cqi)] leading-(--text-display-xl--line-height) tracking-(--text-display-xl--letter-spacing) lg:mt-8"
            >
              {title}
            </Display>
            <Lede className="mt-6 lg:mt-10">{lede}</Lede>
            {counts.opeds > 0 ? (
              <a
                href="#businessday"
                className="label text-ink hit-area duration-fast ease-standard hover:text-ink-muted mt-6 inline-flex items-center gap-2 transition-colors lg:mt-8"
              >
                <FlameBullet className="h-[1.3em] shrink-0" />
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
