import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { WHO_WE_SERVE, WHO_WE_SERVE_HEADING } from "@/content/what-we-do";

/** Who we serve — six client segments as a hairline grid on the muted band. */
export function WhoWeServe() {
  return (
    <section id="who-we-serve" className="bg-surface-muted py-section">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              eyebrow={WHO_WE_SERVE_HEADING.eyebrow}
              title={WHO_WE_SERVE_HEADING.title}
              lede={WHO_WE_SERVE_HEADING.lede}
            />
          </Reveal>
          <ul className="bg-line border-line grid gap-px border sm:grid-cols-2 lg:col-span-8">
            {WHO_WE_SERVE.map((segment) => (
              <li key={segment.title} className="bg-surface p-6 md:p-8">
                <h3 className="font-display text-display-xs font-normal">
                  {segment.title}
                </h3>
                <p className="text-ink-muted mt-3 max-w-[36ch] text-sm leading-relaxed text-pretty">
                  {segment.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
