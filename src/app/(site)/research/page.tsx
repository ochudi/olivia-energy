import { CloseBand } from "@/components/blocks";
import { PublicationsJsonLd } from "@/components/publications";
import {
  CommentaryList,
  JournalArticles,
  Profiles,
  ResearchHero,
  ResearchQuote,
} from "@/components/sections/research";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/urls";
import {
  getCommentaryCounts,
  getJournalArticles,
  getOpEds,
  getSettings,
} from "@/lib/supabase/queries";

export const generateMetadata = pageMetadata({
  ...SEO.research,
  path: "/research",
});

/**
 * Research: the print timeline, his Dangote line in the
 * quotation panel, the journal articles,
 * the BusinessDay commentary, the profiles, and the red close. Journal rows
 * and op-eds come from the database (static data when it is unavailable);
 * all reads are cached by tag, so the page is static until an admin saves.
 */
export default async function Page() {
  const [journals, opeds, counts, settings] = await Promise.all([
    getJournalArticles(),
    getOpEds(),
    getCommentaryCounts(),
    getSettings(),
  ]);
  return (
    <>
      <PublicationsJsonLd
        publications={journals}
        url={absoluteUrl("/research")}
      />
      <ResearchHero journals={journals} opeds={opeds} counts={counts} />
      <ResearchQuote opeds={opeds} />
      <JournalArticles journals={journals} />
      <CommentaryList opeds={opeds} counts={counts} />
      <Profiles scholarUrl={settings.scholar_url} />
      <CloseBand variant="research" />
    </>
  );
}
