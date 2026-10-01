import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { PHILOSOPHY } from "@/content/about";

/**
 * Philosophy — three lines set large in the serif italic on the inverse
 * surface. The italic face loads only on pages that use it.
 */
export function Philosophy() {
  return (
    <section
      id="philosophy"
      data-tone="inverse"
      className="bg-inverse text-ink py-section-lg"
    >
      <Container>
        <Reveal>
          <Eyebrow>{PHILOSOPHY.eyebrow}</Eyebrow>
        </Reveal>
        <div className="max-w-narrow mt-10 space-y-3 md:mt-12">
          {PHILOSOPHY.lines.map((line) => (
            <p
              key={line}
              className="font-display-italic text-display-md md:text-display-lg text-ink font-normal tracking-tight italic"
            >
              {line}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}
