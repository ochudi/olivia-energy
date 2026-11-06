import type { CSSProperties, ReactNode } from "react";
import type { SourceRef } from "@/types/contracts";
import { FigTag } from "@/components/ui/fig-tag";
import { Source } from "@/components/ui/source";
import { MICROCOPY } from "@/content/site";
import { cn } from "@/lib/utils/cn";

export type FigureTable = {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
};

export type FigurePlateProps = {
  n: number;
  title: string;
  subtitle?: string;
  /** night: a night slab (sets its own surface). card: the card fill on paper. */
  surface?: "night" | "card";
  /** "Figure, October 2026": the figure's date, top right, as a line of text. */
  dateChip?: string;
  /** One or two sentences under the chart. */
  interpretation?: string;
  sources: SourceRef[];
  retrieved: string;
  /** "View as table": rendered in a <details>. */
  table?: FigureTable;
  /** "Get the data (CSV)": /data/<series>.csv. */
  dataHref?: string;
  className?: string;
  children: ReactNode;
};

/* Cell and row styles live on the table, so a long table stays light. */
const TABLE = cn(
  "numerals text-ink w-full border-collapse text-sm font-normal",
  "[&_:is(th,td)]:px-3 [&_:is(th,td)]:py-1.5 [&_:is(th,td)]:text-left [&_:is(th,td)]:align-top",
  "[&_:is(th,td):first-child]:pl-0 [&_:is(th,td):last-child]:pr-0",
  "[&_tr]:border-line [&_tr]:border-b [&_tbody_th]:font-normal",
);

/**
 * FigurePlate — the plate every chart sits on (creative brief 2.6): "Fig. n"
 * and the title as one caption line, an optional subtitle, the chart, the
 * interpretation, the source line, then "View as table" and "Get the data
 * (CSV)". A chart is an instrument, so the plate's corners are square
 * (DESIGN.md, Shapes). Night plates declare their own surface so the chart
 * variables follow.
 */
export function FigurePlate({
  n,
  title,
  subtitle,
  surface = "night",
  dateChip,
  interpretation,
  sources,
  retrieved,
  table,
  dataHref,
  className,
  children,
}: FigurePlateProps) {
  return (
    <figure
      data-surface={surface === "night" ? "night" : undefined}
      // On a card the canvas inside the plate is the card colour, so label
      // backdrops and end markers match the plate.
      style={
        surface === "card"
          ? ({ "--color-canvas": "var(--color-surface)" } as CSSProperties)
          : undefined
      }
      className={cn(
        "text-ink relative isolate flex flex-col gap-5 rounded-xs p-5 sm:p-6 lg:p-8",
        surface === "night" ? "bg-canvas" : "bg-surface border-line border",
        className,
      )}
    >
      <figcaption className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <FigTag n={n} />
          <p className="font-display text-display-xs text-ink text-balance">
            {title}
          </p>
          {dateChip ? (
            <p className="text-ink-muted numerals text-xs sm:ml-auto">
              {dateChip}
            </p>
          ) : null}
        </div>
        {subtitle ? <p className="text-ink-muted text-sm">{subtitle}</p> : null}
      </figcaption>

      {children}

      {interpretation ? (
        <p className="text-ink max-w-[68ch] text-sm text-pretty">
          {interpretation}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Source sources={sources} retrieved={retrieved} />
        {table || dataHref ? (
          <div className="text-ink-muted flex flex-wrap items-start gap-x-5 gap-y-2 text-xs font-medium">
            {table ? (
              <details className="group min-w-0 grow">
                <summary className="hover:text-ink tap inline-flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-open:rotate-90"
                  >
                    ›
                  </span>
                  {MICROCOPY.viewTable}
                </summary>
                <div className="mt-3 max-h-80 overflow-auto">
                  <table className={TABLE}>
                    <caption className="sr-only">{table.caption}</caption>
                    <thead>
                      <tr className="label text-ink-muted">
                        {table.columns.map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) =>
                            j === 0 ? (
                              <th key={j} scope="row">
                                {cell}
                              </th>
                            ) : (
                              <td key={j}>{cell}</td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}
            {dataHref ? (
              <a
                href={dataHref}
                download
                className="hover:text-ink tap inline-block underline decoration-current/40 underline-offset-[0.2em]"
              >
                {MICROCOPY.getData}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </figure>
  );
}
