import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { articleByline } from "@/components/insights/byline";
import { INSIGHTS } from "@/content/insights";
import { SITE } from "@/content/site";
import {
  MARK_HEIGHT,
  MARK_LOCKUP,
  MARK_MONO_PATH,
  MARK_VIEWBOX,
  MARK_WIDTH,
} from "@/lib/brand/mark";
import { formatDate, readingMinutes } from "@/lib/insights/text";
import { siteUrl } from "@/lib/seo/urls";
import { getPostBySlug, getPublishedPostSlugs } from "@/lib/supabase/queries";
import { postCategoryLabel } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const alt = `${INSIGHTS.name} article`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Pre-render the card for every published slug, same as the article page's
 * own generateStaticParams; an unlisted slug still renders (and is cached)
 * on its first request.
 */
export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;

const GREEN_950 = "#002210";
const GREEN_300 = "#79d88d";
const NEUTRAL_50 = "#faf7f3";
const NEUTRAL_300 = "#cecac3";

/**
 * Font files are bundled as assets by the build and read from disk (fetch()
 * cannot open file: URLs in Node). The paths must be string literals: a
 * template string makes the bundler treat the whole folder as the asset.
 */
const SERIF_URL = new URL(
  "../../../../assets/fonts/newsreader-72pt-500.ttf",
  import.meta.url,
);
const SANS_URL = new URL(
  "../../../../assets/fonts/instrument-sans-500.ttf",
  import.meta.url,
);

/** Masthead lockup: wordmark size, then the mark and gap from the lockup ratios. */
const WORDMARK = 32;
const MARK_H = WORDMARK * MARK_LOCKUP.markEm;
/** Newsreader's descent at line-height 1: lifts the mark onto the baseline. */
const DESCENT = 0.265;

/**
 * Social card: the lockup (one-colour mark on the inverse green), serif
 * title, category. Fonts are the vendored static instances in
 * src/assets/fonts (the renderer needs TTF data).
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, serif, sans] = await Promise.all([
    getPostBySlug(slug),
    readFile(SERIF_URL),
    readFile(SANS_URL),
  ]);

  const title = post?.title ?? INSIGHTS.name;
  const category = post ? postCategoryLabel(post.category) : INSIGHTS.eyebrow;
  const meta = post
    ? `${articleByline(post)} · ${formatDate(post.published_at)} · ${readingMinutes(post.word_count)} min read`
    : "";
  const titleSize = title.length > 110 ? 44 : title.length > 70 ? 54 : 66;
  const host = new URL(siteUrl()).host;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: GREEN_950,
        color: NEUTRAL_50,
        fontFamily: "Instrument Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: WORDMARK * MARK_LOCKUP.gapEm,
          }}
        >
          <svg
            viewBox={MARK_VIEWBOX}
            width={(MARK_H * MARK_WIDTH) / MARK_HEIGHT}
            height={MARK_H}
            style={{
              marginBottom: WORDMARK * (DESCENT - MARK_LOCKUP.overshootEm),
            }}
          >
            <path d={MARK_MONO_PATH} fill={NEUTRAL_50} />
          </svg>
          <span
            style={{
              display: "flex",
              fontFamily: "Newsreader",
              fontSize: WORDMARK,
              lineHeight: 1,
              letterSpacing: "-0.015em",
            }}
          >
            {SITE.name}
          </span>
        </div>
        <span
          style={{
            color: NEUTRAL_300,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: 18,
            lineHeight: 1,
            // Sits on the wordmark's baseline: both boxes end at the row's
            // foot, so lift the label by the difference in their descents.
            marginBottom: WORDMARK * DESCENT - 18 * 0.14,
          }}
        >
          {INSIGHTS.name}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            // Labels on the inverse ground are neutral; green is for the rule.
            color: NEUTRAL_300,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: 18,
          }}
        >
          <span
            style={{
              display: "flex",
              width: 24,
              height: 1,
              backgroundColor: GREEN_300,
            }}
          />
          {category}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontFamily: "Newsreader",
            fontSize: titleSize,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(250,247,243,0.22)",
          paddingTop: 22,
          fontSize: 20,
          color: NEUTRAL_300,
        }}
      >
        <span>{meta}</span>
        <span>{host}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, weight: 500, style: "normal" },
        { name: "Instrument Sans", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
