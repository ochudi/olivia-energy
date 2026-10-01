import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { INTRO } from "@/content/what-we-do";

/** Page title and the positioning statement as its lede. */
export function WhatWeDoIntro() {
  return (
    <section id="overview" className="border-line border-b">
      <Container className="py-section">
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow={INTRO.eyebrow}
          title={INTRO.title}
          lede={INTRO.positioning}
        />
      </Container>
    </section>
  );
}
