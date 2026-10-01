/**
 * What We Do page copy: the positioning statement, two sentences and five
 * bullets per service line, the "Who we serve" grid and the "What makes us
 * different" list. This is positioning. The facts it relies on are the
 * retail outlets opened in Ogun State in 2020 (Brand Spur), the company
 * record and the founder's published research (OpenAlex). Two claims from
 * the client's brief, a United States registration and NIPEX registration,
 * are left out until the client supplies the entity name and the numbers;
 * the NIPEX line then goes in Admin → Settings.
 *
 * Service names, order and slugs come from ./site so the home index,
 * the footer and this page can never disagree.
 */
import type { Service } from "./site";

export const INTRO = {
  eyebrow: "What we do",
  title: "What clients hire us to do.",
  positioning:
    "Olivia Energy is an independent energy consultancy working in the United States and Nigeria. We advise the producers, distributors, investors and public institutions that operate, finance and regulate oil, gas and power in both markets, and we bring to that work our own experience of fuel retail in Nigeria and published research in energy and environmental economics.",
} as const;

export type ServiceLine = {
  slug: Service["slug"];
  /** Two sentences in plain English. */
  description: string;
  /** Five bullets: the work the line covers. */
  bullets: readonly [string, string, string, string, string];
};

export const SERVICE_LINES: readonly ServiceLine[] = [
  {
    slug: "strategy",
    description:
      "We help energy businesses decide where to compete and how. The work runs from a first assessment of a market to a full entry or expansion plan.",
    bullets: [
      "Market assessment and sizing",
      "Entry and expansion strategy",
      "Business model and pricing design",
      "Partner and route-to-market selection",
      "Board and investment committee papers",
    ],
  },
  {
    slug: "regulatory",
    description:
      "Energy is a licensed business in both of our markets, and the rules move. We help clients obtain and keep the permissions they need, and we give regulators and policymakers an operator’s reading of what they propose.",
    bullets: [
      "Licensing and permit applications",
      "Compliance reviews and audits",
      "Regulatory impact analysis",
      "Engagement with regulators and ministries",
      "Policy design and position papers",
    ],
  },
  {
    slug: "transactions",
    description:
      "Buying, selling or financing an energy asset turns on questions that operators answer best. We support investors, lenders and owners through diligence, structuring and negotiation, with an honest view of what the asset can earn.",
    bullets: [
      "Commercial and technical due diligence",
      "Valuation and financial modelling",
      "Deal structuring and term sheets",
      "Negotiation and closing support",
      "Post-acquisition integration planning",
    ],
  },
  {
    slug: "downstream",
    description:
      "Fuel retail is where Olivia Energy began, with two retail outlets opened in Ogun State in 2020. We bring that operating experience to clients building, buying or improving downstream businesses, from forecourt economics to supply and offtake agreements.",
    bullets: [
      "Retail network strategy and site economics",
      "Storage, terminal and depot planning",
      "Supply, logistics and inventory management",
      "Gas distribution and offtake agreements",
      "Operational turnaround and margin recovery",
    ],
  },
  {
    slug: "transition",
    description:
      "The transition looks different from Nigeria than from the United States, and we advise in both. We help clients set decarbonisation pathways that hold up commercially, with particular attention to the role of gas, power and cleaner fuels in growing markets.",
    bullets: [
      "Decarbonisation pathways and target setting",
      "Gas-to-power and cleaner fuel strategies",
      "Renewable and distributed energy assessment",
      "Sustainability reporting and disclosure",
      "Transition finance and investment cases",
    ],
  },
  {
    slug: "research",
    description:
      "Our research is led by a PhD economist whose work on energy use and environmental quality in Africa is published in academic journals. We take on commissioned studies, market reports and policy briefings, and publish our own analysis of the questions that matter in the markets we serve.",
    bullets: [
      "Commissioned studies and market reports",
      "Economic and econometric analysis",
      "Data collection and survey design",
      "Policy briefings and white papers",
      "Conference papers and peer-reviewed publication",
    ],
  },
];

export type ClientSegment = { title: string; body: string };

export const WHO_WE_SERVE_HEADING = {
  eyebrow: "Who we serve",
  title: "Six kinds of client, in both markets.",
  lede: "The kinds of organisation we work with. We do not publish client names.",
} as const;

export const WHO_WE_SERVE: readonly ClientSegment[] = [
  {
    title: "Producers and operators",
    body: "Upstream and midstream companies weighing strategy, regulation and the commercial case for new investment.",
  },
  {
    title: "Downstream and retail",
    body: "Fuel marketers, storage owners and gas distributors improving networks, margins and supply arrangements.",
  },
  {
    title: "Investors and lenders",
    body: "Funds, banks and development finance institutions that need an operator’s view before they commit capital.",
  },
  {
    title: "Power developers",
    body: "Independent power producers and gas-to-power sponsors from feasibility through to financial close.",
  },
  {
    title: "Regulators and policymakers",
    body: "Ministries, agencies and regulators testing how a rule, a tariff or a reform will land in the market.",
  },
  {
    title: "Research institutions",
    body: "Universities, multilateral agencies and think tanks commissioning evidence on energy in growing economies.",
  },
];

export type Differentiator = { title: string; body: string };

export const DIFFERENTIATORS_HEADING = {
  eyebrow: "In short",
  title: "Three things you can hold us to.",
} as const;

export const DIFFERENTIATORS: readonly Differentiator[] = [
  {
    title: "We have run an energy business.",
    body: "The practice grew out of fuel retail: Olivia Energy opened two fuel retail outlets in Ogun State in 2020. We know what a plan costs to carry out because we have carried one out.",
  },
  {
    title: "Research you can check.",
    body: "Every recommendation cites the evidence behind it, and the founder’s research is published in academic journals, where others can test it.",
  },
  {
    title: "Working in both markets.",
    body: "Olivia Energy is incorporated in Nigeria and its founder is based in Fort Worth, Texas. What we learn in one market informs the work in the other.",
  },
];
