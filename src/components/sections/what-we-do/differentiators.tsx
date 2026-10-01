import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { DIFFERENTIATORS, DIFFERENTIATORS_HEADING } from "@/content/what-we-do";

/** What makes us different — a numbered hairline list. */
export function Differentiators() {
  return (
    <section id="different" className="border-line py-section border-t">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              eyebrow={DIFFERENTIATORS_HEADING.eyebrow}
              title={DIFFERENTIATORS_HEADING.title}
            />
          </Reveal>
          <ol className="border-line border-b lg:col-span-8">
            {DIFFERENTIATORS.map((item, index) => (
              <li
                key={item.title}
                className="border-line grid gap-3 border-t py-7 md:grid-cols-12 md:gap-8"
              >
                <span className="text-ink-muted font-mono text-xs tabular-nums md:col-span-1 md:pt-1.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-display-xs font-normal md:col-span-5">
                  {item.title}
                </h3>
                <p className="text-ink-muted max-w-text text-base leading-relaxed text-pretty md:col-span-6">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
