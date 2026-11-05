import Image from "next/image";
import { PHOTOS } from "@/content/images";
import type { PhotoKey } from "@/types/contracts";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "./reveal";

export type ShoulderImageProps = {
  photo: PhotoKey;
  /** The `sizes` attribute: what fraction of the viewport the image fills at each width. */
  sizes: string;
  /** Crop. `auto` keeps the file's own proportions. */
  ratio?: "4/5" | "3/2" | "16/9" | "21/9" | "1/1" | "auto";
  /** The shoulder radius (brief 2.4): lg for photographs, md for cards, sm for tiles. */
  corner?: "lg" | "md" | "sm" | "none";
  /** Preload (the page's largest image only). */
  preload?: boolean;
  quality?: 60 | 75;
  /** `wipe` clips the photograph up as it enters (brief 2.8). */
  reveal?: "wipe" | "none";
  /** Shows the caption and credit under the image. */
  caption?: "below" | "none";
  className?: string;
  imgClassName?: string;
};

/** The manifest entry shape F5 publishes; `credit` was a string in the first release. */
type PhotoEntry = {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL: string;
  caption: string;
  credit:
    | string
    | {
        author: string;
        licence: string;
        licenceUrl?: string;
        sourceUrl: string;
        adapted: boolean;
      };
  focal?: string;
};

const RATIOS = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-[16/9]",
  "21/9": "aspect-[21/9]",
  "1/1": "aspect-square",
  auto: "",
} as const;

const CORNERS = {
  lg: "shoulder-lg",
  md: "shoulder",
  sm: "shoulder-sm",
  none: "",
} as const;

/**
 * The caption under a photograph. The rebuild's entries carry the credit
 * inside the caption ("Third Mainland Bridge, Lagos, at sunset. Photo:
 * Solasly, CC BY-SA 4.0"); a legacy entry has a bare caption and a
 * photographer string, which are joined the same way.
 */
export function photoCaption(entry: Pick<PhotoEntry, "caption" | "credit">) {
  if (typeof entry.credit !== "string" || /\bPhoto:/.test(entry.caption)) {
    return entry.caption;
  }
  return `${entry.caption}. Photo: ${entry.credit}`;
}

/**
 * ShoulderImage — a photograph from the manifest in the shoulder shape, with
 * next/image doing the sizing. The image keeps its final state in server
 * HTML; with `reveal="wipe"` it clips up and settles as it enters.
 */
export function ShoulderImage({
  photo,
  sizes,
  ratio = "auto",
  corner = "lg",
  preload = false,
  quality = 75,
  reveal = "none",
  caption = "none",
  className,
  imgClassName,
}: ShoulderImageProps) {
  const entry = (PHOTOS as Partial<Record<PhotoKey, PhotoEntry>>)[photo];
  if (!entry) {
    throw new Error(
      `ShoulderImage: no photograph "${photo}" in src/content/images.ts`,
    );
  }
  const fill = ratio !== "auto";
  const img = (
    <Image
      src={entry.src}
      alt={entry.alt}
      {...(fill
        ? { fill: true }
        : { width: entry.width, height: entry.height })}
      sizes={sizes}
      quality={quality}
      preload={preload}
      // A blur placeholder costs about 1.5 KB of HTML and RSC payload per
      // image; only an above-the-fold (preloaded) photograph carries one.
      placeholder={preload ? "blur" : "empty"}
      blurDataURL={preload ? entry.blurDataURL : undefined}
      className={cn(
        "h-full w-full object-cover",
        reveal === "wipe" && "wipe-inner",
        imgClassName,
      )}
      style={entry.focal ? { objectPosition: entry.focal } : undefined}
    />
  );
  const boxClass = cn(
    "relative isolate overflow-hidden",
    CORNERS[corner],
    RATIOS[ratio],
    caption === "none" && className,
  );
  const box =
    reveal === "wipe" ? (
      <Reveal variant="wipe" className={boxClass}>
        {img}
      </Reveal>
    ) : (
      <div className={boxClass}>{img}</div>
    );
  if (caption === "none") return box;
  return (
    <figure className={className}>
      {box}
      <figcaption className="text-ink-muted mt-3 font-sans text-sm">
        {photoCaption(entry)}
      </figcaption>
    </figure>
  );
}
