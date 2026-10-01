import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { REGISTRATIONS } from "@/content/about";

/**
 * Registrations — one hairline row per registration in content/about:
 * region, entity name, then the number in mono. Renders nothing if the
 * list is empty.
 */
export function Registrations() {
  if (REGISTRATIONS.length === 0) return null;
  return (
    <section id="registrations" className="border-line py-section border-t">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              number="04"
              eyebrow="Registrations"
              title="Company registration."
            />
          </Reveal>
          <dl className="border-line border-b lg:col-span-8">
            {REGISTRATIONS.map((item) => (
              <div
                key={item.region}
                className="border-line grid gap-2 border-t py-6 md:grid-cols-12 md:gap-8"
              >
                <dt className="tracking-caps text-ink-muted font-sans text-xs font-medium uppercase md:col-span-3 md:pt-2">
                  {item.region}
                </dt>
                <dd className="md:col-span-9">
                  <p className="font-display text-display-xs font-normal">
                    {item.label}
                  </p>
                  <p className="text-ink-muted mt-1 font-mono text-xs">
                    {item.detail}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
