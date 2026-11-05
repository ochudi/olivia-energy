import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Glyph } from "@/components/ui/glyph";
import { Lede } from "@/components/ui/lede";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { ShoulderImage, photoCaption } from "@/components/ui/shoulder-image";
import { HOME_SERVICES } from "@/content/home";
import { PHOTOS } from "@/content/images";
import { SERVICES, type Service } from "@/content/site";
import { cn } from "@/lib/utils/cn";
import { HomeSectionHeader } from "./section-header";

const STAGGER = 90;
/* Cards are 4 columns of 12 at 1024+ (about 416 px), half the container on
   tablets, and 300 px in the phone rail. */
const SIZES = "(min-width: 1024px) 416px, (min-width: 768px) 45vw, 300px";

function ServiceCard({ service }: { service: Service }) {
  const credit = photoCaption(PHOTOS[service.photo]);
  return (
    <article className="group/card relative flex h-full flex-col">
      <ShoulderImage
        photo={service.photo}
        sizes={SIZES}
        ratio="4/5"
        corner="lg"
        quality={60}
        reveal="wipe"
        imgClassName="transition-[scale] duration-[600ms] ease-out group-hover/card:scale-[1.04] motion-reduce:transition-none"
      />
      {/* Two lines reserved so the rows below line up across the grid. */}
      <p className="source-line text-ink-muted mt-3 min-h-[2lh]">{credit}</p>
      <div className="border-line mt-6 flex items-center justify-between border-t pt-4">
        <span className="label text-ink-muted numerals">{service.number}</span>
        <Glyph name={service.glyph} size={40} draw />
      </div>
      <h3 className="font-display text-display-sm text-ink mt-4 font-normal text-balance">
        {service.title}
      </h3>
      <p className="text-ink-muted mt-3 max-w-[38ch] text-sm text-pretty">
        {service.summary}
      </p>
      <div className="mt-auto pt-6">
        {/* One link per card; its hit area covers the whole card. */}
        <Button
          href={`/what-we-do#${service.slug}`}
          variant="text"
          arrow
          aria-label={HOME_SERVICES.linkAriaLabel(service.title)}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {HOME_SERVICES.linkLabel}
        </Button>
      </div>
    </article>
  );
}

/**
 * Our services (creative brief 4.1 section 4): six cards, each a 4:5
 * photograph in the shoulder shape, the number and glyph, the title, the
 * summary and "Explore". A 3 x 2 grid at 1024+, two columns on tablets, and
 * a native snap rail on phones that bleeds to the screen edges with the
 * next card cut. Photographs load lazily and wipe up as they enter.
 */
export function HomeServices() {
  const { eyebrow, title, lede, allCta } = HOME_SERVICES;
  return (
    <Section surface="paper" id="services" aria-labelledby="services-title">
      <Container>
        <HomeSectionHeader
          eyebrow={eyebrow}
          title={title}
          titleId="services-title"
          aside={<Lede>{lede}</Lede>}
        />

        <ul
          className={cn(
            // Phones: a native rail, 300 px cards, the next one cut.
            "-mx-gutter px-gutter scroll-px-gutter mt-12 flex snap-x snap-proximity [scrollbar-width:none] gap-4 overflow-x-auto pb-2",
            // Tablet and up: a grid.
            "md:mx-0 md:mt-16 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-16 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3",
          )}
        >
          {SERVICES.map((service, i) => (
            <Reveal
              key={service.slug}
              as="li"
              delay={(i % 3) * STAGGER}
              className="w-[300px] shrink-0 snap-start md:w-auto"
            >
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </ul>

        <div className="mt-10 flex md:mt-14 md:justify-end">
          <Button href={allCta.href} variant="secondary" arrow>
            {allCta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
