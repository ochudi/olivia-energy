import type { Counts, OpEd } from "@/types/contracts";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { RESEARCH_PAGE } from "@/content/publications";
import { MICROCOPY } from "@/content/site";
import { formatDateShort } from "@/lib/content/format";

const copy = RESEARCH_PAGE.commentary;

/**
 * Commentary (section 3): paper. The heading block sits
 * in cols 1 to 4 (sticky beside the list from 1024 px); the op-eds run as dated rows in cols 5 to
 * 12, newest first: short date, the title as an external link, topic chips.
 * Then the link to the covers on Insights.
 */
export function CommentaryList({
  opeds,
  counts,
}: {
  opeds: readonly OpEd[];
  counts: Counts;
}) {
  if (opeds.length === 0) return null;
  return (
    <Section
      surface="paper"
      id="commentary"
      aria-labelledby="commentary-title"
      className="scroll-mt-header"
    >
      <Container>
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:col-span-4 lg:self-start">
            <Display as="h2" size="lg" id="commentary-title">
              {copy.title}
            </Display>
            <Lede className="mt-6">{copy.lede(counts)}</Lede>
            <Button href={copy.link.href} variant="text" className="mt-8">
              {copy.link.label}
            </Button>
          </div>

          <ol className="border-line border-t lg:col-span-8">
            {opeds.map((o) => (
              <li
                key={o.slug}
                className="border-line grid grid-cols-1 gap-x-6 gap-y-3 border-b py-6 sm:grid-cols-[7.5rem_1fr] md:py-7"
              >
                <p className="text-ink-muted numerals pt-1.5 text-sm">
                  <time dateTime={o.publishedOn}>
                    {formatDateShort(o.publishedOn)}
                  </time>
                </p>
                <div>
                  <h3 className="font-display text-display-xs text-ink">
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="decoration-primary/0 hover:decoration-primary focus-visible:ring-focus focus-visible:ring-offset-canvas underline decoration-2 underline-offset-[0.18em] transition-[text-decoration-color] duration-200 focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {o.title}
                      <span className="sr-only">{MICROCOPY.newTab}</span>
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        focusable="false"
                        className="text-primary ml-2 inline-block size-[0.6em] align-[0.05em]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 11 11 5M6 5h5v5" />
                      </svg>
                    </a>
                  </h3>
                  {o.topics.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {o.topics.map((t) => (
                        <Chip key={t} as="li" className="text-ink-muted">
                          {t}
                        </Chip>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
