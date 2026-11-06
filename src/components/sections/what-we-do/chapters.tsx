import { Glyph } from "@/components/ui/glyph";
import { SERVICES } from "@/content/site";
import { CHAPTER_BAR_LABEL, SERVICE_LINES } from "@/content/what-we-do";
import { ChapterSection } from "./chapter";
import { ChapterBar } from "./chapter-bar";
import { ChapterInstalled } from "./chapter-installed";
import type { Chapter } from "./chapter-parts";

/**
 * What we do, sections 2 to 8 (creative brief 4.2): the chapter bar and
 * the six service chapters, in the order of SERVICES, each joined to its
 * copy in SERVICE_LINES by slug and anchored at `#<slug>`. The bar and the
 * chapters share one wrapper, so the bar sticks under the header for the
 * length of the chapters and leaves with the last one. Each bar item
 * carries its service's glyph, rendered here on the server so the glyph
 * data never ships to the client.
 */
export function Chapters() {
  const chapters: Chapter[] = SERVICES.map((service) => {
    const line = SERVICE_LINES.find((entry) => entry.slug === service.slug);
    if (!line) throw new Error(`No chapter copy for "${service.slug}"`);
    return { ...service, ...line };
  });
  return (
    <div>
      <ChapterBar
        label={CHAPTER_BAR_LABEL}
        items={chapters.map(({ slug, short, glyph }) => ({
          slug,
          short,
          glyph: <Glyph name={glyph} size={20} className="text-primary" />,
        }))}
      />
      {chapters.map((chapter) =>
        chapter.figure === "installed-not-delivered" ? (
          <ChapterInstalled key={chapter.slug} chapter={chapter} />
        ) : (
          <ChapterSection key={chapter.slug} chapter={chapter} />
        ),
      )}
    </div>
  );
}
