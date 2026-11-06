/**
 * About page copy (creative brief 4.3): hero, our story, who we are,
 * vision and mission, values, the founder, where we started, the close.
 * Guideline blocks come from ./brand.
 *
 * Sources for the dated facts: the company's CAC record (incorporation,
 * RC number), Brand Spur's reports of June and November 2020 (the two
 * retail outlets), and the client's message of 3 October 2026 (the United
 * States entity, his title, and the Nigerian location, which reads
 * "Southwest Nigeria": no town or state is named anywhere on the site).
 * For the founder: degrees and dates as self-declared on
 * his ORCID record; the Master of Public Service and USAEE membership from
 * his BusinessDay author notes; citations from Google Scholar on
 * 2 October 2026. Employers, years of experience and talks are left out
 * until the client supplies evidence (decision 13).
 */
import type { Counts, PhotoKey } from "@/types/contracts";
import { countWords } from "@/lib/content/format";
import { BRAND_STORY, VALUES_LIST } from "./brand";

export const ABOUT_HERO: { title: string; lede: string } = {
  title: BRAND_STORY.headline,
  lede: BRAND_STORY.lede,
};

export const ABOUT_STORY: {
  heading: string;
  paragraph: string;
  statement: string;
  photo: PhotoKey;
  caption: string;
} = {
  heading: BRAND_STORY.storyHeading,
  paragraph: BRAND_STORY.paragraph,
  statement: BRAND_STORY.statement,
  photo: "abuja-lightpoles",
  caption: "Street lights at sunset, Abuja. Photo: Habila Mazawaje, Unsplash",
};

export type FounderPageCounter = {
  key: "articles" | "citations" | "opeds" | "mentions";
  /** Fixed value; when absent the counter reads Counts[key]. */
  value?: string;
  label: string;
};

export const FOUNDER_PAGE: {
  name: string;
  /** Two lines under the name: the title, then the discipline and place. */
  roles: readonly [string, string];
  points: (c: Counts) => readonly string[];
  timeline: {
    heading: string;
    dated: readonly { year: string; label: string }[];
    undated: readonly string[];
    source: string;
  };
  counters: readonly FounderPageCounter[];
  /** Pills under the portrait; URLs from FOUNDER.links and settings. */
  profileLabels: readonly string[];
} = {
  name: "Dr Olugbenga Olaoye",
  roles: ["Founder/CEO, Olivia Energy", "Energy economist, Fort Worth, Texas"],
  points: (c) => [
    "A PhD in Economics from Covenant University, with a focus on energy and environmental economics.",
    "A Master of Public Service from the Clinton School of Public Service, University of Arkansas, grounded in governance and policy.",
    "An executive MBA from Lagos Business School, and PMP and Certified ScrumMaster credentials for strategy execution.",
    "A published energy policy analyst, with nine journal articles since 2022, and a BusinessDay contributor.",
    `A commentator on downstream reform, energy security and the energy transition, quoted as an energy economist in ${countWords(c.mentions)} BusinessDay reports.`,
    "Someone who bridges industry, academia and public policy, and a member of the United States Association for Energy Economics.",
  ],
  timeline: {
    heading: "Credentials",
    dated: [
      { year: "2000", label: "BSc Economics, Obafemi Awolowo University" },
      { year: "2019", label: "Executive MBA, Lagos Business School" },
      { year: "2022", label: "MSc Economics, Bells University of Technology" },
      { year: "2025", label: "PhD Economics, Covenant University" },
    ],
    undated: [
      "Master of Public Service, Clinton School of Public Service",
      "Project Management Professional (PMP)",
      "Certified ScrumMaster (CSM)",
      "Member, United States Association for Energy Economics",
    ],
    source:
      "Degrees and dates as listed on his ORCID record (0000-0003-2658-916X). Master of Public Service and USAEE membership as stated in his BusinessDay author notes.",
  },
  counters: [
    { key: "articles", value: "9", label: "journal articles" },
    {
      key: "citations",
      value: "200+",
      label: "citations, Google Scholar, 2 October 2026",
    },
    { key: "opeds", label: "op-eds in BusinessDay" },
    { key: "mentions", label: "BusinessDay reports quoting him" },
  ],
  profileLabels: ["ORCID", "Google Scholar", "LinkedIn"],
};

