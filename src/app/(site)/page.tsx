import { CloseBand, WhoWeServe } from "@/components/blocks";
import {
  HomeCommentary,
  HomeEvidence,
  HomeFounder,
  HomeServices,
} from "@/components/sections/home";
import { HomeOpening } from "@/components/sections/home/opening";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = pageMetadata({
  ...SEO.home,
  path: "/",
});

/**
 * Home (creative brief 4.1): the opening (hero and Why Olivia in the mark
 * window), the gaps measured, services, who we serve, the founder, the
 * op-eds on the record in BusinessDay, and the red close band. Copy:
 * src/content/home.ts and src/content/brand.ts.
 */
export default function HomePage() {
  return (
    <>
      <HomeOpening />
      <HomeEvidence />
      <HomeServices />
      <WhoWeServe variant="compact" />
      <HomeFounder />
      <HomeCommentary />
      <CloseBand variant="home" />
    </>
  );
}
