import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { VALUES } from "@/content/about";

/** Values as hairline definition rows on the canvas: name, then what it means. */
export function Values() {
  return (
    <section id="values" className="py-section">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              number="02"
              eyebrow="Values"
              title="What we hold to."
              lede="How we choose the work, and how we do it."
            />
          </Reveal>
          <dl className="border-line border-b lg:col-span-8">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="border-line grid gap-2 border-t py-6 md:grid-cols-12 md:gap-8"
              >
                <dt className="font-display text-display-xs font-normal md:col-span-4">
                  {value.title}
                </dt>
                <dd className="text-ink-muted max-w-text text-base leading-relaxed text-pretty md:col-span-8 md:pt-1">
                  {value.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
