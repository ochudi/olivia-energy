import type { CSSProperties } from "react";
import type { OpEd } from "@/types/contracts";
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
  /**
   * The Insights page's signature moment (DESIGN.md, Layout): the wall
   * assembles as the reader arrives at it, each cover sliding into place
   * from its own side on a scroll-driven timeline. Off on the home wall,
   * where the opening is the moment and the covers' art only draws.
   */
  assemble?: boolean;
  id?: string;
  /** Level of each cover's title. */
  headingLevel?: 3 | 4;
};

/** Covers after the lead on the home wall. */
const HOME_COUNT = 4;

/**
 * Where a cover comes from when the wall assembles: the lead and the first
 * column slide in from the left, the last column from the right, the
 * middle from below; each column a little after the one before it.
 */
function arrival(column: 0 | 1 | 2, lead = false): CSSProperties {
  const from = lead
    ? { "--from-x": "-3rem", "--from-y": "0px" }
    : column === 0
      ? { "--from-x": "-2.5rem", "--from-y": "1rem" }
      : column === 2
        ? { "--from-x": "2.5rem", "--from-y": "1rem" }
        : { "--from-x": "0px", "--from-y": "2.5rem" };
  return { ...from, "--assemble-offset": `${column * 5}svh` } as CSSProperties;
}

/**
 * CoverWall — the founder's op-eds as a wall of report covers ("On the record"). Only the wall: the section, heading and count
 * line belong to the page. Colours are assigned so no two covers of one
 * colour touch; every cover's art draws itself as it comes into view.
 */
export function CoverWall({
  opeds,
  layout,
  assemble = false,
  id,
  headingLevel = 3,
}: CoverWallProps) {
  if (opeds.length === 0) return null;
  const [lead, ...rest] = opeds;
  const motion = (column: 0 | 1 | 2, isLead = false) =>
    assemble
      ? { className: "assemble", style: arrival(column, isLead) }
      : { className: undefined, style: undefined };

  if (layout === "home") {
    // The two sanitation pieces (and any op-ed that is only Policy or
    // Economy) never appear on the home wall.
    const four = rest.filter(isEnergyOpEd).slice(0, HOME_COUNT);
    const wall = [lead, ...four];
    // 2 x 2 beside the lead: wall[3] sits under wall[1], wall[4] under wall[2].
    const tones = wallTones(wall, (i) => (i >= 3 ? i - 2 : undefined));
    return (
      <div
        id={id}
        data-fold-split=""
        className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12"
      >
        <div data-fold-span="" className="lg:col-span-6">
          <OpEdCover
            oped={lead}
            size="lead"
            tone={tones[0]}
            headingLevel={headingLevel}
          />
        </div>
        <ul
          data-scroll-rail=""
          className={cn(
            // Phones: a native rail, 260 px covers, the next one cut.
            "-mx-gutter px-gutter scroll-px-gutter flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-2",
            // Tablet and up: a 2 x 2 grid.
            "md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:col-span-6",
          )}
        >
          {four.map((oped, i) => (
            <li
              key={oped.slug}
              className="w-[260px] shrink-0 snap-start md:w-auto"
            >
              <OpEdCover
                oped={oped}
                size="standard"
                tone={tones[i + 1]}
                headingLevel={headingLevel}
              />
            </li>
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
  /** The grid column (0 to 2) a cover after the lead lands in at 1024 px. */
  const columnOf = (i: number): 0 | 1 | 2 =>
    i < beside
      ? 2
      : i >= tailFrom
        ? ((((i - tailFrom) * 2) % 3) as 0 | 2)
        : (((i - beside) % 3) as 0 | 1 | 2);
  const leadMotion = motion(0, true);
  // Columns follow the wall's own width (container queries), so a
  // near-square screen such as a foldable's inner display gets two columns
  // rather than a stretched phone stack; a half-folded one splits the wall
  // either side of the hinge (data-fold-split, globals.css "Foldables").
  return (
    <div className="@container">
      <ul
        id={id}
        data-fold-split=""
        className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @xl:gap-6 @4xl:grid-cols-12"
      >
        <li
          className={cn(
            "@xl:col-span-2 @4xl:col-span-8",
            beside === 2 && "@4xl:row-span-2",
            leadMotion.className,
          )}
          style={leadMotion.style}
        >
          <OpEdCover
            oped={lead}
            size="lead"
            tone={tones[0]}
            headingLevel={headingLevel}
          />
        </li>
        {rest.map((oped, i) => {
          const m = motion(columnOf(i));
          return (
            <li
              key={oped.slug}
              className={cn(
                i >= tailFrom
                  ? tail === 2
                    ? "@4xl:col-span-6"
                    : "@4xl:col-span-12"
                  : "@4xl:col-span-4",
                m.className,
              )}
              style={m.style}
            >
              <OpEdCover
                oped={oped}
                size="standard"
                compactOnPhone
                tone={tones[i + 1]}
                headingLevel={headingLevel}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
