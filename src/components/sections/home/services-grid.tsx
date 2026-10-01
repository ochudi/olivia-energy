import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SERVICES_INDEX } from "@/content/home";
import { SERVICES } from "@/content/site";

/**
 * Services as a numbered index: one hairline row per service line, each
 * row a single link to its anchor on /what-we-do. No boxes and no icons;
 * the numeral, the serif title and the rule carry the structure.
 */
export function ServicesGrid() {
  return (
    <section id="services" className="py-section">
      <Container>
        <Reveal>
          <SectionHeading
            number="01"
            eyebrow={SERVICES_INDEX.eyebrow}
            title={SERVICES_INDEX.title}
          />
        </Reveal>
        <ol className="border-line mt-12 border-b">
          {SERVICES.map((service, index) => (
            <li key={service.slug}>
              <Link
                href={`/what-we-do#${service.slug}`}
                className="group border-line hover:border-ink duration-fast ease-standard grid grid-cols-[2.25rem_1fr_1.25rem] items-baseline gap-x-4 gap-y-2 border-t py-6 transition-[border-color] md:grid-cols-[3rem_1fr_1fr_1.5rem] md:gap-x-8"
              >
                <span className="text-ink-muted font-mono text-xs tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-display-xs text-ink group-hover:text-primary group-active:text-primary-hover duration-fast ease-standard font-normal transition-colors">
                  {service.title}
                </h3>
                <p className="text-ink-muted col-start-2 row-start-2 text-sm leading-relaxed text-pretty md:col-start-3 md:row-start-1">
                  {service.summary}
                </p>
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="text-ink-muted group-hover:text-primary group-active:text-primary-hover duration-fast ease-standard col-start-3 row-start-1 size-4 self-center justify-self-end transition-[color,transform] group-hover:translate-x-0.5 md:col-start-4"
                />
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
