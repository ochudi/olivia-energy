import { ClosingCta } from "@/components/sections/home";
import { PhotoFigure } from "@/components/sections/photo-figure";
import {
  Differentiators,
  ServiceLines,
  WhatWeDoIntro,
  WhoWeServe,
} from "@/components/sections/what-we-do";
import { PHOTOS } from "@/content/images";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = pageMetadata({
  ...SEO.whatWeDo,
  path: "/what-we-do",
});

/**
 * What we do — positioning statement, six anchored service-line sections
 * with a sticky in-page nav on desktop, a full-bleed photograph, who we
 * serve, three differentiators and the shared closing call to action.
 * Copy lives in content/what-we-do.
 */
export default function Page() {
  return (
    <>
      <WhatWeDoIntro />
      <ServiceLines />
      <PhotoFigure
        photo={PHOTOS.whatWeDoBand}
        bleed
        frameClassName="aspect-[4/3] max-h-[36rem] w-full md:aspect-[21/9]"
        sizes="100vw"
        className="pb-section"
      />
      <WhoWeServe />
      <Differentiators />
      <ClosingCta />
    </>
  );
}
