import type { Counts, Mention } from "@/types/contracts";
import { Chip } from "@/components/ui/chip";
import { Display } from "@/components/ui/display";
import { INSIGHTS_PAGE } from "@/content/insights";
import { MICROCOPY } from "@/content/site";
import { formatDateShort } from "@/lib/content/format";

/** BusinessDay files its Pro desk under /pro/ (the outlet's own label). */
function isPro(mention: Mention): boolean {
  return /^https:\/\/businessday\.ng\/pro\//.test(mention.url);
}

/** Columns of the list from 768 px. */
const COLUMNS = 2;

const LINK =
  "tap text-ink hover:text-primary duration-fast ease-standard decoration-line-strong underline decoration-1 underline-offset-[0.22em] transition-colors hover:decoration-current";

/**
 * Quoted in BusinessDay, under the cover
 * wall: every BusinessDay report that quotes Dr Olaoye, newest first, as a
 * two-column list at 1440 (one column on phones); the syndicated copy is
 * not a row of its own but the footnote's link.
 */
export function QuotedIn({
  mentions,
  counts,
}: {
  mentions: readonly Mention[];
  counts: Counts;
}) {
  const copy = INSIGHTS_PAGE.quoted;
  const reports = mentions.filter((m) => !m.syndication);
  const syndicated = mentions.find((m) => m.syndication);
  const [before, after] = copy.footnote.split(copy.footnoteLink);

  return (
    <section
      aria-labelledby="quoted-title"
      className="border-line mt-20 grid grid-cols-1 gap-y-10 border-t pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-x-6 lg:pt-16"
    >
      <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:col-span-4 lg:self-start">
        <Display as="h3" size="md" id="quoted-title">
          {copy.title}
        </Display>
        <p className="text-ink-muted mt-5 max-w-[34ch] text-lg text-pretty">
          {copy.lede(counts)}
        </p>
      </div>

      <div className="lg:col-span-8">
        {/* Two columns read down, newest first; rows line up across them. */}
        <ol
          className="md:grid md:grid-flow-col md:gap-x-10"
          style={{
            gridTemplateRows: `repeat(${Math.ceil(reports.length / COLUMNS)}, auto)`,
          }}
        >
          {reports.map((mention) => (
            <li key={mention.url} className="border-line border-t py-5">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <time
                  dateTime={mention.publishedOn}
                  className="text-ink-muted numerals text-sm"
                >
                  {formatDateShort(mention.publishedOn)}
                </time>
                {isPro(mention) ? <Chip>{copy.proChip}</Chip> : null}
              </p>
              <a
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${LINK} mt-2 block text-base text-pretty`}
              >
                {mention.title}
                <span className="sr-only">{MICROCOPY.newTab}</span>
              </a>
            </li>
          ))}
        </ol>
        {syndicated && after !== undefined ? (
          <p className="text-ink-muted mt-8 text-sm">
            {before}
            <a
              href={syndicated.url}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              {copy.footnoteLink}
              <span className="sr-only">{MICROCOPY.newTab}</span>
            </a>
            {after}
          </p>
        ) : null}
      </div>
    </section>
  );
}
