import { CoverWall } from "@/components/blocks";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
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
 * archive layout (the newest as the lime lead), assembling as the reader
 * arrives at it (the page's signature moment, DESIGN.md Layout), then the
 * reports that quote him. Op-eds, mentions and counts come from the
 * database, or from the static commentary when it has none.
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
          <Display
            as="h2"
            size="lg"
            id="businessday-title"
            className="lg:col-span-7"
          >
            {copy.title}
          </Display>
          <div className="lg:col-span-5 lg:pb-2">
            <Lede>{copy.lede}</Lede>
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <CoverWall opeds={opeds} layout="archive" assemble headingLevel={3} />
        </div>

        <QuotedIn mentions={mentions} counts={counts} />
      </Container>
    </Section>
  );
}
