import { Display } from "@/components/ui/display";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Glyph } from "@/components/ui/glyph";
import { Reveal } from "@/components/ui/reveal";
import type { Service } from "@/content/site";
import { chapterLabel, type ServiceLine } from "@/content/what-we-do";
import { cn } from "@/lib/utils/cn";

/** A chapter: the service from SERVICES joined with its copy from SERVICE_LINES. */
export type Chapter = Service & ServiceLine;

/**
 * The scroll margin of a chapter: a link to /what-we-do#<slug> lands with
 * the chapter's top under the fixed header and the sticky chapter bar
 * (48 px on phones, 52 px from 1024 px, plus its two 1 px lines).
 */
export const CHAPTER_SCROLL_MARGIN =
  "scroll-mt-[calc(var(--spacing-header)+3.125rem)] lg:scroll-mt-[calc(var(--spacing-header)+3.375rem)]";

/** Where a photograph or plate sticks: under the header and the bar, 32 px clear. */
export const UNDER_BAR_TOP =
  "lg:top-[calc(var(--spacing-header)+3.375rem+2rem)]";

export function chapterTitleId(slug: string) {
  return `${slug}-title`;
}

/**
 * The chapter's head: the "01 / 06" label and the 64 px glyph on one
 * line over a hairline, then the title in display-lg.
 */
export function ChapterHead({
  chapter,
  className,
}: {
  chapter: Chapter;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="border-line flex items-end justify-between gap-6 border-b pb-5">
        <p className="label numerals text-ink-muted">{chapterLabel(chapter)}</p>
        <Reveal variant="draw" className="-mb-1">
          <Glyph name={chapter.glyph} size={64} draw />
        </Reveal>
      </div>
      <Display
        as="h2"
        size="lg"
        reveal="mask"
        id={chapterTitleId(chapter.slug)}
        className="mt-8 max-w-[14ch]"
      >
        {chapter.title}
      </Display>
    </div>
  );
}

/** The chapter lede (Newsreader roman, display-sm) and body (text-lg). */
export function ChapterText({
  chapter,
  className,
}: {
  chapter: Chapter;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <p className="font-display text-display-sm text-ink max-w-[26ch] text-balance">
        {chapter.lede}
      </p>
      <p className="text-ink-muted mt-6 max-w-[56ch] text-lg text-pretty">
        {chapter.body}
      </p>
    </Reveal>
  );
}

/**
 * The five services of the line, each after the mark's flame, in two
 * columns from 640 px (one on phones), on hairlines.
 */
export function ChapterList({
  chapter,
  className,
}: {
  chapter: Chapter;
  className?: string;
}) {
  return (
    <ul
      aria-label={chapter.title}
      className={cn("grid gap-x-8 sm:grid-cols-2", className)}
    >
      {chapter.bullets.map((bullet, i) => (
        <Reveal
          key={bullet}
          as="li"
          delay={i * 90}
          className="border-line text-ink flex items-start gap-3 border-t py-3.5 text-base"
        >
          <FlameBullet className="text-primary mt-[0.2em] h-[1.05em]" />
          <span>{bullet}</span>
        </Reveal>
      ))}
    </ul>
  );
}
