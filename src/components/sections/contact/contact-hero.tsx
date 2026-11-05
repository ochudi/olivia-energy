import { AfricaMap } from "@/components/figures";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { CONTACT_PAGE } from "@/content/contact";

const copy = CONTACT_PAGE.hero;

/**
 * Contact hero (creative brief 4.7, section 1): the red flood. Cols 1 to 6
 * carry the eyebrow, the H1 in white and the lede; cols 7 to 12 the dotted
 * Africa with a ring around Southwest Nigeria (a region, not a town) and its
 * label, and under the map, as its own line, the second place. The H1 never
 * animates; the dots fade and the ring draws (inside AfricaMap). Phones:
 * text, then the map at 320 px tall, which starts inside the first screen.
 * The map image is decorative (alt=""): the region label and the line below
 * it carry the places as text.
 */
export function ContactHero() {
  return (
    <Section
      surface="red"
      hero="dark"
      aria-labelledby="contact-title"
      className="overflow-clip"
    >
      <Container>
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-6">
          <div className="lg:col-span-6">
            <Eyebrow flame className="text-ink">
              {copy.eyebrow}
            </Eyebrow>
            <Display as="h1" size="xl" id="contact-title" className="mt-6">
              {copy.title}
            </Display>
            <p className="text-ink mt-8 max-w-[42ch] text-xl text-pretty">
              {copy.lede}
            </p>
          </div>

          <div className="flex flex-col items-center lg:col-span-6 lg:col-start-7 lg:items-stretch">
            <Reveal
              variant="fade"
              className="mx-auto w-[calc(20rem*72/76)] max-w-full lg:w-full lg:max-w-[34rem]"
            >
              <AfricaMap alt="" regionLabel={copy.mapLabel} />
            </Reveal>
            <p className="text-ink border-line mt-6 flex w-full items-center gap-3 border-t pt-5 text-base lg:mx-auto lg:max-w-[34rem]">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-current"
              />
              {copy.mapSecondary}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
