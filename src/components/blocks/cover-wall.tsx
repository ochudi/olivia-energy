import type { OpEd } from "@/types/contracts";
import { Reveal } from "@/components/ui/reveal";
import { isEnergyOpEd } from "@/content/commentary";
import { cn } from "@/lib/utils/cn";
import { OpEdCover } from "./op-ed-cover";
import { wallTones } from "./cover-tone";

export type CoverWallProps = {
  /** Op-eds, newest first (getOpEds()). The first is the lead. */
  opeds: readonly OpEd[];
  /**
   * home: the lead (cols 1 to 6) and the next four energy op-eds in a 2 x 2
   * grid (cols 7 to 12); on phones the four sit in a native rail.
   * archive: the lead (cols 1 to 8) with the next two covers stacked
   * beside it, then every other op-ed in a three-column grid whose last row
   * shares the full width; on phones, compact covers in one column.
   */
  layout: "home" | "archive";
  id?: string;
  /** Level of each cover's title. */
  headingLevel?: 3 | 4;
};

/** Covers after the lead on the home wall (creative brief 4.1 section 7). */
const HOME_COUNT = 4;
const STAGGER = 90;

/**
 * CoverWall — the founder's op-eds as a wall of report covers (creative
 * brief 2.9 "On the record"). Only the wall: the section, heading and count
 * line belong to the page. Covers fade in with a stagger and their art
 * draws; colours are assigned so no two covers of one colour touch.
 */
export function CoverWall({
  opeds,
  layout,
  id,
  headingLevel = 3,
}: CoverWallProps) {
  if (opeds.length === 0) return null;
  const [lead, ...rest] = opeds;

  if (layout === "home") {
    // The two sanitation pieces (and any op-ed that is only Policy or
    // Economy) never appear on the home wall.
    const four = rest.filter(isEnergyOpEd).slice(0, HOME_COUNT);
    const wall = [lead, ...four];
    // 2 x 2 beside the lead: wall[3] sits under wall[1], wall[4] under wall[2].
    const tones = wallTones(wall, (i) => (i >= 3 ? i - 2 : undefined));
    return (
      <div id={id} className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <OpEdCover
            oped={lead}
            size="lead"
            tone={tones[0]}
            headingLevel={headingLevel}
          />
        </Reveal>
        <ul
          className={cn(
            // Phones: a native rail, 260 px covers, the next one cut.
            "-mx-gutter px-gutter scroll-px-gutter flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2",
            // Tablet and up: a 2 x 2 grid.
            "md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:col-span-6",
          )}
        >
          {four.map((oped, i) => (
            <Reveal
              key={oped.slug}
              as="li"
              delay={(i + 1) * STAGGER}
              className="w-[260px] shrink-0 snap-start md:w-auto"
            >
              <OpEdCover
                oped={oped}
                size="standard"
                tone={tones[i + 1]}
                headingLevel={headingLevel}
              />
            </Reveal>
          ))}
        </ul>
      </div>
    );
  }

  // Archive at 1024 and up: the lead (cols 1 to 8) spans two rows, with
  // two covers stacked beside it (cols 9 to 12), so no cover is stretched
  // to the lead's height. Then rows of three; a short last row shares the
  // full width (two covers at six columns, one at twelve), so no cover is
  // ever left alone in a row. Phones and tablets: one and two columns.
  const beside = Math.min(2, rest.length);
  const tail = (rest.length - beside) % 3;
  const tailFrom = rest.length - tail;
  // Visually above: index 2 sits under 1; the first two grid covers sit
  // under the lead, the third under 2; then the cover three back. The wide
  // tail covers sit under the cover three back as well (close enough).
  const tones = wallTones(opeds, (i) =>
    i === 2
      ? 1
      : i === 3 || i === 4
        ? 0
        : i === 5
          ? 2
          : i > 5
            ? i - 3
            : undefined,
  );
  return (
    <ul
      id={id}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12"
    >
      <Reveal
        as="li"
        className={cn(
          "md:col-span-2 lg:col-span-8",
          beside === 2 && "lg:row-span-2",
        )}
      >
        <OpEdCover
          oped={lead}
          size="lead"
          tone={tones[0]}
          headingLevel={headingLevel}
        />
      </Reveal>
      {rest.map((oped, i) => (
        <Reveal
          key={oped.slug}
          as="li"
          delay={((i % 3) + 1) * STAGGER}
          className={
            i >= tailFrom
              ? tail === 2
                ? "lg:col-span-6"
                : "lg:col-span-12"
              : "lg:col-span-4"
          }
        >
          <OpEdCover
            oped={oped}
            size="standard"
            compactOnPhone
            tone={tones[i + 1]}
            headingLevel={headingLevel}
          />
        </Reveal>
      ))}
    </ul>
  );
}
