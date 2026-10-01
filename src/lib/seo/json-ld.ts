import type { Article, Organization, Person, WebSite, Graph } from "schema-dts";
import { FOUNDER } from "@/content/about";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import type { SiteSettings } from "@/lib/supabase/types";
import { absoluteUrl, siteUrl } from "./urls";

/**
 * Stable @ids for the entities every page shares, so page-level graphs
 * (Article, ScholarlyArticle, CollectionPage) can point at them instead of
 * repeating them.
 */
export function schemaIds() {
  const base = siteUrl();
  return {
    organization: `${base}/#organization`,
    website: `${base}/#website`,
    founder: `${base}/#founder`,
  };
}

const COUNTRY_CODES: Record<string, string> = {
  "united states": "US",
  usa: "US",
  "united states of america": "US",
  nigeria: "NG",
};

function countryCode(country: string): string {
  return COUNTRY_CODES[country.trim().toLowerCase()] ?? country;
}

/**
 * Settings hold an address as free lines. A single line is read as the
 * locality ("Fort Worth, Texas"); with more, the last line is the locality
 * and the rest the street.
 */
function postalAddress(address: SiteSettings["addresses"][number]) {
  const lines = address.lines.map((line) => line.trim()).filter(Boolean);
  const locality = lines.at(-1);
  const street = lines.slice(0, -1);
  return {
    "@type": "PostalAddress" as const,
    ...(street.length ? { streetAddress: street.join(", ") } : {}),
    ...(locality ? { addressLocality: locality } : {}),
    addressCountry: countryCode(address.country),
  };
}

/** Social URLs that point at an actual profile, not a platform root. */
function profileUrls(socials: SiteSettings["socials"]): string[] {
  return Object.values(socials).filter((href): href is string => {
    if (!href) return false;
    try {
      return new URL(href).pathname.replace(/\/+$/, "").length > 0;
    } catch {
      return false;
    }
  });
}

/** Organization, WebSite and the founder as a Person, from settings. */
export function siteGraph(settings: SiteSettings): Graph {
  const ids = schemaIds();
  const organization: Organization = {
    "@type": "Organization",
    "@id": ids.organization,
    name: SITE.name,
    url: siteUrl(),
    logo: absoluteUrl("/brand/logo-512.png"),
    description: SEO.home.description,
    email: settings.contact_email,
    address: settings.addresses.map((address) => postalAddress(address)),
    areaServed: settings.addresses.map((address) => address.country),
    knowsAbout: [...SEO.knowsAbout],
    founder: { "@id": ids.founder },
    ...(profileUrls(settings.socials).length
      ? { sameAs: profileUrls(settings.socials) }
      : {}),
  };
  const website: WebSite = {
    "@type": "WebSite",
    "@id": ids.website,
    name: SITE.name,
    alternateName: SEO.tagline,
    url: siteUrl(),
    inLanguage: "en",
    publisher: { "@id": ids.organization },
  };
  const founder: Person = {
    "@type": "Person",
    "@id": ids.founder,
    name: FOUNDER.name,
    jobTitle: FOUNDER.role,
    url: absoluteUrl("/about#founder"),
    ...(FOUNDER.portrait.src
      ? { image: absoluteUrl(FOUNDER.portrait.src) }
      : {}),
    worksFor: { "@id": ids.organization },
    hasCredential: FOUNDER.credentials.map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      name: credential,
    })),
    knowsAbout: [...SEO.knowsAbout],
    ...(settings.scholar_url ? { sameAs: [settings.scholar_url] } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, founder],
  };
}

/**
 * Author node for an article: the founder's or the organization's @id, so a
 * graph reader resolves it against their nodes elsewhere on the site — but
 * with name and url inlined too, so the Article block still names its
 * author when read on its own (a validator does not follow @id references
 * across separate JSON-LD scripts).
 */
export function authorNode(name: string | null | undefined): Article["author"] {
  const ids = schemaIds();
  if (!name)
    return {
      "@id": ids.organization,
      "@type": "Organization",
      name: SITE.name,
      url: siteUrl(),
    };
  if (name === FOUNDER.name)
    return {
      "@id": ids.founder,
      "@type": "Person",
      name: FOUNDER.name,
      url: absoluteUrl("/about#founder"),
    };
  return { "@type": "Person", name };
}
