import { RingMark } from "@/components/ui/ring";
import {
  AFRICA_SRC,
  AFRICA_VIEW,
  type MapRegion,
  projectPercent,
  regionWidthPercent,
  SOUTHWEST_NIGERIA,
} from "@/lib/figures/africa";
import { cn } from "@/lib/utils/cn";
import styles from "./africa-map.module.css";

export type AfricaMapProps = {
  /** Alt text for the map image ("" when the label beside the ring carries the place). */
  alt: string;
  /** The label beside the ring ("Southwest Nigeria"). */
  regionLabel: string;
  /** The region marked; Southwest Nigeria by default. */
  region?: MapRegion;
  /**
   * `lead`: the Contact page's signature moment, settling once on load on
   * a desktop and on scroll below 48rem. `scroll`: on scroll only.
   * `none`: the settled map.
   */
  motion?: "lead" | "scroll" | "none";
  className?: string;
};

/**
 * AfricaMap — the dotted Africa (Contact hero, brief 4.7): the generated
 * SVG shown with <img> (white dots at 35% opacity) and a region marked by a
 * ring in the surface's ink (white on the red hero, since lime is never on
 * red) over a faint disc, with the label beside it. The ring is sized in
 * degrees of the map, so it marks an area rather than a point, and it is
 * HTML placed with `projectPercent`, so it is sharp at any size. The map
 * settles on the region (africa-map.module.css).
 */
export function AfricaMap({
  alt,
  regionLabel,
  region = SOUTHWEST_NIGERIA,
  motion = "scroll",
  className,
}: AfricaMapProps) {
  const at = projectPercent(region.lat, region.lon);
  const width = regionWidthPercent(region.radius);
  return (
    <div
      className={cn(
        "relative w-full",
        motion !== "none" && styles.scope,
        motion === "lead" && styles.lead,
        className,
      )}
      style={{ aspectRatio: `${AFRICA_VIEW.width} / ${AFRICA_VIEW.height}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG, no optimisation wanted */}
      <img
        src={AFRICA_SRC}
        alt={alt}
        width={AFRICA_VIEW.width * 10}
        height={AFRICA_VIEW.height * 10}
        decoding="async"
        className={cn(styles.map, "block h-full w-full")}
        // The map settles about the region, so the region holds still.
        style={{ transformOrigin: `${at.left} ${at.top}` }}
      />
      <span
        className={cn(
          styles.ring,
          "text-ink absolute block aspect-square -translate-x-1/2 -translate-y-1/2",
        )}
        style={{ left: at.left, top: at.top, width }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-[8%] block rounded-full bg-white/15"
        />
        <RingMark size={40} stroke={2.5} gap={0} animate="draw" fill />
      </span>
      <span
        className={cn(
          styles.label,
          "text-ink bg-canvas/85 absolute -translate-y-1/2 rounded-xs px-1.5 py-0.5 text-sm font-semibold whitespace-nowrap",
        )}
        style={{
          left: `calc(${at.left} + ${width} / 2 + 0.375rem)`,
          top: at.top,
        }}
      >
        {regionLabel}
      </span>
    </div>
  );
}
