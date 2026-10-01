import Image from "next/image";
import { PHOTOS } from "@/content/images";
import { cn } from "@/lib/utils/cn";

export type CoverImageProps = {
  src: string | null;
  alt?: string;
  /** Preloads with high priority (above-the-fold covers); otherwise lazy. */
  priority?: boolean;
  sizes: string;
  /** Blur placeholder. Covers shipped in /public/images get theirs from the manifest. */
  blurDataURL?: string;
  className?: string;
  /** Classes for the <img>, e.g. a hover scale driven by a parent group. */
  imageClassName?: string;
};

const MANIFEST = new Map<string, string>(
  Object.values(PHOTOS).map((photo) => [photo.src, photo.blurDataURL]),
);

/**
 * A post cover in a fixed 3:2 frame. Without a source it renders a flat
 * muted panel instead, so cards and headers keep their shape.
 */
export function CoverImage({
  src,
  alt = "",
  priority = false,
  sizes,
  blurDataURL,
  className,
  imageClassName,
}: CoverImageProps) {
  const blur = blurDataURL ?? (src ? MANIFEST.get(src) : undefined);
  return (
    <div
      className={cn(
        "border-line bg-surface-muted relative aspect-[3/2] overflow-hidden rounded-none border",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          // Photographs, not UI: 60 keeps AVIF/WebP covers under ~100 KB on phones.
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
