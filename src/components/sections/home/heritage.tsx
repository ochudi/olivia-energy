import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { HERITAGE } from "@/content/home";
import { PHOTOS } from "@/content/images";
import { cn } from "@/lib/utils/cn";
import { PhotoFigure } from "../photo-figure";

/**
 * Heritage — opens on a photograph of a Lagos tank farm, then the narrative
 * on the left and a restrained timeline on the right. The present-day
 * marker is the page's single use of the accent.
 */
export function Heritage() {
  return (
    <section id="heritage" className="border-line py-section border-t">
      <Container>
        <PhotoFigure
          photo={PHOTOS.homeStory}
          frameClassName="aspect-[3/2] lg:aspect-[21/9]"
          sizes="(min-width: 76rem) 1136px, calc(100vw - 40px)"
        />
        <div className="mt-section-sm grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionHeading
                number="02"
                eyebrow={HERITAGE.eyebrow}
                title={HERITAGE.title}
              />
            </Reveal>
            <div className="text-ink-muted max-w-text mt-8 space-y-5 text-base leading-relaxed text-pretty">
              {HERITAGE.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <Button
              href={HERITAGE.link.href}
              variant="ghost"
              icon={<ArrowRight />}
              className="mt-8"
            >
              {HERITAGE.link.label}
            </Button>
          </div>

          <ol className="border-line border-l lg:col-span-5 lg:col-start-8 lg:mt-2">
            {HERITAGE.timeline.map((entry) => {
              const current = "current" in entry && entry.current;
              return (
                <li
                  key={entry.period}
                  className="relative pb-10 pl-8 last:pb-0"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-[0.4rem] left-[-3.5px] size-1.5 rounded-full",
                      current ? "bg-accent" : "bg-primary",
                    )}
                  />
                  <span className="text-ink-muted font-mono text-xs tabular-nums">
                    {entry.period}
                  </span>
                  <p className="font-display text-display-xs mt-2 font-normal">
                    {entry.label}
                  </p>
                  <p className="text-ink-muted mt-1 max-w-[36ch] text-sm leading-relaxed">
                    {entry.detail}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
