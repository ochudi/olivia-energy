import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { formatDateShort } from "@/lib/content/format";
import { readingMinutes } from "@/lib/insights/text";
import { getMediaUrl } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils/cn";
import {
  POST_FORMAT_LABELS,
  postCategoryLabel,
  postFormatOf,
  type PostSummary,
} from "@/lib/supabase/types";
import { CoverImage } from "./cover-image";

export type PostCardProps = {
  post: PostSummary;
  /** Heading level for the title; h3 inside sections, h2 in a bare grid. */
  headingLevel?: "h2" | "h3";
  /** `sizes` for the cover; the default fits the three-column Insights grid. */
  sizes?: string;
  /**
   * A lead card: from this breakpoint up the cover takes 7 of 12 columns
   * and the text sits beside it with a larger title (Articles uses it so a
   * grid never leaves one card alone on a row).
   */
  lead?: "md" | "lg" | "md-only";
};

/**
 * Three columns of the 1296 px page at 1440: (1152 − 2 × 24) / 3 = 368 px.
 * On 3x phones the file is chosen as for 2x (the 2/3 factor), which keeps
 * every cover under the 120 KB phone budget (Q1, 3 October 2026).
 */
export const POST_CARD_SIZES =
  "(min-width: 81rem) 368px, (min-width: 64rem) 30vw, (min-width: 48rem) 46vw, (min-resolution: 2.5dppx) calc((100vw - 40px) * 2 / 3), calc(100vw - 40px)";

/** The lead card's cover: 7 of 12 columns of the 1152 px measure at 1440. */
export const POST_LEAD_SIZES =
  "(min-width: 81rem) 662px, (min-width: 48rem) 56vw, (min-resolution: 2.5dppx) calc((100vw - 40px) * 2 / 3), calc(100vw - 40px)";

/** Static class strings per breakpoint, so Tailwind sees every one. */
const LEAD = {
  md: {
    article: "md:grid md:grid-cols-12 md:items-center md:gap-x-6",
    cover: "md:col-span-7",
    body: "md:col-span-5 md:pl-4 lg:pl-8",
    chips: "md:mt-0",
    title: "md:text-display-md",
    excerpt: "md:text-base",
  },
  lg: {
    article: "lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-6",
    cover: "lg:col-span-7",
    body: "lg:col-span-5 lg:pl-8",
    chips: "lg:mt-0",
    title: "lg:text-display-md",
    excerpt: "lg:text-base",
  },
  /* Tablets only: a lead beside its cover; from lg it is a plain card. */
  "md-only": {
    article: "md:grid md:grid-cols-12 md:items-center md:gap-x-6 lg:flex",
    cover: "md:col-span-7",
    body: "md:col-span-5 md:pl-4 lg:pl-0",
    chips: "md:mt-0 lg:mt-5",
    title: "md:text-display-md lg:text-display-sm",
    excerpt: "md:text-base lg:text-sm",
  },
} as const;

/**
 * Article card (creative brief 4.4 section 3): a 3:2 cover in the shoulder
 * shape, the format chip (when the post has one) and the topic chip, the
 * title in display-sm, the dek and one meta line. The whole card is one
 * link, stretched from the title; hover lifts the title to the primary
 * colour and eases the cover in by 4%.
 */
export function PostCard({
  post,
  headingLevel = "h3",
  sizes,
  lead,
}: PostCardProps) {
  const Heading = headingLevel;
  const format = postFormatOf(post);
  const l = lead ? LEAD[lead] : null;
  return (
    <article className={cn("group relative flex h-full flex-col", l?.article)}>
      <CoverImage
        src={getMediaUrl(post.cover_path)}
        sizes={
          sizes ??
          (lead === "md" || lead === "lg" ? POST_LEAD_SIZES : POST_CARD_SIZES)
        }
        className={l?.cover}
        imageClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.04] group-has-focus-visible:scale-[1.04] motion-reduce:transform-none"
      />
      <div className={cn("flex flex-1 flex-col", l?.body)}>
        <p className={cn("mt-5 flex flex-wrap gap-2", l?.chips)}>
          {format ? (
            <Chip tone="solid">{POST_FORMAT_LABELS[format]}</Chip>
          ) : null}
          <Chip>{postCategoryLabel(post.category)}</Chip>
        </p>
        <Heading
          className={cn(
            "font-display text-display-sm text-ink mt-4 font-normal text-balance",
            l?.title,
          )}
        >
          <Link
            href={`/insights/${post.slug}`}
            className="group-hover:text-primary duration-fast ease-standard focus-visible:after:ring-focus focus-visible:after:ring-offset-canvas transition-colors after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-offset-4"
          >
            {post.title}
          </Link>
        </Heading>
        {post.excerpt ? (
          <p
            className={cn(
              "text-ink-muted mt-3 text-sm text-pretty",
              l?.excerpt,
            )}
          >
            {post.excerpt}
          </p>
        ) : null}
        <p className="text-ink-muted numerals mt-auto pt-5 text-xs">
          {post.published_at ? (
            <>
              <time dateTime={post.published_at}>
                {formatDateShort(post.published_at)}
              </time>
              <span aria-hidden>, </span>
            </>
          ) : null}
          <span className="whitespace-nowrap">
            {readingMinutes(post.word_count)} min read
          </span>
        </p>
      </div>
    </article>
  );
}
