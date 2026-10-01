import type {
  Article,
  BreadcrumbList,
  Graph,
  Organization,
  Person,
  WebSite,
  WithContext,
} from "schema-dts";
import { FOUNDER, REGISTRATIONS } from "@/content/about";
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
 * Settings hold an address as free lines. The last line is the place, read
 * as "locality, region" when it has a comma ("Fort Worth, Texas"); any
 * lines before it are the street.
 */
function postalAddress(address: SiteSettings["addresses"][number]) {
  const lines = address.lines.map((line) => line.trim()).filter(Boolean);
  const [locality, ...region] = (lines.at(-1) ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const street = lines.slice(0, -1);
  return {
    "@type": "PostalAddress" as const,
    ...(street.length ? { streetAddress: street.join(", ") } : {}),
    ...(locality ? { addressLocality: locality } : {}),
    ...(region.length ? { addressRegion: region.join(", ") } : {}),
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
  const registration = REGISTRATIONS[0];
  const organization: Organization = {
    "@type": "Organization",
    "@id": ids.organization,
    name: SITE.name,
    legalName: registration.label,
    foundingDate: registration.founded,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "CAC RC",
      value: registration.number,
    },
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
    // Search engines treat this as a candidate site name, so it is the
    // longer form of the name rather than a tagline.
    alternateName: "Olivia Energy and Power",
    url: siteUrl(),
    inLanguage: "en-GB",
    publisher: { "@id": ids.organization },
  };
  const founder: Person = {
    "@type": "Person",
    "@id": ids.founder,
    name: FOUNDER.name,
    alternateName: [...FOUNDER.alternateNames],
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
    alumniOf: FOUNDER.alumniOf.map((name) => ({
      "@type": "CollegeOrUniversity",
      name,
    })),
    memberOf: { "@type": "Organization", name: FOUNDER.memberOf },
    sameAs: [
      ...(settings.scholar_url ? [settings.scholar_url] : []),
      ...FOUNDER.profiles,
    ],
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

/** True when a byline on a paper is the founder under one of his name forms. */
export function isFounderName(name: string): boolean {
  return /^Olugbenga\b.*\bOlaoye$/.test(name.trim());
}

/** A BreadcrumbList for a page, from its trail of names and site paths. */
export function breadcrumbList(
  trail: readonly { name: string; path: string }[],
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
