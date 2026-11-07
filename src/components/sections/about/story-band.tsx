import { getImageProps } from "next/image";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Section } from "@/components/ui/section";
import { ABOUT_STORY } from "@/content/about";
import { PHOTOS } from "@/content/images";

/** Art direction: the 21:9 crop from 1024 px, the 4:5 crop below. */
const DESKTOP = "(min-width: 1024px)";

/**
 * Night scrim over the left and the foot of the photograph, so white text
 * keeps 4.5:1 over the brightest sky behind the panel.
 */
const SCRIM =
  "linear-gradient(90deg, rgba(6,23,14,.9) 0%, rgba(6,23,14,.74) 42%, rgba(6,23,14,0) 72%), linear-gradient(0deg, rgba(6,23,14,.86) 0%, rgba(6,23,14,0) 64%)";

/**
 * The photograph as a <picture>: next/image builds both srcsets (one per
 * crop), and the <source> picks the crop. Below the fold, so lazy.
 */
type Crop = { src: string; width: number; height: number };
type ArtDirectedPhoto = Crop & {
  alt: string;
  focal?: string;
  variants?: { phone?: Crop; desktop?: Crop };
};

function StoryPicture() {
  const photo: ArtDirectedPhoto = PHOTOS[ABOUT_STORY.photo];
  const phone = photo.variants?.phone ?? photo;
  const desktop = photo.variants?.desktop ?? photo;
  const common = { alt: photo.alt, quality: 75 } as const;
  const {
    props: { srcSet: desktopSet, sizes: desktopSizes },
  } = getImageProps({
    ...common,
    src: desktop.src,
    width: desktop.width,
    height: desktop.height,
    sizes: "100vw",
  });
  const {
    props: { srcSet: phoneSet, ...img },
  } = getImageProps({
    ...common,
    src: phone.src,
    width: phone.width,
    height: phone.height,
    sizes: "100vw",
  });
  return (
    <picture>
      <source media={DESKTOP} srcSet={desktopSet} sizes={desktopSizes} />
      <img
        {...img}
        srcSet={phoneSet}
        alt={photo.alt}
        className="wipe-inner parallax absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: photo.focal }}
      />
    </picture>
  );
}

/**
 * About section 2, "Our story": the Abuja street
 * lights at sunset. From 1024 px the photograph runs full bleed at 21:9
 * with the shoulder on the band's top-right corner, and the text sits at
 * its bottom left (cols 1 to 7) on a night scrim; on phones the
 * photograph is 4:5 and the text follows on night. The photograph wipes
 * up and carries the parallax; the text is static.
 */
export function AboutStoryBand() {
  return (
    <Section surface="photo" spacing="none" aria-labelledby="story-title">
      <div className="relative">
        <figure className="relative">
          <div className="photo-scope wipe shoulder-lg relative isolate aspect-[4/5] w-full overflow-hidden lg:aspect-[21/9] lg:min-h-[36rem]">
            <StoryPicture />
            {/* The scrim: strongest under the text panel (bottom left). */}
            <span
              aria-hidden="true"
              className="absolute inset-0 hidden lg:block"
              style={{ background: SCRIM }}
            />
          </div>
          <figcaption className="source-line text-ink-muted px-gutter pt-3 lg:absolute lg:right-0 lg:bottom-0 lg:max-w-[24rem] lg:pt-0 lg:pb-6 lg:text-right">
            {ABOUT_STORY.caption}
          </figcaption>
        </figure>

        {/* From 1024px the text sits on the photograph's scrim, bottom
            left. Below it the photograph is 4:5 and the text follows, on
            the field: prose never sits on night (DESIGN.md, Colors), so
            the narrow copy carries its own surface. One of the two is
            ever displayed. */}
        <div className="hidden lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <Container>
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pb-[clamp(3rem,1rem+4vw,6rem)]">
              <div className="lg:col-span-7">
                <h2
                  id="story-title"
                  className="font-display text-display-xs text-ink"
                >
                  {ABOUT_STORY.heading}
                </h2>
                <p className="text-ink mt-6 max-w-[38rem] font-sans text-lg text-pretty">
                  {ABOUT_STORY.paragraph}
                </p>
                <Display as="p" size="sm" className="mt-8 max-w-[24ch]">
                  {ABOUT_STORY.statement}
                </Display>
              </div>
            </div>
          </Container>
        </div>
      </div>
      <div data-surface="paper" className="bg-canvas text-ink lg:hidden">
        <Container>
          <div className="py-section-sm">
            <h2
              id="story-title-narrow"
              className="font-display text-display-xs text-ink"
            >
              {ABOUT_STORY.heading}
            </h2>
            <p className="text-ink mt-6 max-w-[38rem] font-sans text-lg text-pretty">
              {ABOUT_STORY.paragraph}
            </p>
            <Display as="p" size="sm" className="mt-8 max-w-[38rem]">
              {ABOUT_STORY.statement}
            </Display>
          </div>
        </Container>
      </div>
    </Section>
  );
}
