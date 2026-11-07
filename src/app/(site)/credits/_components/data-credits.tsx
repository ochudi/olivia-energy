import { formatRetrieved } from "@/components/ui/source";
import { DATA_CREDITS } from "@/content/credits";
import { MICROCOPY } from "@/content/site";
import { dataHref } from "@/lib/figures/table";
import { LINK } from "./credit-row";

/**
 * Data: each series file and each document behind a
 * verified figure, with its publisher, licence where one applies, the
 * retrieval date and, for series, the CSV the charts are drawn from.
 */
export function DataCredits() {
  return (
    <ul className="border-line border-t">
      {DATA_CREDITS.map((credit) => {
        const { source } = credit;
        const key = credit.kind === "series" ? credit.id : credit.facts[0];
        return (
          <li
            key={`${credit.kind}-${key}`}
            className="border-line grid grid-cols-1 gap-y-2 border-b py-5"
          >
            <p className="font-display text-display-xs text-ink">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  {source.title ?? source.org}
                  <span className="sr-only">{MICROCOPY.newTab}</span>
                </a>
              ) : (
                (source.title ?? source.org)
              )}
            </p>
            <p className="text-ink-muted text-sm text-pretty">
              {[
                source.title ? source.org : null,
                source.licence,
                `Retrieved ${formatRetrieved(credit.retrieved)}`,
              ]
                .filter(Boolean)
                .join(". ")}
              .
              {credit.kind === "series" ? (
                <>
                  {" "}
                  <a href={dataHref(credit.id)} download className={LINK}>
                    {MICROCOPY.getData}
                  </a>
                </>
              ) : null}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
