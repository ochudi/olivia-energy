import Image from "next/image";
import { photoCaption } from "@/components/ui/shoulder-image";
import { PHOTOS } from "@/content/images";
import { cn } from "@/lib/utils/cn";

export type CoverImageProps = {
  src: string | null;
  /** Defaults to the manifest's alt for a cover shipped in /public/images. */
  alt?: string;
  /** Preloads with high priority (the article cover); otherwise lazy. */
  priority?: boolean;
  sizes: string;
  /** 3:2 on cards, 16:9 in the article header (4.5). */
  ratio?: "3/2" | "16/9";
  /** The shoulder radius: `md` on cards, `lg` for the article cover. */
  corner?: "md" | "lg";
  /** Blur placeholder. Covers shipped in /public/images get theirs from the manifest. */
  blurDataURL?: string;
  className?: string;
  /** Classes for the <img>, e.g. a hover scale driven by a parent group. */
  imageClassName?: string;
};

type ManifestEntry = (typeof PHOTOS)[keyof typeof PHOTOS];

const MANIFEST = new Map<string, ManifestEntry>(
  Object.values(PHOTOS).map((photo) => [photo.src, photo]),
);

/** The manifest entry for a cover path, when the cover ships with the site. */
export function coverEntry(src: string | null): ManifestEntry | undefined {
  return src ? MANIFEST.get(src) : undefined;
}

/** "Tanker on the Ibadan road. Photo: Fahd Aminu", or null for a cover the manifest does not know. */
export function coverCaption(src: string | null): string | null {
  const entry = coverEntry(src);
  return entry ? photoCaption(entry) : null;
}

const RATIOS = { "3/2": "aspect-[3/2]", "16/9": "aspect-video" } as const;
const CORNERS = { md: "shoulder", lg: "shoulder-lg" } as const;

/**
 * A post cover in the shoulder shape: three tight
 * corners and the rounded top-right. Without a source it renders a flat
 * panel in the surface's muted fill, so cards keep their shape.
 */
export function CoverImage({
  src,
  alt,
  priority = false,
  sizes,
  ratio = "3/2",
  corner = "md",
  blurDataURL,
  className,
  imageClassName,
}: CoverImageProps) {
  const entry = coverEntry(src);
  const blur = blurDataURL ?? entry?.blurDataURL;
  return (
    <div
      className={cn(
        "bg-surface-muted relative isolate overflow-hidden",
        RATIOS[ratio],
        CORNERS[corner],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? entry?.alt ?? ""}
          fill
          preload={priority}
          // Photographs, not UI: 60 keeps covers light on phones.
          quality={60}
          placeholder={blur ? "blur" : "empty"}
          blurDataURL={blur}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      ) : null}
    </div>
  );
}
