import type { CSSProperties } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Section } from "@/components/ui/section";
import { ORIGIN } from "@/content/about";
import { HERITAGE_PHOTOS } from "@/content/images";

/**
 * The three photographs as a grid whose columns are proportioned by each
 * photograph's aspect ratio, so every frame in a row has the same height
 * and none is cropped (documentary photographs keep their whole frame).
 * From 1024 px all three sit in one row; at 768 px the station and the sign
 * share a row and the team photograph takes the next; phones stack them.
 * Each frame is capped at half the file's width (`maxWidth`), the most a
 * 2x screen can show sharp: the slot is sized to the photograph, never the
 * photograph stretched to the slot. Only the team photograph at 768 px
 * reaches its cap and sits narrower than its row.
 */
const photos = ORIGIN.photos.map((photo) => ({
  ...photo,
  ...HERITAGE_PHOTOS[photo.key],
}));
const ratio = (p: { width: number; height: number }) =>
  (p.width / p.height).toFixed(3);
const columns = {
  "--cols-md": `${ratio(photos[0])}fr ${ratio(photos[1])}fr`,
  "--cols-lg": photos.map((p) => `${ratio(p)}fr`).join(" "),
} as CSSProperties;

/**
 * About section 7, "Where we started": the H2 in cols
 * 1 to 5; the paragraph and the company facts as a definition list in cols
 * 7 to 12. Facts from the CAC record and the 2020 reports of the two
 * retail outlets (content/about.ts). Under them, the firm's own photographs
 * of its first station, each in the shoulder (the firm's own objects,
 * DESIGN.md Shapes), wiping in as photographs do (DESIGN.md, Motion).
 */
export function Origin() {
  return (
    <Section surface="paper" id="origin" aria-labelledby="origin-title">
      <Container>
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-5">
            <Display
              as="h2"
              size="lg"
              id="origin-title"
              className="max-w-[14ch]"
            >
              {ORIGIN.title}
            </Display>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-12">
            <p className="text-ink max-w-[68ch] font-sans text-lg text-pretty">
              {ORIGIN.paragraph}
            </p>
            <dl className="border-line mt-10 border-b md:mt-12">
              {ORIGIN.facts.map((fact) => (
                <div
                  key={fact.term}
                  className="border-line grid grid-cols-1 gap-1 border-t py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                >
                  <dt className="text-ink-muted font-sans text-sm font-medium sm:pt-1">
                    {fact.term}
                  </dt>
                  <dd className="text-ink numerals font-sans text-base">
                    {fact.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <figure className="mt-14 md:mt-16 lg:mt-20">
          <ul
            className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-(--cols-md) lg:grid-cols-(--cols-lg) lg:gap-x-6"
            style={columns}
          >
            {photos.map((photo, i) => (
              <li
                key={photo.key}
                className={i === 2 ? "md:col-span-2 lg:col-span-1" : undefined}
              >
                <div
                  className={
                    photo.height > photo.width ? "max-md:w-[65%]" : undefined
                  }
                  style={{ maxWidth: photo.width / 2 }}
                >
                  <div
                    className="photo-scope wipe shoulder relative overflow-hidden"
                    style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes={
                        i === 2
                          ? "(min-width: 1024px) 35vw, calc(100vw - 2.5rem)"
                          : photo.height > photo.width
                            ? "(min-width: 1024px) 16vw, (min-width: 768px) 28vw, 65vw"
                            : "(min-width: 1024px) 31vw, (min-width: 768px) 62vw, calc(100vw - 2.5rem)"
                      }
                      quality={75}
                      className="object-cover"
                    />
                  </div>
                  <p className="source-line text-ink-muted mt-3 text-pretty">
                    {photo.caption}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <figcaption className="text-ink border-line mt-8 border-t pt-4 font-sans text-sm">
            {ORIGIN.photosCaption}
          </figcaption>
        </figure>
      </Container>
    </Section>
  );
}
