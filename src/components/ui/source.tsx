import type { SourceRef } from "@/types/contracts";
import { cn } from "@/lib/utils/cn";

export type SourceProps = {
  sources: SourceRef | readonly SourceRef[];
  /** ISO date (YYYY-MM-DD) the data was retrieved. */
  retrieved?: string;
  className?: string;
};

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-10-02" to "2 October 2026". Returns the input when it is not a date. */
export function formatRetrieved(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  return LONG_DATE.format(
    new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    ),
  );
}

const LINK =
  "underline decoration-current/40 underline-offset-[0.2em] transition-[text-decoration-color] duration-fast hover:decoration-current";

function One({ source }: { source: SourceRef }) {
  const name = source.title ? `${source.org}, ${source.title}` : source.org;
  const code = source.code ? ` (${source.code})` : "";
  return (
    <>
      {source.url ? (
        <a href={source.url} className={LINK} rel="noopener">
          {name}
        </a>
      ) : (
        name
      )}
      {code}
      {source.licence ? `, ${source.licence}` : null}
    </>
  );
}

/**
 * Source — the source line under every figure and numeral card (brief 2.6):
 * "Source: {org}, {title} ({code}), {licence}. Retrieved 2 October 2026."
 * 12px regular, sentence case, in the surface's muted ink.
 */
export function Source({ sources, retrieved, className }: SourceProps) {
  const list = Array.isArray(sources)
    ? (sources as readonly SourceRef[])
    : [sources as SourceRef];
  return (
    <p className={cn("source-line text-ink-muted text-pretty", className)}>
      {list.length > 1 ? "Sources: " : "Source: "}
      {list.map((source, i) => (
        <span key={`${source.org}-${i}`}>
          {i > 0 ? "; " : null}
          <One source={source} />
        </span>
      ))}
      {"."}
      {retrieved ? ` Retrieved ${formatRetrieved(retrieved)}.` : null}
    </p>
  );
}
