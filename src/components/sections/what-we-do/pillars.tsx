import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Glyph } from "@/components/ui/glyph";
import { Section } from "@/components/ui/section";
import { PILLARS } from "@/content/brand";

/**
 * What we do, section 10: the four pillars on the
 * field, as one row of their glyphs with their lines: the 64 px glyph
 * (drawing itself), the name in display-md and the line in text-base, on
 * hairlines. Four columns at 1024 px and up, two by two at 768 px, stacked
 * on phones. The four flood tiles belong to Who we serve, which follows.
 */
export function Pillars() {
  return (
    <Section surface="paper" id="pillars" aria-labelledby="pillars-title">
      <Container>
        <Display as="h2" size="lg" id="pillars-title" className="max-w-[16ch]">
          {PILLARS.title}
        </Display>
        <ul className="border-line mt-12 grid grid-cols-1 gap-x-6 border-t md:mt-16 md:grid-cols-2 lg:grid-cols-4">
          {PILLARS.items.map((pillar) => (
            <li
              key={pillar.name}
              className="border-line flex flex-col border-b py-8 md:py-10 lg:border-b-0 lg:pt-10"
            >
              <Glyph name={pillar.glyph} size={64} draw />
              <h3 className="font-display text-display-md text-ink mt-10 font-normal">
                {pillar.name}
              </h3>
              <p className="text-ink-muted mt-4 max-w-[26ch] text-base text-pretty">
                {pillar.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
