import { CloseBand, WhoWeServe } from "@/components/blocks";
import {
  Chapters,
  Differentiators,
  Pillars,
  WhatWeDoHero,
} from "@/components/sections/what-we-do";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Viewport } from "next";

/** The browser chrome on phones takes the green hero. */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#047a36",
};

export const generateMetadata = pageMetadata({
  ...SEO.whatWeDo,
  path: "/what-we-do",
});

/**
 * What we do: the green hero with Fig. 1, the chapter
 * bar and six service chapters (Fig. 2 in chapter 02), what makes us
 * different, the four pillars, who we serve and the red close. Copy lives
 * in content/what-we-do, content/site and content/brand.
 */
export default function Page() {
  return (
    <>
      <WhatWeDoHero />
      <Chapters />
      <Differentiators />
      <Pillars />
      <WhoWeServe variant="full" />
      <CloseBand variant="whatWeDo" />
    </>
  );
}
