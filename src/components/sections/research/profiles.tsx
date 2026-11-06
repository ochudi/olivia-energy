import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Section } from "@/components/ui/section";
import { FOUNDER } from "@/content/about";
import { RESEARCH_PAGE } from "@/content/publications";

const copy = RESEARCH_PAGE.profiles;

/**
 * Profiles (creative brief 4.6, section 4): paper, one sentence above a row
 * of pills (ORCID, Google Scholar) and the membership line. The Scholar URL
 * comes from settings and falls back to the founder's record in content.
 */
export function Profiles({ scholarUrl }: { scholarUrl?: string }) {
  const [orcid, scholar] = copy.pills;
  const pills = [
    { label: orcid, href: FOUNDER.links.orcid },
    { label: scholar, href: scholarUrl || FOUNDER.links.scholar },
  ];
  return (
    <Section
      surface="paper"
      id="profiles"
      spacing="none"
      aria-labelledby="profiles-title"
      className="pb-section"
    >
      <Container>
        <div className="border-line grid grid-cols-1 gap-y-8 border-t pt-12 lg:grid-cols-12 lg:gap-x-6 lg:pt-16">
          <Display
            as="h2"
            size="md"
            id="profiles-title"
            className="lg:col-span-4"
          >
            {copy.title}
          </Display>
          <div className="lg:col-span-8">
            <p className="text-ink max-w-[42ch] text-xl text-pretty">
              {copy.sentence}
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {pills.map((p) => (
                <li key={p.label}>
                  <Button href={p.href} variant="secondary" external>
                    {p.label}
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-8 flex items-start gap-3 text-sm">
              <FlameBullet className="text-primary mt-[0.2em] h-[1.1em] shrink-0" />
              {copy.membership}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
