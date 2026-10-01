import {
  ClosingCta,
  Heritage,
  Hero,
  LatestInsights,
  ServicesGrid,
  StatsBand,
} from "@/components/sections/home";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = pageMetadata({
  ...SEO.home,
  path: "/",
});

/**
 * Home — hero, services index, heritage (with the chapter photograph), the
 * stats band (hidden unless an admin switches it on), latest insights
 * and the closing call to action. Copy: src/content/home.ts
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <Heritage />
      <StatsBand />
      <LatestInsights />
      <ClosingCta />
    </>
  );
}
