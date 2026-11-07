import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { TAGLINE } from "@/content/brand";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import {
  MARK_COLORS,
  MARK_HEIGHT,
  MARK_LOCKUP,
  MARK_PATHS,
  MARK_VIEWBOX,
  MARK_WIDTH,
} from "@/lib/brand/mark";

export const runtime = "nodejs";
export const alt = `${SITE.name}: ${SEO.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Colours of the design tokens, as literals: the
 * renderer cannot read CSS custom properties. night = --color-night,
 * ink-night-muted = --color-ink-night-muted, lime = --color-brand-lime.
 */
const NIGHT = "#06170e";
const WHITE = "#ffffff";
const LIME = MARK_COLORS.lime;
const NIGHT_MUTED = "#b9c7be";

/**
 * Font files are read from disk (fetch() cannot open file: URLs in Node).
 * The paths must be string literals: a template string makes the bundler
 * treat the whole folder as the asset. The roman and italic in og/ are
 * static instances of the variable Newsreader (see the fonts README); the
 * wordmark keeps the 500 cut the logo lockup is drawn in.
 */
const WORDMARK_URL = new URL(
  "../assets/fonts/newsreader-72pt-500.ttf",
  import.meta.url,
);
const ROMAN_URL = new URL(
  "../assets/fonts/og/newsreader-400-opsz72.ttf",
  import.meta.url,
);
const ITALIC_URL = new URL(
  "../assets/fonts/og/newsreader-italic-400-opsz48.ttf",
  import.meta.url,
);
const SANS_URL = new URL(
  "../assets/fonts/instrument-sans-500.ttf",
  import.meta.url,
);

/** Lockup: the mark is 56 px tall; the wordmark and gap follow the lockup ratios. */
const LOCKUP_MARK = 56;
const WORDMARK = LOCKUP_MARK / MARK_LOCKUP.markEm;
/** Newsreader's descent at line-height 1: lifts the mark onto the baseline. */
const DESCENT = 0.265;
/** The big mark: 440 px tall, bleeding 60 px off the right edge. */
const BIG_MARK = 440;
const BIG_MARK_BLEED = 60;

/** The mark in its three true colours, painted lime, red, ring. */
function Mark({ height }: { height: number }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={(height * MARK_WIDTH) / MARK_HEIGHT}
      height={height}
    >
      <path d={MARK_PATHS.lime} fill={MARK_COLORS.lime} />
      <path d={MARK_PATHS.red} fill={MARK_COLORS.red} />
      <path d={MARK_PATHS.ring} fill={MARK_COLORS.green} />
    </svg>
  );
}

/**
 * Default social card, on the night ground. The left
 * 62%: the lockup, the two tagline lines, the footer line and who founded
 * the firm. The right 38%: the mark, large, running off the edge. Read at
 * thumbnail size in a chat or a feed, so the tagline is set large.
 */
export default async function Image() {
  const [wordmark, roman, italic, sans] = await Promise.all([
    readFile(WORDMARK_URL),
    readFile(ROMAN_URL),
    readFile(ITALIC_URL),
    readFile(SANS_URL),
  ]);
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: NIGHT,
        color: WHITE,
        fontFamily: "Instrument Sans",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: (size.height - BIG_MARK) / 2,
          right: -BIG_MARK_BLEED,
          display: "flex",
        }}
      >
        <Mark height={BIG_MARK} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "62%",
          height: "100%",
          padding: "64px 0 56px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: WORDMARK * MARK_LOCKUP.gapEm,
          }}
        >
          <div
            style={{
              display: "flex",
              marginBottom: WORDMARK * (DESCENT - MARK_LOCKUP.overshootEm),
            }}
          >
            <Mark height={LOCKUP_MARK} />
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Newsreader",
              fontWeight: 500,
              fontSize: WORDMARK,
              lineHeight: 1,
              letterSpacing: "-0.015em",
            }}
          >
            {SITE.name}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Newsreader",
              fontWeight: 400,
              fontSize: 84,
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              maxWidth: 640,
            }}
          >
            {TAGLINE.line1}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Newsreader",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 48,
              lineHeight: 1.15,
              color: LIME,
            }}
          >
            {TAGLINE.line2}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              lineHeight: 1.2,
              color: NIGHT_MUTED,
            }}
          >
            {SEO.socialCard.footer.split("·").map((part, index) => (
              <div key={part} style={{ display: "flex" }}>
                {index > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      width: 6,
                      height: 6,
                      margin: "0 14px",
                      alignSelf: "center",
                      borderRadius: 3,
                      backgroundColor: NIGHT_MUTED,
                    }}
                  />
                ) : null}
                {part.trim()}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              lineHeight: 1.2,
              color: WHITE,
            }}
          >
            {SEO.socialCard.founder}
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: wordmark, weight: 500, style: "normal" },
        { name: "Newsreader", data: roman, weight: 400, style: "normal" },
        { name: "Newsreader", data: italic, weight: 400, style: "italic" },
        { name: "Instrument Sans", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
