import { CloseBand } from "@/components/blocks";
import {
  AboutHero,
  AboutStoryBand,
  Founder,
  Origin,
  Values,
  VisionMission,
  WhoWeAre,
} from "@/components/sections/about";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Viewport } from "next";

/** The browser chrome on phones takes the night hero. */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#06170e",
};

export const generateMetadata = pageMetadata({
  ...SEO.about,
  path: "/about",
});

/**
 * About (creative brief 4.3): ignition, our story, who we are, vision and
 * mission, values, the founder, where we started, and the close. Copy
 * lives in content/about and content/brand.
 */
export default function Page() {
  return (
    <>
      <AboutHero />
      <AboutStoryBand />
      <WhoWeAre />
      <VisionMission />
      <Values />
      <Founder />
      <Origin />
      <CloseBand variant="about" />
    </>
  );
}
