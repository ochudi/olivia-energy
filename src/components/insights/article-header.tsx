import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { INSIGHTS_PAGE } from "@/content/insights";
import { readingMinutes } from "@/lib/insights/text";
import { getMediaUrl, type Article } from "@/lib/supabase/queries";
import {
  POST_FORMAT_LABELS,
  postCategoryLabel,
  postFormatOf,
} from "@/lib/supabase/types";
import { articleByline } from "./byline";
import { CoverImage, coverCaption } from "./cover-image";

/** The cover spans the page container: 1152 px of content at 1440. */
const COVER_SIZES =
  "(min-width: 81rem) 1152px, calc(100vw - 2 * var(--spacing-gutter))";

const CRUMB =
  "hit-area tap hover:text-ink duration-fast ease-standard underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current";

/**
 * The meta line ("By …, 29 September 2026, 7 min read"): one sentence in
 * the body face, its parts joined with commas (DESIGN.md, Typography); "7
 * min read" never breaks.
 */
function ArticleMeta({ text }: { text: string }) {
  const [head, minutes] = text.split(/, (?=\d+ min read$)/);
  return (
    <p className="border-line text-ink-muted numerals mt-8 max-w-[48rem] border-t pt-5 text-sm">
      {minutes ? (
        <>
          {head}, <span className="whitespace-nowrap">{minutes}</span>
        </>
      ) : (
        text
      )}
    </p>
  );
}

/**
 * Article header: the breadcrumb "Insights /
 * {Category}", the format chip (when set) and the category chip, the H1 in
 * display-lg (at most 22 characters a line, never animated), the dek, the
 * meta line, then the cover at the container's width in the large shoulder
 * with its caption when the cover ships with the site.
 */
export function ArticleHeader({ post }: { post: Article }) {
  const copy = INSIGHTS_PAGE.article;
  const label = postCategoryLabel(post.category);
  const categoryHref = `/insights/category/${post.category}`;
  const format = postFormatOf(post);
  const cover = getMediaUrl(post.cover_path);
  const caption = coverCaption(cover);
  return (
    <header>
      {/* The text block shares the body's columns (8 of 12, from the
          fourth) so the page keeps one axis from breadcrumb to footer; the
          cover alone runs the container's width. */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-8 lg:col-start-4">
          <nav aria-label="Breadcrumb">
            <ol className="text-ink-muted flex flex-wrap items-center gap-x-2 text-sm font-medium">
              <li>
                <Link href="/insights" className={CRUMB}>
                  {copy.breadcrumb}
                </Link>
              </li>
              <li aria-hidden className="text-ink-subtle">
                /
              </li>
              <li>
                <Link href={categoryHref} className={CRUMB}>
                  {label}
                </Link>
              </li>
            </ol>
          </nav>

          {/* The breadcrumb already names the category, so only the format is
          chipped here (DESIGN.md: nothing above a heading restates it). */}
          {format ? (
            <p className="mt-8 flex flex-wrap gap-2">
              <Chip tone="solid">{POST_FORMAT_LABELS[format]}</Chip>
            </p>
          ) : null}

          <Display as="h1" size="lg" headline className="mt-6 max-w-[22ch]">
            {post.title}
          </Display>
          {post.excerpt ? (
            <Lede className="mt-6 max-w-[48ch]">{post.excerpt}</Lede>
          ) : null}
          {post.published_at ? (
            <ArticleMeta
              text={copy.meta({
                author: articleByline(post),
                publishedAt: post.published_at,
                minutes: readingMinutes(post.word_count),
              })}
            />
          ) : null}
        </div>
      </div>

      {cover ? (
        <figure className="mt-10 md:mt-14">
          <CoverImage
            src={cover}
            ratio="16/9"
            corner="lg"
            priority
            sizes={COVER_SIZES}
          />
          {caption ? (
            <figcaption className="text-ink-muted mt-3 text-sm">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </header>
  );
}
