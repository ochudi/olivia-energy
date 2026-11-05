import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { NARRATIVE } from "@/content/brand";

/**
 * About section 3, "Who we are" (creative brief 4.3; A Refined Brand
 * Narrative): eyebrow and H2 in cols 1 to 5, the two paragraphs in cols 7
 * to 12 at text-lg; stacked on phones.
 */
export function WhoWeAre() {
  return (
    <Section surface="paper" id="who-we-are" aria-labelledby="who-we-are-title">
      <Container>
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-5">
            <Eyebrow>{NARRATIVE.eyebrow}</Eyebrow>
            <Display
              as="h2"
              size="lg"
              reveal="mask"
              id="who-we-are-title"
              className="mt-6 max-w-[14ch] md:mt-8"
            >
              {NARRATIVE.title}
            </Display>
          </div>
          <div className="text-ink max-w-[68ch] space-y-6 font-sans text-lg text-pretty lg:col-span-6 lg:col-start-7 lg:pt-12">
            {NARRATIVE.paragraphs.map((paragraph, i) => (
              <Reveal as="p" key={paragraph} delay={i * 90}>
                {paragraph}
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
