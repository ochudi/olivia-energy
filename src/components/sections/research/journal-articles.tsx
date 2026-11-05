import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { RESEARCH_PAGE } from "@/content/publications";
import { cn } from "@/lib/utils/cn";
import type { Publication } from "@/lib/supabase/types";

const copy = RESEARCH_PAGE.articles;

/** Newest year first; within a year, the admin's order. */
function byYear(a: Publication, b: Publication): number {
  return (b.year ?? 0) - (a.year ?? 0) || a.sort - b.sort;
}

/**
 * Journal articles (creative brief 4.6, section 2): paper deep, a two-column
 * list of shouldered cards: journal as a label, year, title, authors, and
 * "Read the article" to the DOI. An odd count opens with the newest card
 * across both columns. One column on phones.
 */
export function JournalArticles({
  journals,
}: {
  journals: readonly Publication[];
}) {
  if (journals.length === 0) return null;
  const list = [...journals].sort(byYear);
  return (
    <Section
      surface="paper-deep"
      id="articles"
      aria-labelledby="articles-title"
      className="scroll-mt-header"
    >
      <Container>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Display
          as="h2"
          size="lg"
          id="articles-title"
          reveal="mask"
          className="mt-5"
        >
          {copy.title}
        </Display>

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:mt-16">
          {list.map((article, i) => {
            // An odd count opens with the newest article across both
            // columns, so the last row is never one card alone.
            const lead = i === 0 && list.length % 2 === 1;
            return (
              <Reveal
                as="li"
                key={article.id}
                delay={(lead ? 0 : (i - (list.length % 2)) % 2) * 90}
                className={cn("flex", lead && "md:col-span-2")}
              >
                <article
                  className={cn(
                    "shoulder bg-card border-line flex w-full flex-col border p-6 sm:p-8",
                    lead && "lg:p-10",
                  )}
                >
                  <p className="label text-ink-muted flex items-start justify-between gap-6">
                    <span className="min-w-0">{article.venue}</span>
                    {article.year ? (
                      <span className="numerals text-ink shrink-0">
                        {article.year}
                      </span>
                    ) : null}
                  </p>
                  <h3
                    className={cn(
                      "font-display text-display-xs text-ink mt-6 max-w-[34ch] text-balance",
                      lead && "md:text-display-sm md:max-w-[40ch]",
                    )}
                  >
                    {article.title}
                  </h3>
                  {article.authors.length ? (
                    <p className="text-ink-muted mt-3 text-sm">
                      {article.authors.join(", ")}
                    </p>
                  ) : null}
                  {article.url ? (
                    <div className="mt-auto pt-8">
                      <Button
                        href={article.url}
                        variant="text"
                        arrow
                        external
                        aria-label={copy.linkAriaLabel(article.title)}
                      >
                        {copy.linkLabel}
                      </Button>
                    </div>
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