/** "Where we started": the retail origin, told once (decision 8). */
export const ORIGIN: {
  title: string;
  paragraph: string;
  facts: readonly { term: string; detail: string }[];
} = {
  title: "Real-world operations, since 2020.",
  paragraph:
    "Olivia Energy and Power Company Limited was incorporated in Nigeria on 26 February 2020. That year it opened two fuel retail outlets in Southwest Nigeria, in June and in November. Running them is where our practical view of energy markets began.",
  /** One row per registered entity (REGISTRATIONS, in order), then the places. */
  facts: [
    {
      term: "Nigeria",
      detail:
        "Olivia Energy and Power Company Limited, RC 1662525, incorporated 26 February 2020",
    },
    {
      term: "United States",
      detail:
        "Olivia Group LLC, Registration ID 805857089, formed 14 January 2025",
    },
    { term: "Locations", detail: "Fort Worth, Texas, and Southwest Nigeria" },
  ],
};

/** "Our values" (About section 5): header plus the five rows of VALUES_LIST. */
export const ABOUT_VALUES: {
  title: string;
  items: typeof VALUES_LIST;
} = {
  title: "What we hold ourselves to.",
  items: VALUES_LIST,
};

/**
 * The founder, for structured data, bylines and the profile pills.
 * json-ld.ts reads name, alternateNames, role, portrait.src, credentials,
 * alumniOf, memberOf and profiles; llms.ts reads name and profiles; the
 * social card and article bylines read name.
 */
export const FOUNDER = {
  name: "Dr Olugbenga Olaoye",
  /** Person.jobTitle in structured data. */
  role: "Founder/CEO",
  /** Person.hasCredential; the page sets them as "PhD, MPS, MBA, PMP, CSM". */
  credentials: [
    "PhD in Economics",
    "Master of Public Service",
    "Executive MBA",
    "Project Management Professional (PMP)",
    "Certified ScrumMaster (CSM)",
  ],
  /**
   * sameAs in structured data, so search and answer engines resolve the
   * founder to one person. Google Scholar comes from settings (scholar_url).
   */
  profiles: [
    "https://orcid.org/0000-0003-2658-916X",
    "https://openalex.org/A5091615039",
  ],
  /** The profile pills. Settings (scholar_url) overrides `scholar`. */
  links: {
    orcid: "https://orcid.org/0000-0003-2658-916X",
    scholar: "https://scholar.google.com/citations?user=7U3pwDIAAAAJ",
  },
  alternateNames: ["Olugbenga O. Olaoye", "Olugbenga Olaposi Olaoye"],
  /** Self-declared on ORCID, plus the Clinton School (BusinessDay author note). */
  alumniOf: [
    "Covenant University",
    "Clinton School of Public Service, University of Arkansas",
    "Lagos Business School",
    "Bells University of Technology",
    "Obafemi Awolowo University",
  ],
  memberOf: "United States Association for Energy Economics",
  portrait: {
    /** Supplied 2026-09-06 as a 622×622 PNG on white; cropped to 4:5 on the page. */
    src: "/founder/dr-olugbenga-olaoye.png" as string | null,
    aspect: "4 / 5",
    alt: "Dr Olugbenga Olaoye, founder of Olivia Energy",
    /** Shown under the frame only if the portrait file is removed. */
    caption: "Dr Olugbenga Olaoye, Founder/CEO and energy economist",
  },
} as const;

export type Registration = {
  region: string;
  label: string;
  detail: string;
  /** What the registry calls its number ("RC", "Registration ID"). */
  registry: string;
  /** Registry number and incorporation date, for structured data. */
  number: string;
  founded: string;
};

/**
 * Company registrations, the Nigerian company first (it is the site's
 * legal name). Sources: the CAC record (RC number and date of
 * incorporation); the client's message of 3 October 2026 (the United States
 * entity). Read by structured data, llms.txt and ORIGIN.facts on About.
 */
export const REGISTRATIONS: readonly Registration[] = [
  {
    region: "Nigeria",
    label: "Olivia Energy and Power Company Limited",
    detail: "RC 1662525, incorporated 2020",
    registry: "RC",
    number: "1662525",
    founded: "2020-02-26",
  },
  {
    region: "United States",
    label: "Olivia Group LLC",
    detail: "Registration ID 805857089, formed 2025",
    registry: "Registration ID",
    number: "805857089",
    founded: "2025-01-14",
  },
];
