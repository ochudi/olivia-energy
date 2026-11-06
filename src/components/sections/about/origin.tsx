import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Section } from "@/components/ui/section";
import { ORIGIN } from "@/content/about";

/**
 * About section 7, "Where we started" (creative brief 4.3): the H2 in cols
 * 1 to 5; the paragraph and the company facts as a definition list in cols
 * 7 to 12. Facts from the CAC record and the 2020 reports of the two
 * retail outlets (content/about.ts). Static.
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
      </Container>
    </Section>
  );
}
