import { FOUNDER, REGISTRATIONS } from "@/content/about";
import { SEO } from "@/content/seo";
import { SERVICES, SITE } from "@/content/site";
import { INTRO } from "@/content/what-we-do";
import { formatDate } from "@/lib/insights/text";
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
  publications: readonly Publication[];
}): string {
  const { settings, posts, publications } = input;
  const one = (text: string | null | undefined) =>
    (text ?? "").replace(/\s+/g, " ").trim();
  const places = settings.addresses
    .map((a) => [...a.lines, a.country].map(one).filter(Boolean).join(", "))
    .join("; ");
  const registration = REGISTRATIONS[0];

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> ${INTRO.positioning}`,
    "",
    `- Legal name: ${registration.label}, RC ${registration.number}, incorporated in ${registration.region} in ${registration.founded.slice(0, 4)}.`,
    `- Led by ${FOUNDER.name}, its founder and chief executive, an energy economist based in Fort Worth, Texas.`,
    ...(places ? [`- Locations: ${places}.`] : []),
    `- Enquiries: ${settings.contact_email} or ${absoluteUrl("/contact")}.`,
    "- It began in 2020 as a fuel retailer, with service stations at Sango Ota and Oju Ore, Otta, in Ogun State.",
    "",
    "## Pages",
    "",
    `- [What we do](${absoluteUrl("/what-we-do")}): ${SEO.whatWeDo.description}`,
    `- [About](${absoluteUrl("/about")}): ${SEO.about.description}`,
    `- [Insights](${absoluteUrl("/insights")}): ${SEO.insights.description}`,
    `- [Publications](${absoluteUrl("/publications")}): ${SEO.publications.description}`,
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
