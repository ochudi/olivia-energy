/**
 * About page copy: story, vision and mission, values, philosophy, founder
 * and registrations.
 *
 * Sources for the dated facts: the company's CAC record (incorporation,
 * RC number), Brand Spur's reports of June and November 2020 (the two
 * retail outlets), and for the founder his BusinessDay author biography
 * (January 2026), a BusinessDay report quoting him (March 2026), his
 * LinkedIn profile, and his Google Scholar, OpenAlex and ORCID records.
 * Vision, mission, values and philosophy are positioning, not fact.
 */

export const STORY = {
  eyebrow: "About",
  title: "A practice built in Nigeria’s downstream.",
  lede: "An advisory and research practice for energy markets in the United States and Nigeria, grown from a fuel retail business in Ogun State.",
  sectionEyebrow: "Our story",
  paragraphs: [
    "Olivia Energy and Power Company Limited was incorporated in Nigeria in February 2020 as a fuel retailer.",
    "Its first service station opened at Sango Ota, Ogun State, in June 2020, designed to serve more than 1,000 customers a day with fuel, lubricants, a bakery, a car wash and an ATM on site. A second outlet opened at Oju Ore, Otta, that November. The company’s stated principle was that every litre dispensed is a litre the customer receives.",
    "The advisory and research practice builds on that operating record and on the work of its founder, Dr Olugbenga Olaoye, an energy economist with downstream experience across continents. His research on energy use and environmental quality in Africa has appeared in academic journals since 2022. The practice now works in the United States and Nigeria.",
  ],
} as const;

export const VISION_MISSION = {
  vision: {
    label: "Vision",
    statement:
      "Energy markets where investment and policy decisions rest on evidence.",
  },
  mission: {
    label: "Mission",
    statement:
      "To give investors, operators and regulators in the United States and Nigeria advice grounded in operating experience and published research.",
  },
} as const;

export type Value = { title: string; body: string };

export const VALUES: readonly Value[] = [
  {
    title: "Evidence",
    body: "We start from the data and say what it shows, including when it is unwelcome.",
  },
  {
    title: "Independence",
    body: "We have no vendor, lender or technology to favour. Our advice answers to the client’s question.",
  },
  {
    title: "Experience",
    body: "Advice from people who have run an energy business, not only studied one.",
  },
  {
    title: "Integrity",
    body: "We say plainly what we can and cannot do, and we put our name to what we publish.",
  },
];

/** Set as a serif pull-quote block. */
export const PHILOSOPHY = {
  eyebrow: "Our philosophy",
  lines: [
    "Evidence before opinion.",
    "Experience before theory.",
    "Outcomes before output.",
  ],
} as const;

export const FOUNDER = {
  eyebrow: "Founder",
  name: "Dr Olugbenga Olaoye",
  /** Founder per the client's brief; chief executive per his LinkedIn headline. */
  role: "Founder and Chief Executive Officer",
  /** As listed in the client's brief; the biography spells them out. */
  credentials: ["PhD Economics", "MPS", "MBA", "PMP", "CSM"],
  /**
   * For structured data and llms.txt, so search and answer engines resolve
   * the founder to one person. Sources: his ORCID and OpenAlex records, the
   * bylines on his papers, and his BusinessDay biography.
   */
  profiles: [
    "https://orcid.org/0000-0003-2658-916X",
    "https://openalex.org/A5091615039",
  ],
  alternateNames: ["Olugbenga O. Olaoye", "Olugbenga Olaposi Olaoye"],
  alumniOf: [
    "Covenant University",
    "Clinton School of Public Service, University of Arkansas",
    "Lagos Business School",
  ],
  memberOf: "United States Association for Energy Economics",
  bio: [
    "Dr Olugbenga Olaoye is an economist and energy professional with extensive experience in the oil and gas industry, including downstream operations across continents. He founded Olivia Energy, leads it as chief executive and is based in Fort Worth, Texas. He holds a PhD in economics from Covenant University, where he specialised in energy economics, a Master of Public Service from the Clinton School of Public Service at the University of Arkansas, and an executive MBA from Lagos Business School. He also holds PMP and CSM certifications.",
    "His research examines energy consumption, environmental quality and economic growth in Africa, including the roles of environmental regulation, financial inclusion and trade, and has appeared since 2022 in journals including the International Journal of Energy Economics and Policy and Scientific African. He is a member of the United States Association for Energy Economics and has written for BusinessDay on energy security. Quoted by the paper in March 2026 on the surge in oil prices, he said that Nigeria “exports crude but still imports fuel, so rising prices increase both revenues and costs at the same time.”",
  ],
  portrait: {
    /** Supplied 2026-09-06 as a 622×622 PNG on white; cropped to 4:5 on the page. */
    src: "/founder/dr-olugbenga-olaoye.png" as string | null,
    aspect: "4 / 5",
    alt: "Dr Olugbenga Olaoye, founder of Olivia Energy",
    /** Shown under the frame only if the portrait file is removed. */
    caption: "Dr Olugbenga Olaoye, Founder and Chief Executive Officer",
  },
  link: { label: "Publications", href: "/publications" },
} as const;

export type Registration = {
  region: string;
  label: string;
  detail: string;
  /** Registry number and incorporation date, for structured data. */
  number: string;
  founded: string;
};

/**
 * Company registrations, one hairline row each. Source: the CAC record
 * (RC number and year of incorporation). Add a row here when another
 * registration can be shown with its entity name and number.
 */
export const REGISTRATIONS: readonly Registration[] = [
  {
    region: "Nigeria",
    label: "Olivia Energy and Power Company Limited",
    detail: "RC 1662525 · Incorporated 2020",
    number: "1662525",
    founded: "2020-02-26",
  },
];
