import type { CSSProperties } from "react";
import type { CoverTone, OpEd } from "@/types/contracts";
import { Chip } from "@/components/ui/chip";
import { COVER_COPY } from "@/content/brand";
import { cn } from "@/lib/utils/cn";
import { CoverArt } from "./cover-art";
import { coverMotifFor, coverToneFor } from "./cover-tone";

export type OpEdCoverSize = "lead" | "standard" | "compact";

export type OpEdCoverProps = {
  oped: OpEd;
  /**
   * lead: the newest op-ed, large, lime, the whole mark as art.
   * standard: a report cover, art in the top-right corner, title below it.
   * compact: one row (label, title, chips) with a small corner of art.
   */
  size: OpEdCoverSize;
  /** Colour; defaults to coverToneFor (lime for the lead, else by topic). */
  tone?: CoverTone;
  headingLevel?: 2 | 3 | 4;
  /**
   * A standard cover that becomes compact below 768 px (the Insights
   * archive on phones). Ignored for the other sizes.
   */
  compactOnPhone?: boolean;
  className?: string;
};

type Layout = "lead" | "standard" | "compact" | "responsive";

/* Class sets per layout. The standard cover is a four-row grid: label, the
   art well (1fr), title, chips. The art spans the label row and the well
   and is pulled to the cover's top and right edges, so it can never sit
   under the title. The compact cover is two columns: text left, a small
   corner of art right. `responsive` is compact below md and standard from
   md. A standard cover's art is at most 19rem tall, so a cover set wider
   than its row (the archive's last row) keeps the row's height. Written out in full so Tailwind sees every class. Within a string a
   col-span comes before its col-start: tailwind-merge (cn) drops a
   col-start that precedes a col-span. */
const INNER: Record<Layout, string> = {
  lead: "grid-cols-1 grid-rows-[auto_minmax(9rem,1fr)_auto_auto] p-7 min-h-[30rem] md:p-9 lg:min-h-[35rem] lg:p-10",
  standard:
    "grid-cols-1 grid-rows-[auto_minmax(5rem,1fr)_auto_auto] p-6 min-h-[20rem] lg:p-7",
  compact: "grid-cols-[minmax(0,1fr)_4rem] gap-x-4 p-5",
  responsive:
    "grid-cols-[minmax(0,1fr)_4rem] gap-x-4 p-5 md:grid-cols-1 md:grid-rows-[auto_minmax(5rem,1fr)_auto_auto] md:gap-x-0 md:p-6 md:min-h-[20rem] lg:p-7",
};

const ART: Record<Layout, string> = {
  lead: "row-start-1 row-end-3 col-start-1 justify-self-end self-stretch w-[78%] -mt-7 -mr-7 md:-mt-9 md:-mr-9 lg:-mt-10 lg:-mr-10",
  standard:
    "row-start-1 row-end-3 col-start-1 justify-self-end self-stretch w-[74%] -mt-6 -mr-6 lg:-mt-7 lg:-mr-7 [&>svg]:max-h-[19rem]",
  compact:
    "row-start-1 row-end-3 col-start-2 self-start justify-self-end size-20 -mt-5 -mr-5",
  responsive:
    "row-start-1 row-end-3 col-start-2 self-start justify-self-end size-20 -mt-5 -mr-5 md:col-start-1 md:size-auto md:w-[74%] md:justify-self-end md:self-stretch md:-mt-6 md:-mr-6 lg:-mt-7 lg:-mr-7 md:[&>svg]:max-h-[19rem]",
};

const LABEL: Record<Layout, string> = {
  lead: "row-start-1 col-start-1",
  standard: "row-start-1 col-start-1",
  // Compact: the label runs the full width over the small corner of art.
  compact: "row-start-1 col-span-2 col-start-1",
  responsive: "row-start-1 col-span-2 col-start-1 md:col-span-1 md:col-start-1",
};

const TITLE: Record<Layout, string> = {
  lead: "row-start-3 col-start-1 mt-6 text-display-sm max-w-[22ch] @min-[30rem]:text-display-md",
  standard:
    "row-start-3 col-start-1 mt-5 text-display-xs @min-[22rem]:text-display-sm",
  compact: "row-start-2 col-start-1 mt-3 text-display-xs",
  responsive:
    "row-start-2 col-start-1 mt-3 text-display-xs md:row-start-3 md:mt-5 @min-[22rem]:text-display-sm",
};

const CHIPS: Record<Layout, string> = {
  lead: "row-start-4 col-start-1 mt-6",
  standard: "row-start-4 col-start-1 mt-5",
  compact: "row-start-3 col-span-2 col-start-1 mt-4",
  responsive:
    "row-start-3 col-span-2 col-start-1 mt-4 md:row-start-4 md:col-span-1 md:col-start-1 md:mt-5",
};

/** The drawn line's width in art units, per layout (the art scales with the cover). */
const STROKE: Record<Layout, number> = {
  lead: 1.3,
  standard: 1.7,
  compact: 2.6,
  responsive: 1.7,
};

