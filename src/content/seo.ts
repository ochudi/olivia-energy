import { HOME_HERO } from "./home";
import { SITE } from "./site";

type PageSeo = { title: string; description: string };

const RESEARCH: PageSeo = {
  title: "Research: journal articles and commentary",
  description:
    "Peer-reviewed research and BusinessDay commentary by Dr Olugbenga Olaoye on energy economics, environmental quality and policy.",
};

/**
 * Per-page search metadata (creative brief 3.5). Titles stay at 60
 * characters or fewer with the suffix, descriptions at 160 or fewer;
 * pageMetadata() in src/lib/seo/metadata.ts drops the suffix from any title
 * it would push over 60. Privacy keeps its own metadata in ./legal.
 */
export const SEO = {
  home: {
    title: "Olivia Energy: energy advisory, research and sustainability",
    description:
      "Olivia Energy is a strategic energy advisory, research and sustainability consultancy working towards a cleaner, more secure and more inclusive energy future.",
  },
  whatWeDo: {
    title: "What we do: energy transition, policy and ESG advice",
    description:
      "Six services, from energy transition advisory and energy policy to ESG, research and analytics, capacity development and project advisory.",
  },
  about: {
    title: "About Olivia Energy and our founder",
    description:
      "Olivia Energy helps organisations navigate the energy transition. Founded by Dr Olugbenga Olaoye, energy economist and BusinessDay contributor.",
  },
  insights: {
    title: "Insights: energy analysis and commentary",
    description:
      "Analysis, commentary and data on energy security, downstream markets and the energy transition in Africa, including op-eds in BusinessDay.",
  },
  research: RESEARCH,
  contact: {
    title: "Contact Olivia Energy",
    description:
      "Start a conversation with Olivia Energy, in Fort Worth, Texas and Southwest Nigeria.",
  },
  credits: {
    title: "Credits",
    description:
      "Photographs, data and typefaces used on this site, with their authors and licences.",
  },
  /** Appended by the root template to titles that are not absolute. */
  suffix: ` | ${SITE.name}`,
  /** Search-facing line for the site as a whole (WebSite, social card alt). */
  tagline: SITE.tagline,
  /** The social card (creative brief 3.4). */
  socialCard: {
    footer: HOME_HERO.eyebrow,
    founder: "Founded by Dr Olugbenga Olaoye",
  },
  /** The firm's X account, credited on social cards. */
  twitterSite: "@OliviaEnergy",
  /** The Insights feed, advertised on every page for feed readers. */
  feed: { path: "/insights/feed.xml", title: "Olivia Energy Insights" },
  /** What the organisation is about, for structured data. */
  knowsAbout: [
    "Energy transition",
    "Energy economics",
    "Energy policy",
    "ESG and sustainability",
    "Energy security",
    "Downstream petroleum markets",
    "Dangote refinery",
    "Electricity access in Africa",
  ],
} as const;
