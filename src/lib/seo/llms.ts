import { FOUNDER, FOUNDER_PAGE, ORIGIN, REGISTRATIONS } from "@/content/about";
import { SEO } from "@/content/seo";
import { SERVICES, SITE } from "@/content/site";
import { INTRO } from "@/content/what-we-do";
import { formatDate } from "@/lib/insights/text";
import type { OpEd } from "@/types/contracts";
import {
  postCategoryLabel,
  type PostSummary,
  type Publication,
  type SiteSettings,
} from "@/lib/supabase/types";
import { absoluteUrl } from "./urls";

/**
 * The body of /llms.txt (https://llmstxt.org): a short, factual Markdown
 * summary of the site for language models and the answer engines built on
 * them. It carries the same facts as the pages, in sentences that can be
 * quoted on their own, and links to the pages, the articles and the papers.
 * Everything comes from the content files and the database, so it cannot
 * drift from what the site says.
 */
export function llmsText(input: {
  settings: SiteSettings;
  posts: readonly PostSummary[];
  /** Journal articles (`getPublications()`). */
  publications: readonly Publication[];
  /** The founder's op-eds, newest first (`getOpEds()`). */
  opEds?: readonly OpEd[];
}): string {
  const { settings, posts, publications, opEds = [] } = input;
  const one = (text: string | null | undefined) =>
    (text ?? "").replace(/\s+/g, " ").trim();
  const places = settings.addresses
    .map((a) => [...a.lines, a.country].map(one).filter(Boolean).join(", "))
    .join("; ");
  const [registration, ...otherRegistrations] = REGISTRATIONS;
  // The founder's place, read from the role line on About
  // ("Founder/CEO, Olivia Energy · Energy economist · Fort Worth, Texas").
  const founderPlace = FOUNDER_PAGE.role.split("·").at(-1)?.trim();
  const nipex = one(settings.nipex_wording);

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> ${INTRO.positioning}`,
    "",
    `- Legal name: ${registration.label}, ${registration.registry} ${registration.number}, registered in ${registration.region}.`,
    ...otherRegistrations.map(
      (r) =>
        `- ${r.region} entity: ${r.label}, ${r.registry} ${r.number}, formed ${formatDate(r.founded)}.`,
    ),
    ...(nipex ? [`- ${nipex}`] : []),
    `- Founded by ${FOUNDER.name}, its ${FOUNDER.role}, an energy economist${founderPlace ? ` based in ${founderPlace}` : ""}.`,
    ...(places ? [`- Locations: ${places}.`] : []),
    `- Enquiries: ${settings.contact_email} or ${absoluteUrl("/contact")}.`,
    `- ${one(ORIGIN.paragraph)}`,
    "",
    "## Pages",
    "",
    `- [What we do](${absoluteUrl("/what-we-do")}): ${SEO.whatWeDo.description}`,
    `- [About](${absoluteUrl("/about")}): ${SEO.about.description}`,
    `- [Insights](${absoluteUrl("/insights")}): ${SEO.insights.description}`,
    `- [Research](${absoluteUrl("/research")}): ${SEO.research.description}`,
    `- [Contact](${absoluteUrl("/contact")}): ${SEO.contact.description}`,
    "",
    "## Services",
    "",
    ...SERVICES.map(
      (service) =>
        `- [${service.title}](${absoluteUrl(`/what-we-do#${service.slug}`)}): ${service.summary}`,
    ),
  ];

  if (posts.length) {
    lines.push("", "## Insights", "");
    for (const post of posts) {
      const meta = [
        postCategoryLabel(post.category),
        formatDate(post.published_at),
      ]
        .filter(Boolean)
        .join(", ");
      const excerpt = one(post.excerpt);
      lines.push(
        `- [${one(post.title)}](${absoluteUrl(`/insights/${post.slug}`)}): ${excerpt ? `${excerpt} ` : ""}(${meta})`,
      );
    }
  }

  if (opEds.length) {
    lines.push("", `## Op-eds by ${FOUNDER.name}`, "");
    for (const oped of opEds) {
      const meta = [oped.outlet, formatDate(oped.publishedOn)]
        .filter(Boolean)
        .join(", ");
      const summary = one(oped.summary);
      lines.push(
        `- [${one(oped.title)}](${oped.url}): ${summary ? `${summary} ` : ""}(${meta})`,
      );
    }
  }

  if (publications.length) {
    lines.push("", `## Research by ${FOUNDER.name} and co-authors`, "");
    for (const paper of publications) {
      const cite = [paper.authors.join(", "), paper.venue, paper.year]
        .filter(Boolean)
        .join(". ");
      const title = one(paper.title);
      lines.push(
        `- ${paper.url ? `[${title}](${paper.url})` : title}${cite ? `: ${cite}.` : ""}`,
      );
    }
  }

  const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");
  const profiles = [
    ...(settings.scholar_url
      ? [`[Google Scholar](${settings.scholar_url}): ${FOUNDER.name}`]
      : []),
    ...FOUNDER.profiles.map((url) => `[${host(url)}](${url}): ${FOUNDER.name}`),
    ...(settings.socials.linkedin
      ? [`[LinkedIn](${settings.socials.linkedin}): ${SITE.name}`]
      : []),
  ];
  lines.push("", "## Profiles", "", ...profiles.map((line) => `- ${line}`));

  lines.push(
    "",
    "## Optional",
    "",
    `- [Privacy notice](${absoluteUrl("/privacy")}): what the contact form collects and how it is handled.`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    "",
  );
  return lines.join("\n");
}
