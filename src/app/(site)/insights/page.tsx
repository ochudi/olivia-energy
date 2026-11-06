import { CloseBand } from "@/components/blocks";
import {
  Articles,
  BusinessDay,
  InsightsHero,
  WhatWePublish,
} from "@/components/sections/insights";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Viewport } from "next";
import { getPublishedPosts } from "@/lib/supabase/queries";

/** The browser chrome on phones takes the lime hero. */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#88c029",
};

export const generateMetadata = pageMetadata({
  ...SEO.insights,
  path: "/insights",
});

/**
 * Insights (creative brief 4.4): the lime hero with Fig. 1, the op-eds in
 * BusinessDay (#businessday) with the reports that quote him, the articles,
 * the eight formats and the red close. Q3 moved the BusinessDay section up
 * from fourth to second (client review P0-2): the founder's published work
 * comes before the formats that are still "First issue coming". The brief's
 * order was hero, formats, articles, BusinessDay; to restore it, swap the
 * two lines below. Fully static: the topic
 * filter is a set of static routes of its own (/insights/category/[slug]),
 * so this page reads no searchParams.
 */
export default async function Page() {
  const posts = await getPublishedPosts();
  return (
    <>
      <InsightsHero />
      <BusinessDay />
      <Articles posts={posts} active={null} />
      <WhatWePublish />
      <CloseBand variant="insights" />
    </>
  );
}
