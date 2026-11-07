import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Section } from "@/components/ui/section";
import { DIFFERENTIATORS_BLOCK } from "@/content/brand";

/**
 * What we do, section 9: what makes us different, on
 * a green flood. The H2 in columns 1 to 5; six statements in display-xs in
 * columns 6 to 12, each after the mark's flame, divided by the green
 * surface's line. Not a sequence, so not numbered; static. Stacked on
 * phones.
 */
export function Differentiators() {
  const b = DIFFERENTIATORS_BLOCK;
  return (
    <Section surface="green" id="different" aria-labelledby="different-title">
      <Container>
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-5">
            <Display
              as="h2"
              size="lg"
              id="different-title"
              className="max-w-[13ch]"
            >
              {b.title}
            </Display>
          </div>
          <ul className="border-line border-b lg:col-span-7 lg:col-start-6">
            {b.items.map((item) => (
              <li
                key={item}
                className="border-line flex items-start gap-4 border-t py-6 lg:py-7"
              >
                <FlameBullet className="text-primary mt-[0.3em] h-[1em] shrink-0" />
                <p className="font-display text-display-xs text-ink text-balance">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
