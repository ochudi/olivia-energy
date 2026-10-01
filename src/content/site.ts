/**
 * Site-wide content: name, navigation, services, contact, legal.
 *
 * Keeping it here (rather than inside components) means the header, footer
 * and mobile menu can never disagree, and the copy can be changed without
 * touching UI.
 */

export const SITE = {
  name: "Olivia Energy",
  /**
   * Footer line; Admin → Settings (tagline) overrides it. The retail
   * business's line, "our fuel takes you further", is deliberately not
   * used: it speaks to fuel customers rather than advisory clients.
   */
  tagline: "Independent energy advisory, built on evidence.",
  /** One-sentence description, used in the web app manifest. */
  description:
    "Evidence-led strategy for producers, distributors and the institutions that finance them, across the United States and Nigeria.",
} as const;

export type NavLink = { label: string; href: string };

export const NAV: readonly NavLink[] = [
  { label: "What We Do", href: "/what-we-do" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Publications", href: "/publications" },
  { label: "Contact", href: "/contact" },
];

export type Service = {
  /** Anchor on /what-we-do. */
  slug: string;
  title: string;
  /** About five words, shown in the home services index. */
  summary: string;
};

/** Service lines, in display order. Descriptions and bullets: ./what-we-do. */
export const SERVICES: readonly Service[] = [
  {
    slug: "strategy",
    title: "Strategy & market entry",
    summary: "Market assessment, entry and expansion.",
  },
  {
    slug: "regulatory",
    title: "Regulatory & policy",
    summary: "Licensing, compliance and regulator engagement.",
  },
  {
    slug: "transactions",
    title: "Transaction advisory",
    summary: "Diligence, structuring and negotiation support.",
  },
  {
    slug: "downstream",
    title: "Downstream & gas",
    summary: "Retail, storage, logistics and offtake.",
  },
  {
    slug: "transition",
    title: "Energy transition",
    summary: "Decarbonisation pathways and gas-to-power.",
  },
  {
    slug: "research",
    title: "Research & publications",
    summary: "Commissioned studies and published analysis.",
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
