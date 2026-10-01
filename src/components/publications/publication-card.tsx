import { Card } from "@/components/ui/card";
import { PUBLICATIONS } from "@/content/publications";
import type { Publication } from "@/lib/supabase/types";
import { OutboundLink, readLabel } from "./outbound-link";

export type PublicationCardProps = {
  publication: Publication;
  /** Heading level for the title; h3 inside a titled section. */
  headingLevel?: "h2" | "h3";
  /** Citation count from OpenAlex; shown when known and above zero. */
  citations?: number;
};

/**
 * Featured paper: venue and year, serif title, authors, one-line summary,
 * then the outbound link with the citation count opposite it. One link per
 * card, so the surface stays quiet.
 */
export function PublicationCard({
  publication,
  headingLevel = "h3",
  citations,
}: PublicationCardProps) {
  const Heading = headingLevel;
  const { title, authors, venue, year, url, summary } = publication;
  return (
    <Card as="article" padding="md" className="flex h-full flex-col">
      <p className="text-ink-muted flex items-baseline justify-between gap-4 text-xs">
        <span className="min-w-0 truncate">{venue ?? " "}</span>
        {year ? (
          <span className="shrink-0 font-mono tabular-nums">{year}</span>
        ) : null}
      </p>
      <Heading className="font-display text-display-xs mt-5 font-normal text-balance">
        {title}
      </Heading>
      {authors.length ? (
        <p className="text-ink-muted mt-3 text-sm">{authors.join(", ")}</p>
      ) : null}
      {summary ? (
        <p className="text-ink mt-4 text-sm leading-relaxed text-pretty">
          {summary}
        </p>
      ) : null}
      {url || citations ? (
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-6">
          {url ? (
            <OutboundLink href={url}>{readLabel(url)}</OutboundLink>
          ) : (
            <span />
          )}
          {citations ? (
            <span className="text-ink-muted font-mono text-xs tabular-nums">
              {PUBLICATIONS.cited(citations)}
            </span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
