import Link from "next/link";
import { Container } from "@/components/ui/container";
import { formatDate, readingMinutes } from "@/lib/insights/text";
import { getMediaUrl } from "@/lib/supabase/queries";
import { postCategoryLabel, type PostSummary } from "@/lib/supabase/types";
import { CoverImage } from "./cover-image";

/** The latest article, set large: cover left, title and standfirst right. */
export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <section
      id="featured"
      aria-labelledby="featured-title"
      className="border-line border-b"
    >
      <Container className="py-section-sm">
        <article className="group relative grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <CoverImage
              src={getMediaUrl(post.cover_path)}
              priority
              sizes="(min-width: 76rem) 646px, (min-width: 64rem) 55vw, calc(100vw - 40px)"
              imageClassName="duration-slow ease-out transition-transform group-hover:scale-[1.02] motion-reduce:transform-none"
            />
          </div>
          <div className="lg:col-span-5">
            <p className="flex items-baseline gap-3">
              <span className="tracking-caps text-primary text-xs font-medium uppercase">
                {postCategoryLabel(post.category)}
              </span>
              <span className="text-ink-muted font-mono text-xs">Latest</span>
            </p>
            <h2
              id="featured-title"
              className="font-display text-display-md mt-5 font-normal tracking-tight text-balance"
            >
              <Link
                href={`/insights/${post.slug}`}
                className="group-hover:text-primary active:text-primary-hover duration-fast ease-standard focus-visible:after:ring-focus focus-visible:after:ring-offset-canvas transition-colors after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-offset-2"
              >
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p className="text-ink-muted max-w-text mt-5 text-lg leading-relaxed text-pretty">
                {post.excerpt}
              </p>
            ) : null}
            <p className="text-ink-muted mt-6 font-mono text-xs tabular-nums">
              <time dateTime={post.published_at ?? undefined}>
                {formatDate(post.published_at)}
              </time>
              <span aria-hidden> · </span>
              {readingMinutes(post.word_count)} min read
            </p>
          </div>
        </article>
      </Container>
    </section>
  );
}
