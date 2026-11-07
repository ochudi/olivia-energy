import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { NOT_FOUND } from "@/content/errors";

/**
 * NotFoundSection — the 404 body: a green flood at
 * least 80svh tall, the ring of the mark left open (a quarter gap, white,
 * 160 px), then the status line, H1, lede and the links as pills. Shared by the
 * root not-found.tsx (unknown top-level URLs) and the (site) not-found.tsx,
 * so both render identically.
 */
export function NotFoundSection() {
  return (
    <Section
      surface="green"
      hero="dark"
      aria-labelledby="not-found-title"
      className="flex min-h-[80svh] items-center"
    >
      <Container className="w-full">
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-center lg:gap-x-6">
          {/* From lg the ring's centre sits on the H1's x-height row, not on
              the middle of the whole text column. */}
          <div className="text-ink lg:col-span-3 lg:mt-3 lg:self-start">
            <RingMark size={160} gap={0.25} />
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-ink numerals text-sm font-medium">
              {NOT_FOUND.code}
            </p>
            <Display as="h1" size="xl" id="not-found-title" className="mt-6">
              {NOT_FOUND.title}
            </Display>
            <p className="text-ink mt-8 max-w-[42ch] text-xl text-pretty">
              {NOT_FOUND.lede}
            </p>
            <ul className="mt-10 flex flex-wrap gap-3">
              {NOT_FOUND.links.map((link, i) => (
                <li key={link.href}>
                  <Button
                    href={link.href}
                    variant={i === 0 ? "primary" : "secondary"}
                  >
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
