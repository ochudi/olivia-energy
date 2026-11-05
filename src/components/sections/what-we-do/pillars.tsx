import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Glyph } from "@/components/ui/glyph";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { PILLARS } from "@/content/brand";

const STAGGER = 90;

/**
 * What we do, section 10 (creative brief 4.2): the four pillars on paper.
 * Four shoulder tiles in a row at 1024 px and up (about 306 x 400), each
 * on its own flood: Research green, Advisory night, Innovation lime,
 * Impact red. Each tile: the 64 px glyph (drawn in), its number, the
 * title in display-md and the line in text-base. Two by two at 768 px,
 * stacked on phones.
 */
export function Pillars() {
  return (
    <Section surface="paper" id="pillars" aria-labelledby="pillars-title">
      <Container>
        <div className="max-w-[40rem]">
          <Eyebrow flame>{PILLARS.eyebrow}</Eyebrow>
          <Display
            as="h2"
            size="lg"
            reveal="mask"
            id="pillars-title"
            className="mt-6"
          >
            {PILLARS.title}
          </Display>
        </div>
        <ol className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {PILLARS.items.map((pillar, i) => (
            <Reveal key={pillar.name} as="li" delay={i * STAGGER}>
              <article
                data-surface={pillar.surface}
                className="bg-canvas text-ink shoulder flex h-full min-h-[18rem] flex-col p-6 sm:p-7 lg:min-h-[25rem] lg:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <Reveal variant="draw">
                    <Glyph name={pillar.glyph} size={64} draw />
                  </Reveal>
                  <span className="label numerals text-ink-muted pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-display-md text-ink mt-auto pt-10 font-normal">
                  {pillar.name}
                </h3>
                <p className="text-ink mt-4 max-w-[26ch] text-base text-pretty lg:min-h-[4.8em]">
                  {pillar.text}
                </p>
              </article>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
