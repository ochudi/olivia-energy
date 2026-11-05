import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { DIFFERENTIATORS_BLOCK } from "@/content/brand";

const STAGGER = 90;

/**
 * What we do, section 9 (creative brief 4.2): what makes us different, on
 * a green flood. The eyebrow and H2 in columns 1 to 5; six numbered
 * statements in display-xs in columns 6 to 12, divided by the green
 * surface's line, fading in with a stagger. Stacked on phones.
 */
export function Differentiators() {
  const b = DIFFERENTIATORS_BLOCK;
  return (
    <Section surface="green" id="different" aria-labelledby="different-title">
      <Container>
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-5">
            <Eyebrow flame>{b.eyebrow}</Eyebrow>
            <Display
              as="h2"
              size="lg"
              reveal="mask"
              id="different-title"
              className="mt-6 max-w-[13ch]"
            >
              {b.title}
            </Display>
          </div>
          <ol className="border-line border-b lg:col-span-7 lg:col-start-6">
            {b.items.map((item, i) => (
              <Reveal
                key={item}
                as="li"
                delay={i * STAGGER}
                className="border-line grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t py-6 sm:grid-cols-[4rem_minmax(0,1fr)] lg:py-7"
              >
                <span className="label numerals text-ink-muted pt-[0.45em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-display text-display-xs text-ink text-balance">
                  {item}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
