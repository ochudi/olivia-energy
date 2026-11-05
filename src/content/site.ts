/**
 * Site-wide content: name, navigation, services, contact, header and
 * footer furniture, and the shared microcopy (creative brief 3.1 to 3.6).
 *
 * Keeping it here (rather than inside components) means the header, footer
 * and mobile menu can never disagree, and the copy can be changed without
 * touching UI.
 */
import type {
  Cta,
  FactTag,
  GlyphName,
  PhotoKey,
  ServiceSlug,
} from "@/types/contracts";
import { TAGLINE } from "./brand";

export const SITE = {
  name: "Olivia Energy",
  legalName: "Olivia Energy and Power Company Limited",
  /**
   * Tagline 1 in full (decision 1). The footer reads the tagline from
   * Admin, Settings when it is set and splits it at the first full stop.
   */
  tagline: `${TAGLINE.line1} ${TAGLINE.line2}`,
  /** One-sentence description, used in the web app manifest. */
  description:
    "Olivia Energy is a strategic energy advisory, research and sustainability consultancy working towards a cleaner, more secure and more inclusive energy future.",
} as const;

export type NavLink = { label: string; href: string };

export const NAV: readonly NavLink[] = [
  { label: "What we do", href: "/what-we-do" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Research", href: "/research" },
];

/** The header button, and the last item of the phone menu. */
export const NAV_CTA: Cta = { label: "Start a conversation", href: "/contact" };

/** Header furniture (creative brief 3.1). */
export const HEADER_COPY = {
  menu: "Menu",
  close: "Close",
  skip: "Skip to content",
} as const;

export type Service = {
  /** Anchor on /what-we-do. */
  slug: ServiceSlug;
  /** "01" to "06". */
  number: string;
  title: string;
  /** Chapter bar label, shown after the number ("01 Transition"). */
  short: string;
  /** One sentence, shown on the home cards and in llms.txt. */
  summary: string;
  glyph: GlyphName;
  photo: PhotoKey;
};

/**
 * The six services, in the guideline order. Chapter copy: ./what-we-do,
 * joined by slug.
 */
export const SERVICES: readonly Service[] = [
  {
    slug: "energy-transition-advisory",
    number: "01",
    title: "Energy Transition Advisory",
    short: "Transition",
    summary:
      "Net-zero strategies, decarbonisation roadmaps and transition plans, with renewable integration and climate resilience built in.",
    glyph: "transition",
    photo: "tarfaya-wind",
  },
  {
    slug: "energy-economics-policy",
    number: "02",
    title: "Energy Economics & Policy",
    short: "Economics & Policy",
    summary:
      "Energy market analysis, regulatory advice, economic impact studies, tariff analysis and policy development.",
    glyph: "economics-policy",
    photo: "abuja-city-gate",
  },
  {
    slug: "esg-sustainability",
    number: "03",
    title: "ESG & Sustainability",
    short: "ESG",
    summary:
      "ESG strategy and reporting, materiality assessments, sustainability reporting and carbon management.",
    glyph: "esg",
    photo: "bayelsa-flare",
  },
  {
    slug: "research-analytics",
    number: "04",
    title: "Research & Analytics",
    short: "Research",
    summary:
      "Market intelligence, industry reports, feasibility studies, data analytics and scenario modelling.",
    glyph: "research-analytics",
    photo: "lagos-market",
  },
  {
    slug: "capacity-development",
    number: "05",
    title: "Capacity Development",
    short: "Capacity",
    summary:
      "Executive training, energy transition workshops, ESG education, leadership development and public policy seminars.",
    glyph: "capacity",
    photo: "lecture-hall",
  },
  {
    slug: "project-advisory",
    number: "06",
    title: "Project Advisory",
    short: "Projects",
    summary:
      "Project and programme management, stakeholder engagement, risk management, and monitoring and evaluation.",
    glyph: "project",
    photo: "ethiopia-lineman",
  },
];

export const CONTACT = {
  /** Supplied 2026-09-06. Editable in Admin → Settings (contact_email); this is the default. */
  email: "info@oliviaenergyandpower.com",
  /**
   * Countries of operation, shown in the header menu and the footer. The
   * contact page takes city-level locations from settings (addresses).
   */
  offices: ["United States", "Nigeria"],
} as const;

export type SocialId = "linkedin" | "instagram" | "x";
export type SocialLink = { id: SocialId; label: string; href: string };

/**
 * Supplied 2026-09-29. Editable in Admin → Settings (socials); these are the
 * defaults the site falls back to.
 */
export const SOCIALS: readonly SocialLink[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/olivia-energy-and-power-company-ltd/",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/olivia.energy/",
  },
  { id: "x", label: "X", href: "https://x.com/OliviaEnergy" },
];

/**
 * The NIPEX registration line under the footer's legal line. It is the
 * default of the `nipex_wording` setting (Admin, Settings), so an admin can
 * reword or clear it. Vendor ID and categories supplied by the client on
 * 3 October 2026.
 */
export const NIPEX_WORDING: string =
  "NIPEX Vendor ID S77939994. Categories: Consultancy QA/QC, Petroleum Products Haulage/Logistics, Goods/Materials Haulage.";

/**
 * The footer (creative brief 3.2). Row 1 is the tagline (SITE.tagline or
 * the settings value), row 2 four columns, row 3 the legal line and the
 * photograph credits.
 */
export const FOOTER: {
  legalName: string;
  registration: string;
  places: string;
  headings: { services: string; company: string; contact: string };
  companyLinks: readonly Cta[];
  conversation: Cta;
  copyright: (year: number) => string;
  photoCredits: { text: string; link: Cta };
} = {
  legalName: SITE.legalName,
  registration: "RC 1662525",
  places: "Fort Worth, Texas · Southwest Nigeria",
  headings: {
    services: "What we do",
    company: "Company",
    contact: "Get in touch",
  },
  companyLinks: [
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Research", href: "/research" },
    { label: "Contact", href: "/contact" },
    { label: "Credits", href: "/credits" },
    { label: "Privacy", href: "/privacy" },
  ],
  conversation: NAV_CTA,
  copyright: (year) =>
    `© ${year} Olivia Energy and Power Company Limited. Incorporated in Nigeria.`,
  photoCredits: {
    text: "Photographs by Solasly, Rod Waddington, OgbuefiPascal, TEDxTarfaya, Baqeer Gashua, Fahd Aminu, Henry Storck, Habila Mazawaje and Opeyemi Adisa.",
    link: { label: "Full credits", href: "/credits" },
  },
};

/** Shared microcopy (creative brief 3.6). */
export const MICROCOPY: {
  /** Visually hidden suffix on every external link. */
  newTab: string;
  viewTable: string;
  getData: string;
  /** Visually hidden instruction beside a chart readout. */
  readoutHint: string;
  tags: Record<FactTag, FactTag>;
  empty: { format: string; episode: string; articles: string };
} = {
  newTab: ", opens in a new tab",
  viewTable: "View as table",
  getData: "Get the data (CSV)",
  readoutHint: "Use the left and right arrow keys to read each year.",
  tags: {
    Gap: "Gap",
    Opening: "Opening",
    Target: "Target",
    Context: "Context",
  },
  empty: {
    format: "First issue coming",
    episode: "First episode coming",
    articles: "The first articles are in preparation.",
  },
};
