import { Container } from "@/components/ui/container";
import { SERVICES } from "@/content/site";
import { SERVICE_LINES } from "@/content/what-we-do";
import { ServiceNav } from "./service-nav";

/**
 * Six service-line sections with a sticky in-page nav on desktop. Names
 * and order come from content/site (shared with the home index and the
 * footer); descriptions and bullets from content/what-we-do.
 */
export function ServiceLines() {
  const lines = SERVICES.map((service) => {
    const line = SERVICE_LINES.find((entry) => entry.slug === service.slug);
    if (!line) throw new Error(`No service-line copy for "${service.slug}"`);
    return { ...service, ...line };
  });

  return (
    <section id="service-lines" className="py-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3 lg:pt-12">
            <ServiceNav
              items={lines}
              className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]"
            />
          </div>
          <ol className="lg:col-span-8 lg:col-start-5">
            {lines.map((line, index) => (
              <li
                key={line.slug}
                id={line.slug}
                className="scroll-mt-header border-line border-t py-12 last:pb-0"
              >
                <span className="text-ink-muted font-mono text-xs tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-display-sm mt-5 font-normal tracking-tight">
                  {line.title}
                </h2>
                <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
                  <p className="text-ink-muted max-w-text text-base leading-relaxed text-pretty">
                    {line.description}
                  </p>
                  <ul className="border-line divide-line divide-y border-t">
                    {line.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="text-ink flex gap-3 py-3 text-sm leading-relaxed"
                      >
                        <span
                          aria-hidden
                          className="bg-primary mt-[0.75em] h-px w-3 shrink-0"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
