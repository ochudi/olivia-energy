import { MARK_MONO_PATH, MARK_PATHS } from "@/lib/brand/mark";
import { cn } from "@/lib/utils/cn";
import type { CoverMotif } from "./cover-tone";

/*
 * Cover art: the mark cut up into its parts (the whole mark, the flame, the
 * ring, the lime tongue) plus the ring's arcs, set large in the top-right
 * corner of a cover and bleeding off its edges. Every shape is drawn in a
 * 200-unit square anchored top-right (`xMaxYMin meet`); nothing extends left
 * of x = 0 or below y = 200, so the art never reaches the title, which sits
 * in its own grid row below the art well.
 *
 * Colours come from two custom properties the cover sets from its own
 * surface: --art-fill (a tint of the cover colour) and --art-line (a
 * stronger tint for the one stroke that draws itself as the cover scrolls
 * into view: the svg names the view timeline, the `draw` class plays on it).
 */

type Placement = { x: number; y: number; s: number };

const PLACE: Record<Exclude<CoverMotif, "arc">, Placement> = {
  mark: { x: 72, y: -60, s: 2.4 },
  flame: { x: 80, y: -80, s: 2.9 },
  ring: { x: 26.4, y: -134.2, s: 3 },
  tongue: { x: 84, y: -80, s: 2.9 },
};

/** A full circle as a path that starts at the top, so a draw sweeps clockwise. */
function circle(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}`;
}

/** A quarter arc around the top-right corner (200, 0). */
function cornerArc(r: number) {
  return `M${200 - r} 0A${r} ${r} 0 0 0 200 ${r}`;
}

const FILL = { fill: "var(--art-fill)" } as const;
const LINE = {
  fill: "none",
  stroke: "var(--art-line)",
  strokeLinecap: "round",
} as const;

function Motif({ motif, stroke }: { motif: CoverMotif; stroke: number }) {
  if (motif === "arc") {
    return (
      <>
        <path d="M200 0H132A68 68 0 0 0 200 68Z" style={FILL} />
        <path
          d={`${cornerArc(124)}L200 100A100 100 0 0 1 100 0Z`}
          style={FILL}
        />
        <path
          d={cornerArc(158)}
          pathLength={1}
          className="draw"
          style={{ ...LINE, strokeWidth: stroke }}
        />
        <path
          d={cornerArc(184)}
          pathLength={1}
          className="draw draw-late"
          style={{ ...LINE, strokeWidth: stroke }}
        />
      </>
    );
  }

  const { x, y, s } = PLACE[motif];
  const group = `translate(${x} ${y}) scale(${s})`;
  const inGroup = stroke / s;

  if (motif === "mark") {
    return (
      <>
        <path d={MARK_MONO_PATH} transform={group} style={FILL} />
        <path
          d={circle(x + 37.2 * s, y + 65.4 * s, 100)}
          pathLength={1}
          className="draw"
          style={{ ...LINE, strokeWidth: stroke }}
        />
      </>
    );
  }
  if (motif === "flame") {
    return (
      <>
        <path d={MARK_PATHS.flame} transform={group} style={FILL} />
        <path
          d={MARK_PATHS.flame}
          transform={`translate(${x - 26} ${y - 4}) scale(${s})`}
          pathLength={1}
          className="draw"
          style={{ ...LINE, strokeWidth: inGroup, strokeLinejoin: "round" }}
        />
      </>
    );
  }
  if (motif === "ring") {
    return (
      <>
        <path d={MARK_PATHS.ring} transform={group} style={FILL} />
        <path
          d={circle(x + 37.2 * s, y + 65.4 * s, 132)}
          pathLength={1}
          className="draw"
          style={{ ...LINE, strokeWidth: stroke }}
        />
      </>
    );
  }
  // tongue: the lime tongue filled, the red tongue drawn over it as a line.
  return (
    <>
      <path d={MARK_PATHS.lime} transform={group} style={FILL} />
      <path
        d={MARK_PATHS.red}
        transform={group}
        pathLength={1}
        className="draw"
        style={{ ...LINE, strokeWidth: inGroup, strokeLinejoin: "round" }}
      />
    </>
  );
}

export function CoverArt({
  motif,
  stroke = 1.6,
  className,
}: {
  motif: CoverMotif;
  /** Stroke width of the drawn line, in art units (200 to the square). */
  stroke?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMaxYMin meet"
      aria-hidden="true"
      focusable="false"
      className={cn("draw-scope block h-full w-full", className)}
    >
      <Motif motif={motif} stroke={stroke} />
    </svg>
  );
}
