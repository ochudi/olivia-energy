import { FOUNDER } from "./about";
import { SITE } from "./site";

/**
 * Per-page search metadata. Titles stay under 60 characters and lead with
 * the terms the site targets (energy advisory, energy economics, energy
 * transition consulting, United States and Nigeria); descriptions stay
 * under 160.
 */
export const SEO = {
  home: {
    title: `${SITE.name} | Energy Advisory for the US and Nigeria`,
    description:
      "Independent energy advisory and research for the United States and Nigeria: strategy, regulation, transactions, downstream and gas, and the energy transition.",
  },
  whatWeDo: {
    title: `Energy Advisory & Transition Consulting | ${SITE.name}`,
    description:
      "Six service lines for the US and Nigeria: strategy, regulation and policy, transaction advisory, downstream and gas, the energy transition, and research.",
  },
  about: {
    title: `About ${SITE.name} | Energy Economics, US and Nigeria`,
    description:
      "Energy advisory and research that began in fuel retail in Nigeria in 2020, registered in the United States and Nigeria and led by a Ph.D. economist.",
  },
  insights: {
    title: `Insights on Energy Markets & the Transition | ${SITE.name}`,
    description:
      "Analysis and briefings on energy markets, policy and regulation, the energy transition, gas, power and finance in the United States and Nigeria.",
  },
  publications: {
    title: `Energy Economics Research & Publications | ${SITE.name}`,
    description: `Journal articles by ${FOUNDER.name}, founder of ${SITE.name}, chiefly on energy, the environment and growth in Africa, linked to each published version.`,
  },
  contact: {
    title: `Contact ${SITE.name} | Energy Advisory, US and Nigeria`,
    description:
      "Write to Olivia Energy about an investment, a licence, a market entry or a policy question. We work from Fort Worth, Texas, and Otta, Ogun State.",
  },
  /** Appended by the root template to titles that are not absolute. */
  suffix: ` | ${SITE.name}`,
  /** Search-facing line for the site as a whole (WebSite, social card). */
  tagline: "Energy advisory for the United States and Nigeria",
  /** What the organisation is about, for structured data. */
  knowsAbout: [
    "Energy economics",
    "Energy advisory",
    "Energy transition",
    "Energy policy and regulation",
    "Downstream oil and gas",
    "Gas-to-power",
    "Energy transaction advisory",
  ],
} as const;
