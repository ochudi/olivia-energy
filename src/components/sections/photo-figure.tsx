import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { SitePhoto } from "@/content/images";
import { cn } from "@/lib/utils/cn";

export type PhotoFigureProps = {
  /** An entry from the PHOTOS manifest (src/content/images.ts). */
  photo: SitePhoto;
  /** Responsive `sizes` for next/image; must describe the rendered width. */
  sizes: string;
  /** Aspect (and any max-height) classes for the frame, e.g. "aspect-[3/2] lg:aspect-[21/9]". */
  frameClassName: string;
  /** Above-the-fold figures preload with high priority; the rest load lazily. */
  priority?: boolean;
  /**
   * Full-bleed figure: the frame spans the viewport (hairlines top and
   * bottom only) and the caption sits inside a page Container.
   */
  bleed?: boolean;
  className?: string;
};

/**
 * PhotoFigure — an editorial photograph in a square-cornered hairline frame
 * with a mono caption and credit underneath. The image fills a fixed-aspect
 * box (object-cover), so the layout is reserved before the file arrives and
 * the blur placeholder from the manifest paints first.
 */
export function PhotoFigure({
  photo,
  sizes,
  frameClassName,
  priority = false,
  bleed = false,
  className,
}: PhotoFigureProps) {
  const caption = (
    <figcaption className="text-ink-subtle mt-3 font-mono text-xs">
      {photo.caption}. Photograph: {photo.credit} / Unsplash.
    </figcaption>
  );
  return (
    <Reveal as="figure" className={className}>
      <div
        className={cn(
          "border-line bg-surface-muted relative overflow-hidden rounded-none",
          bleed ? "border-y" : "border",
          frameClassName,
        )}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          quality={60}
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover"
        />
      </div>
      {bleed ? <Container>{caption}</Container> : caption}
    </Reveal>
  );
}
