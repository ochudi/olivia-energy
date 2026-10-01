import { PUBLICATIONS } from "@/content/publications";
import type { YearGroup } from "@/lib/publications/group";
import { doiOf } from "@/lib/research/doi";
import { cn } from "@/lib/utils/cn";
import { OutboundLink, readLabel } from "./outbound-link";

export type PublicationListProps = {
  groups: YearGroup[];
  /** Citation counts by lower-cased DOI, from OpenAlex. */
  citations?: ReadonlyMap<string, number>;
  className?: string;
};

/**
 * Every paper, grouped by year with the year set large in the margin. Each
 * entry carries one outbound link and, when OpenAlex knows it, its citation
 * count; entries without a URL are plain text.
 */
export function PublicationList({
  groups,
  citations,
  className,
}: PublicationListProps) {
  return (
    <div className={cn("border-line divide-line divide-y border-t", className)}>
      {groups.map(({ year, items }) => {
        const id = `year-${year ?? "undated"}`;
        return (
          <section
            key={id}
            aria-labelledby={id}
            className="grid gap-5 py-8 md:grid-cols-[7rem_1fr] md:gap-10 md:py-10"
          >
            <h3
              id={id}
              className="font-display text-display-sm text-ink leading-none font-normal tracking-tight tabular-nums md:sticky md:top-[calc(var(--spacing-header)+2.5rem)] md:self-start"
            >
              {year ?? PUBLICATIONS.undated}
            </h3>
            <ol className="divide-line divide-y">
              {items.map((publication) => {
                const doi = doiOf(publication.url);
                const cited = doi ? citations?.get(doi) : undefined;
                return (
                  <li
                    key={publication.id}
                    id={`publication-${publication.id}`}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <article className="grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-8">
                      <div className="min-w-0">
                        <h4 className="text-ink text-base leading-snug font-medium text-balance">
                          {publication.title}
                        </h4>
                        {publication.authors.length || publication.venue ? (
                          <p className="text-ink-muted mt-1.5 text-sm">
                            {publication.authors.join(", ")}
                            {publication.authors.length && publication.venue ? (
                              <span aria-hidden> · </span>
                            ) : null}
                            {publication.venue}
                          </p>
                        ) : null}
                        {publication.summary ? (
                          <p className="text-ink-muted max-w-text mt-2 text-sm leading-relaxed text-pretty">
                            {publication.summary}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-2 self-start sm:items-end sm:pt-0.5">
                        {publication.url ? (
                          <OutboundLink href={publication.url}>
                            {readLabel(publication.url)}
                          </OutboundLink>
                        ) : null}
                        {cited ? (
                          <span className="text-ink-muted font-mono text-xs tabular-nums">
                            {PUBLICATIONS.cited(cited)}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
