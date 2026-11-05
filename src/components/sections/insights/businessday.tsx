import { CoverWall } from "@/components/blocks";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { COVER_COPY } from "@/content/brand";
import { INSIGHTS_PAGE } from "@/content/insights";
import {
  getCommentaryCounts,
  getMentions,
  getOpEds,
} from "@/lib/supabase/queries";
import { QuotedIn } from "./quoted-in";

/**
 * In BusinessDay (creative brief 4.4 sections 4 and 5), `#businessday`,
 * the anchor the home page links to: every op-ed as a cover wall in its
 * archive layout (the newest as the lime lead), then the reports that
 * quote him. Op-eds, mentions and counts come from the database, or from
 * the static commentary when it has none.
 */
export async function BusinessDay() {
  const [opeds, mentions, counts] = await Promise.all([
    getOpEds(),
    getMentions(),
    getCommentaryCounts(),
  ]);
  const copy = INSIGHTS_PAGE.businessday;
  return (
    <Section
      surface="paper"
      id="businessday"
      aria-labelledby="businessday-title"
      className="scroll-mt-header"
    >
      <Container>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <div className="lg:col-span-7">
            <Eyebrow flame>{copy.eyebrow}</Eyebrow>
            <Display
              as="h2"
              size="lg"
              reveal="mask"
              id="businessday-title"
              className="mt-6"
            >
              {copy.title}
            </Display>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Lede>{copy.lede}</Lede>
            <p className="label text-ink-muted numerals mt-6">
              {COVER_COPY.countLine(counts)}
            </p>
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <CoverWall opeds={opeds} layout="archive" headingLevel={3} />
        </div>

        <QuotedIn mentions={mentions} counts={counts} />
      </Container>
    </Section>
  );
}
