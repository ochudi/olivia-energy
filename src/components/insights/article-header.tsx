import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PHOTOS } from "@/content/images";
import { formatDate, readingMinutes } from "@/lib/insights/text";
import { getMediaUrl, type Article } from "@/lib/supabase/queries";
import { postCategoryLabel } from "@/lib/supabase/types";
import { articleByline } from "./byline";
import { CoverImage } from "./cover-image";

/**
 * Category eyebrow, display title, standfirst, byline row, cover. Shares
 * the narrow container with the body and the footer, so all three hang
 * from one left edge.
 */
export function ArticleHeader({ post }: { post: Article }) {
  const cover = getMediaUrl(post.cover_path);
  const coverAlt =
    Object.values(PHOTOS).find((photo) => photo.src === cover)?.alt ?? "";
  return (
    <header>
      <Container size="narrow" className="pt-section-sm">
        <Link
          href={`/insights/category/${post.category}`}
          className="group hit-area inline-flex"
        >
          <Eyebrow
            as="span"
            className="group-hover:text-primary duration-fast ease-standard transition-colors"
          >
            {postCategoryLabel(post.category)}
          </Eyebrow>
        </Link>
        <h1 className="font-display text-display-lg mt-6 font-normal tracking-tight text-balance">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="text-ink-muted max-w-text mt-6 text-lg leading-relaxed text-pretty md:text-xl md:leading-[1.5]">
            {post.excerpt}
          </p>
        ) : null}
        <p className="border-line text-ink-muted max-w-text mt-8 border-t pt-5 text-sm">
          <span className="text-ink font-medium">By {articleByline(post)}</span>
          <span aria-hidden> · </span>
          <time
            dateTime={post.published_at ?? undefined}
            className="tabular-nums"
          >
            {formatDate(post.published_at)}
          </time>
          <span aria-hidden> · </span>
          {readingMinutes(post.word_count)} min read
        </p>
      </Container>
      {cover ? (
        <Container size="narrow" className="mt-10 md:mt-12">
          <CoverImage
            src={cover}
            alt={coverAlt}
            priority
            sizes="(min-width: 56rem) 816px, calc(100vw - 40px)"
          />
        </Container>
      ) : null}
    </header>
  );
}
