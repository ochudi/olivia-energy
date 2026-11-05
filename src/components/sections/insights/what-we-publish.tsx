import Link from "next/link";
import type { InsightFormat } from "@/types/contracts";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Lede } from "@/components/ui/lede";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { FORMATS } from "@/content/brand";
import { cn } from "@/lib/utils/cn";
import { getCommentaryCounts, getFormatCounts } from "@/lib/supabase/queries";

const STAGGER = 90;

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
 * "What we publish" (creative brief 4.4 section 2): the eight formats of
 * Olivia Energy Insights as a 4 x 2 grid of tiles. A format in print has a
 * flood-green edge, the flame and a link to its work; the others carry
 * their honest empty label.
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
            <Eyebrow>{FORMATS.eyebrow}</Eyebrow>
            <Display
              as="h2"
              size="lg"
              reveal="mask"
              id="formats-title"
              className="mt-6"
            >
              {FORMATS.title}
            </Display>
          </div>
          <Lede className="lg:col-span-5 lg:pb-2">{FORMATS.lede}</Lede>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {FORMATS.items.map((item, i) => {
            const statuses = statusesFor(
              item.id,
              formatCounts[item.id] ?? 0,
              counts,
            );
            const live = statuses.length > 0;
            return (
              <Reveal
                key={item.id}
                as="li"
                delay={(i % 4) * STAGGER}
                className={cn(
                  "shoulder-sm bg-surface flex flex-col border p-5 md:min-h-[13.75rem] md:p-6",
                  live ? "border-primary" : "border-line",
                )}
              >
                <p
                  aria-hidden
                  className={cn(
                    "label numerals",
                    live ? "text-primary" : "text-ink-muted",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display text-display-xs text-ink mt-4 font-normal text-balance">
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
                        className="label text-primary hit-area duration-fast ease-standard group/status hover:text-ink inline-flex items-center gap-2 self-start transition-colors"
                      >
                        <FlameBullet className="h-[1.3em]" />
                        <span className="link-underline numerals">
                          {status.label}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="label text-ink-muted inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="bg-line-strong h-px w-4 shrink-0"
                      />
                      {item.emptyLabel}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
