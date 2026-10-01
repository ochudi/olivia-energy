import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { SectionHeading } from "@/components/ui/section-heading";
import { PRIVACY } from "@/content/legal";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = pageMetadata({
  ...PRIVACY.metadata,
  path: "/privacy",
});

/** Privacy notice: one heading, the date, and the sections from content/legal. */
export default function Page() {
  return (
    <section className="py-section">
      <Container>
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow={PRIVACY.eyebrow}
          title={PRIVACY.title}
          lede={PRIVACY.lede}
        />
        <p className="text-ink-muted mt-6 text-sm">
          Last updated {PRIVACY.updated}
        </p>
        <Prose className="max-w-text mt-12">
          {PRIVACY.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </Prose>
      </Container>
    </section>
  );
}
