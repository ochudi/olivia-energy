import { getImageProps } from "next/image";
import type { PhotoKey } from "@/types/contracts";
import { PHOTOS, type Photo } from "@/content/images";

/**
 * Art direction for the opening photograph: the 16:9
 * crop on landscape screens, the 9:16 crop on portrait ones. Both go
 * through next/image so they arrive as WebP at the served width: at 1440 px
 * the desktop crop is about 38 KB (1x) to 65 KB (2x) at quality 75 (measured
 * on the dev server, 3 October 2026).
 */
const LANDSCAPE = "(min-aspect-ratio: 1/1)";
const PORTRAIT = "not all and (min-aspect-ratio: 1/1)";
const SIZES = "100vw";
/**
 * The phone crop is described as two thirds of a phone-wide viewport, so a
 * 390 px phone at 3x picks the 828 px file (about 16 KB at quality 60)
 * instead of the 1200 px one (about 33 KB). Under the hero's scrims 2x
 * density reads the same, and the lighter file keeps the home LCP within its
 * ceiling on slow networks. Portrait tablets still get the full width.
 */
const PHONE_SIZES = "(max-width: 480px) 67vw, 100vw";

export type HeroSources = {
  alt: string;
  desktopSrcSet: string;
  phoneSrcSet: string;
  src: string;
  width: number;
  height: number;
  /** object-position for each crop. */
  focal: { desktop: string; phone: string };
};

/** Phone focal point (9:16 crop, 55% / 52%). */
const PHONE_FOCAL = "55% 52%";

export function heroSources(key: PhotoKey): HeroSources {
  const photo: Photo = PHOTOS[key] as Photo;
  const desktop = photo.variants?.desktop ?? photo;
  const phone = photo.variants?.phone ?? photo;
  const { props: d } = getImageProps({
    src: desktop.src,
    width: desktop.width,
    height: desktop.height,
    alt: photo.alt,
    sizes: SIZES,
    quality: 75,
  });
  const { props: m } = getImageProps({
    src: phone.src,
    width: phone.width,
    height: phone.height,
    alt: photo.alt,
    sizes: PHONE_SIZES,
    quality: 60,
  });
  return {
    alt: photo.alt,
    desktopSrcSet: d.srcSet ?? "",
    phoneSrcSet: m.srcSet ?? "",
    src: m.src,
    width: phone.width,
    height: phone.height,
    focal: {
      desktop: photo.focal ?? "50% 50%",
      phone: PHONE_FOCAL,
    },
  };
}

/**
 * Preloads both crops, each only where its media query matches. Rendered
 * as <link> elements (React hoists them into <head>), not with
 * `preload()` from react-dom: a preload() call becomes a hint in the RSC
 * payload, and a hint is acted on whenever that payload is fetched, so
 * every page that prefetched "/" (the logo link) downloaded the home
 * photograph too (34 KB on a phone, 39 KB on a desktop). A <link> element only takes effect when the home page
 * is rendered.
 */
export function HeroPreload({ sources }: { sources: HeroSources }) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        imageSrcSet={sources.desktopSrcSet}
        imageSizes={SIZES}
        media={LANDSCAPE}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet={sources.phoneSrcSet}
        imageSizes={PHONE_SIZES}
        media={PORTRAIT}
        fetchPriority="high"
      />
    </>
  );
}

/**
 * The <picture>. `eager` is the hero itself (the LCP element: never faded
 * or clipped in; it only settles in scale); the mark window reuses the
 * same sources and sizes, so the browser picks the file it already has.
 */
export function HeroPicture({
  sources,
  eager,
  className,
  imgClassName,
  decorative = false,
}: {
  sources: HeroSources;
  eager: boolean;
  className?: string;
  imgClassName?: string;
  decorative?: boolean;
}) {
  return (
    <picture className={className}>
      <source media={LANDSCAPE} srcSet={sources.desktopSrcSet} sizes={SIZES} />
      <img
        src={sources.src}
        srcSet={sources.phoneSrcSet}
        sizes={PHONE_SIZES}
        width={sources.width}
        height={sources.height}
        alt={decorative ? "" : sources.alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding={eager ? "sync" : "async"}
        className={imgClassName}
      />
    </picture>
  );
}
