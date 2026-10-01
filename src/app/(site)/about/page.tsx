import {
  AboutStory,
  Founder,
  Philosophy,
  Registrations,
  Values,
  VisionMission,
} from "@/components/sections/about";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = pageMetadata({
  ...SEO.about,
  path: "/about",
});

/**
 * About — story, vision and mission, values, philosophy, founder and
 * registrations. Copy lives in content/about.
 */
export default function Page() {
  return (
    <>
      <AboutStory />
      <VisionMission />
      <Values />
      <Philosophy />
      <Founder />
      <Registrations />
    </>
  );
}
