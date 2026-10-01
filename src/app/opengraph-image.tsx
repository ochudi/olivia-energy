import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { FOUNDER } from "@/content/about";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import {
  MARK_HEIGHT,
  MARK_LOCKUP,
  MARK_MONO_PATH,
  MARK_VIEWBOX,
  MARK_WIDTH,
} from "@/lib/brand/mark";
import { siteUrl } from "@/lib/seo/urls";

export const runtime = "nodejs";
export const alt = `${SITE.name}: ${SEO.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN_950 = "#002210";
const NEUTRAL_50 = "#faf7f3";
const NEUTRAL_300 = "#cecac3";

const SERIF_URL = new URL(
  "../assets/fonts/newsreader-72pt-500.ttf",
  import.meta.url,
);
const SANS_URL = new URL(
  "../assets/fonts/instrument-sans-500.ttf",
  import.meta.url,
);

/** Wordmark size on the card; the mark and gap follow the lockup ratios. */
const WORDMARK = 96;
const MARK_H = WORDMARK * MARK_LOCKUP.markEm;
/** Newsreader's descent at line-height 1: lifts the mark onto the baseline. */
const DESCENT = 0.265;

/**
 * Default social card: the lockup (one-colour mark, as on every dark ground)
 * and the search tagline on the inverse green, with who leads the practice
 * and the address along the foot. Nothing else: the card is read at
 * thumbnail size in a chat or a feed, so the tagline is set large.
 */
export default async function Image() {
  const [serif, sans] = await Promise.all([
    readFile(SERIF_URL),
    readFile(SANS_URL),
  ]);
  const host = new URL(siteUrl()).host;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px 72px",
        backgroundColor: GREEN_950,
        color: NEUTRAL_50,
        fontFamily: "Instrument Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
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
          <div
            style={{
              display: "flex",
              fontFamily: "Newsreader",
              fontSize: WORDMARK,
              lineHeight: 1,
              letterSpacing: "-0.015em",
            }}
          >
            {SITE.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 40,
            lineHeight: 1.25,
            color: NEUTRAL_300,
            maxWidth: 1056,
          }}
        >
          {SEO.tagline}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(250,247,243,0.22)",
          paddingTop: 22,
          fontSize: 20,
          color: NEUTRAL_300,
        }}
      >
        <span>Led by {FOUNDER.name}, energy economist</span>
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