const HEADING = { 2: "h2", 3: "h3", 4: "h4" } as const;

/* Chips that would only stack one per line are dropped by the cover's own
   width (container queries): one chip below 18rem, two below 22rem. The
   first topic always shows. */
const CHIP_FIT = [
  undefined,
  "@max-[18rem]:hidden",
  "@max-[22rem]:hidden",
] as const;

/* The art's two colours, per cover colour (director P1 8: louder art, the
   title still the loudest thing on the cover). On the paper grounds the art
   is the logo's green: a light green shape and a full-strength green line,
   so the wall reads in the mark's colours instead of greige. On the floods
   (red, green, night) it is white, on lime the cover's ink. --cover-bg is
   the cover's own ground, which the label's halo reuses. */
const LIGHT_ART = {
  "--art-fill":
    "color-mix(in oklab, var(--cover-bg) 70%, var(--color-flood-green))",
  "--art-line": "var(--color-flood-green)",
};
const FLOOD_ART = {
  "--art-fill": "color-mix(in oklab, var(--cover-bg) 68%, var(--color-white))",
  "--art-line": "color-mix(in oklab, var(--cover-bg) 22%, var(--color-white))",
};
const ART_TINTS: Record<CoverTone, CSSProperties> = {
  paper: { "--cover-bg": "var(--color-surface)", ...LIGHT_ART },
  "paper-deep": { "--cover-bg": "var(--color-canvas)", ...LIGHT_ART },
  red: { "--cover-bg": "var(--color-canvas)", ...FLOOD_ART },
  green: { "--cover-bg": "var(--color-canvas)", ...FLOOD_ART },
  night: { "--cover-bg": "var(--color-canvas)", ...FLOOD_ART },
  lime: {
    "--cover-bg": "var(--color-canvas)",
    "--art-fill": "color-mix(in oklab, var(--cover-bg) 70%, var(--color-ink))",
    "--art-line": "color-mix(in oklab, var(--cover-bg) 35%, var(--color-ink))",
  },
} as Record<CoverTone, CSSProperties>;

/* The label (outlet and date) sits over the art's corner. A halo of the
   cover's own ground (a crisp 7 px edge) keeps every
   drawn line out of the date, however the art falls at a given width. */
const LABEL_HALO =
  "justify-self-start bg-(--cover-bg) shadow-[0_0_2px_7px_var(--cover-bg)]";

/**
 * OpEdCover — one of the founder's BusinessDay op-eds as a designed report
 * cover: a flat block of a logo colour (by topic), the mark's shapes cut
 * large into its top-right corner, the outlet and date as a label, the
 * title in Newsreader, at most three topic chips. The whole cover links to
 * the article on BusinessDay (new tab).
 *
 * The surface (data-surface) sits on the inner block, so the cover remaps
 * its own colours while the link's focus ring keeps the page's.
 */
export function OpEdCover({
  oped,
  size,
  tone,
  headingLevel = 3,
  compactOnPhone = false,
  className,
}: OpEdCoverProps) {
  const lead = size === "lead";
  const layout: Layout =
    size === "standard" && compactOnPhone ? "responsive" : size;
  const surface = tone ?? coverToneFor(oped, lead ? 0 : 1);
  const Heading = HEADING[headingLevel];
  const label = lead
    ? COVER_COPY.leadLabel(oped.publishedOn)
    : COVER_COPY.label(oped.publishedOn);

  return (
    <a
      href={oped.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={COVER_COPY.linkLabel(oped.title)}
      className={cn(
        "shoulder group/cover block h-full transition-transform duration-[300ms] ease-out hover:-translate-y-1 focus-visible:-translate-y-1 motion-reduce:transform-none",
        "focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-4",
        className,
      )}
    >
      <div
        data-surface={surface}
        style={ART_TINTS[surface]}
        className={cn(
          "shoulder text-ink @container relative grid h-full overflow-hidden",
          surface === "paper" ? "bg-surface border-line border" : "bg-canvas",
          INNER[layout],
        )}
      >
        <div aria-hidden="true" className={cn("relative", ART[layout])}>
          <CoverArt motif={coverMotifFor(oped, lead)} stroke={STROKE[layout]} />
        </div>
        <p
          className={cn(
            "label text-ink-muted numerals relative z-10",
            LABEL_HALO,
            LABEL[layout],
          )}
        >
          {label}
        </p>
        <Heading
          className={cn(
            "font-display text-ink relative z-10 font-normal text-balance",
            TITLE[layout],
          )}
        >
          {oped.title}
        </Heading>
        {oped.topics.length > 0 ? (
          <ul
            className={cn("relative z-10 flex flex-wrap gap-2", CHIPS[layout])}
          >
            {oped.topics.slice(0, 3).map((topic, i) => (
              <Chip key={topic} as="li" className={CHIP_FIT[i]}>
                {topic}
              </Chip>
            ))}
          </ul>
        ) : null}
      </div>
    </a>
  );
}
