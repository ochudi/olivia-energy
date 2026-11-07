import Link from "next/link";
import type { InsightFormat } from "@/types/contracts";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { FORMATS } from "@/content/brand";
import { cn } from "@/lib/utils/cn";
import { getCommentaryCounts, getFormatCounts } from "@/lib/supabase/queries";

type Status = { label: string; href: string };

/**
 * What a tile says at its foot. Executive commentaries count the op-eds in
 * BusinessDay and research papers the journal articles (each with its
 * link); every format adds the Insights posts filed under it. A format
 * with nothing yet says so plainly.
 */
function statusesFor(
  id: InsightFormat,
  posts: number,
  counts: { opeds: number; articles: number },
): Status[] {
  const out: Status[] = [];
  if (id === "executive-commentary" && counts.opeds > 0) {
    out.push({
      label: FORMATS.status.commentary(counts.opeds),
      href: "#businessday",
    });
  }
  if (id === "research-paper" && counts.articles > 0) {
    out.push({
      label: FORMATS.status.papers(counts.articles),
      href: "/research",
    });
  }
  if (posts > 0) {
    out.push({ label: FORMATS.status.published(posts), href: "#articles" });
  }
  return out;
}

/**
 * "What we publish": the eight formats of
 * Olivia Energy Insights as a 4 x 2 grid of square-cornered tiles
 * (instruments, DESIGN.md Shapes; not a sequence, so not numbered). A
 * format in print has a flood-green edge, the flame and a link to its
 * work; the others carry their honest empty label. Static.
 */
export async function WhatWePublish() {
  const [formatCounts, counts] = await Promise.all([
    getFormatCounts(),
    getCommentaryCounts(),
  ]);
  return (
    <Section surface="paper" id="formats" aria-labelledby="formats-title">
      <Container>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <div className="lg:col-span-7">
            <Display as="h2" size="lg" id="formats-title">
              {FORMATS.title}
            </Display>
          </div>
          <Lede className="lg:col-span-5 lg:pb-2">{FORMATS.lede}</Lede>
        </div>

        {/* Columns follow the list's own width (container queries), so a
            near-square screen such as a foldable's inner display gets two
            columns rather than a stretched phone stack. */}
        <div className="@container">
          <ul className="mt-12 grid grid-cols-1 gap-4 lg:mt-16 @xl:grid-cols-2 @4xl:grid-cols-4 @4xl:gap-6">
            {FORMATS.items.map((item) => {
              const statuses = statusesFor(
                item.id,
                formatCounts[item.id] ?? 0,
                counts,
              );
              const live = statuses.length > 0;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "bg-surface flex flex-col rounded-xs border p-5 md:min-h-[13.75rem] md:p-6",
                    live ? "border-primary" : "border-line",
                  )}
                >
                  <h3 className="font-display text-display-xs text-ink font-normal text-balance">
                    {item.name}
                  </h3>
                  <p className="text-ink-muted mt-3 text-sm text-pretty">
                    {item.description}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-5 md:pt-6">
                    {live ? (
                      statuses.map((status) => (
                        <Link
                          key={status.href}
                          href={status.href}
                          className="text-primary hit-area tap duration-fast ease-standard group/status hover:text-ink inline-flex items-center gap-2 self-start text-sm font-medium transition-colors"
                        >
                          <FlameBullet className="h-[1.1em]" />
                          <span className="link-underline numerals">
                            {status.label}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-ink-muted inline-flex items-center gap-2 text-sm">
                        <span
                          aria-hidden
                          className="bg-line-strong h-px w-4 shrink-0"
                        />
                        {item.emptyLabel}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
