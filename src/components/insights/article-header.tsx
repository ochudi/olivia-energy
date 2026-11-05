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
  "hit-area hover:text-ink duration-fast ease-standard underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current";

/**
 * The meta line ("By … · 29 September 2026 · 7 min read"). Its parts wrap
 * as whole items, never "7 / min read", and no line starts or ends with a
 * dot: each part after the first draws its dot as ::before, and the row is
 * pulled left by one separator inside a clipping box, so the dot of a part
 * that starts a line falls in the clipped margin. Screen readers get the
 * string once.
 */
function ArticleMeta({ text }: { text: string }) {
  return (
    <p className="border-line text-ink-muted numerals mt-8 max-w-[48rem] border-t pt-5 text-sm">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="block overflow-hidden">
        <span className="-ml-[1.2em] flex flex-wrap">
          {text.split(" · ").map((part, i) => (
            <span
              key={i}
              className="whitespace-nowrap before:inline-block before:w-[1.2em] before:text-center before:content-['·']"
            >
              {part}
            </span>
          ))}
        </span>
      </span>
    </p>
  );
}

/**
 * Article header (creative brief 4.5): the breadcrumb "Insights /
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
      <nav aria-label="Breadcrumb">
        <ol className="label text-ink-muted flex flex-wrap items-center gap-x-2">
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

      <p className="mt-8 flex flex-wrap gap-2">
        {format ? <Chip tone="solid">{POST_FORMAT_LABELS[format]}</Chip> : null}
        <Chip href={categoryHref}>{label}</Chip>
      </p>

      <Display as="h1" size="lg" className="mt-6 max-w-[22ch]">
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
