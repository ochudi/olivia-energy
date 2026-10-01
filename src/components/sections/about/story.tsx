import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { STORY } from "@/content/about";
import { PHOTOS } from "@/content/images";
import { cn } from "@/lib/utils/cn";
import { PhotoFigure } from "../photo-figure";

/**
 * Page title, then the brand story: a serif opening paragraph and two in
 * running text. On desktop the section eyebrow and a 4:5 photograph hold
 * the left third; on phones the photograph follows the text at 3:2.
 */
export function AboutStory() {
  return (
    <>
      <section id="overview" className="border-line border-b">
        <Container className="py-section">
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow={STORY.eyebrow}
            title={STORY.title}
            lede={STORY.lede}
          />
        </Container>
      </section>
      <section id="story" className="py-section">
        <Container>
          <div className="grid gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-8">
            <Reveal className="lg:col-span-4 lg:row-start-1">
              <Eyebrow as="h2" number="01">
                {STORY.sectionEyebrow}
              </Eyebrow>
            </Reveal>
            <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
              {STORY.paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={cn(
                    "text-pretty",
                    index > 0 && "mt-6",
                    index === 0
                      ? "font-display text-display-sm text-ink font-normal tracking-tight"
                      : "text-ink-muted max-w-text text-base leading-relaxed",
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <PhotoFigure
              photo={PHOTOS.aboutStory}
              frameClassName="aspect-[3/2] lg:aspect-[4/5]"
              sizes="(min-width: 64rem) 358px, calc(100vw - 40px)"
              className="lg:col-span-4 lg:col-start-1 lg:row-start-2"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
