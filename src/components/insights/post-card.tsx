import Link from "next/link";
import { readingMinutes } from "@/lib/insights/text";
import { getMediaUrl } from "@/lib/supabase/queries";
import { postCategoryLabel, type PostSummary } from "@/lib/supabase/types";
import { CoverImage } from "./cover-image";

export type PostCardProps = {
  post: PostSummary;
  /** Heading level for the title; h3 inside sections, h2 in a bare grid. */
  headingLevel?: "h2" | "h3";
  /** `sizes` for the cover; the default fits the two-column Insights grid. */
  sizes?: string;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "10 Sep 2026", in UTC so server and client always agree. */
function shortDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Article card: cover, category in small caps, serif title, excerpt, and
 * one mono meta line. The whole card is one link (stretched from the
 * title); hovering it turns the title green, darkens the top rule and
 * eases the cover in by 2%.
 */
export function PostCard({
  post,
  headingLevel = "h3",
  sizes = "(min-width: 48rem) 560px, calc(100vw - 40px)",
}: PostCardProps) {
  const Heading = headingLevel;
  return (
    <article className="group border-line hover:border-ink duration-fast ease-standard relative flex h-full flex-col border-t pt-5 transition-[border-color]">
      <CoverImage
        src={getMediaUrl(post.cover_path)}
        sizes={sizes}
        imageClassName="duration-slow ease-out transition-transform group-hover:scale-[1.02] motion-reduce:transform-none"
      />
      <p className="tracking-caps text-primary mt-5 text-xs font-medium uppercase">
        {postCategoryLabel(post.category)}
      </p>
      <Heading className="font-display text-display-xs mt-3 font-normal text-balance">
        <Link
          href={`/insights/${post.slug}`}
          className="group-hover:text-primary active:text-primary-hover duration-fast ease-standard focus-visible:after:ring-focus focus-visible:after:ring-offset-canvas transition-colors after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-offset-2"
        >
          {post.title}
        </Link>
      </Heading>
      {post.excerpt ? (
        <p className="text-ink-muted mt-3 text-sm leading-relaxed text-pretty">
          {post.excerpt}
        </p>
      ) : null}
      <p className="text-ink-muted mt-auto pt-5 font-mono text-xs tabular-nums">
        <time dateTime={post.published_at ?? undefined}>
          {shortDate(post.published_at)}
        </time>
        <span aria-hidden> · </span>
        {readingMinutes(post.word_count)} min
      </p>
    </article>
  );
}
