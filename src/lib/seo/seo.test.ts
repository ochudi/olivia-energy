import { describe, expect, it } from "vitest";
import { PRIVACY } from "@/content/legal";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import { articleTitle } from "./metadata";

/** Every page entry in SEO: a title and a description. */
const PAGES = [
  ["home", SEO.home],
  ["whatWeDo", SEO.whatWeDo],
  ["about", SEO.about],
  ["insights", SEO.insights],
  ["research", SEO.research],
  ["contact", SEO.contact],
  ["credits", SEO.credits],
] as const;

describe("page titles and descriptions", () => {
  it.each(PAGES)("%s keeps its title within 60 characters", (_name, page) => {
    // pageMetadata() sets the title as absolute, so it is the whole title.
    expect(page.title.length).toBeLessThanOrEqual(60);
  });

  it.each(PAGES)("%s keeps its description within 160", (_name, page) => {
    expect(page.description.length).toBeLessThanOrEqual(160);
    expect(page.description.length).toBeGreaterThan(40);
  });

  it("keeps the privacy page's own title and description in range", () => {
    expect(PRIVACY.metadata.title.length).toBeLessThanOrEqual(60);
    expect(PRIVACY.metadata.description.length).toBeLessThanOrEqual(160);
  });

  it("gives every page a different title and description", () => {
    const titles = PAGES.map(([, page]) => page.title);
    const descriptions = PAGES.map(([, page]) => page.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("uses no em or en dashes in titles or descriptions", () => {
    for (const [, page] of PAGES)
      expect(`${page.title} ${page.description}`).not.toMatch(/[–—]/);
  });

  it("keeps the suffix on an article title only while the whole line fits", () => {
    expect(articleTitle("Short title")).toBe("Short title");
    const long = "x".repeat(60 - SEO.suffix.length + 1);
    expect(articleTitle(long)).toEqual({ absolute: long });
  });

  it("takes the social card lines from the content files", () => {
    expect(SEO.socialCard.founder).toBe("Founded by Dr Olugbenga Olaoye");
    expect(SEO.tagline).toBe(SITE.tagline);
  });
});
