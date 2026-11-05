import { NumeralFigure } from "@/components/figures";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ShoulderImage } from "@/components/ui/shoulder-image";
import { cn } from "@/lib/utils/cn";
import {
  CHAPTER_SCROLL_MARGIN,
  ChapterHead,
  ChapterList,
  ChapterText,
  UNDER_BAR_TOP,
  chapterTitleId,
  type Chapter,
} from "./chapter-parts";

/* Photograph and text columns at 1024 px and up (creative brief 4.2). */
const COLUMNS = {
  left: {
    photo: "lg:col-span-5 lg:col-start-1",
    text: "lg:col-span-6 lg:col-start-7",
  },
  right: {
    photo: "lg:col-span-5 lg:col-start-8",
    text: "lg:col-span-6 lg:col-start-1",
  },
} as const;

/**
 * One service chapter (01, 03 to 06): the 4:5 photograph with its caption
 * in five columns, held under the chapter bar while the text column
 * scrolls past it; the label, glyph and title, the lede and body, the five
 * services and the numeral card in six columns on the other side. On
 * phones the order is label, glyph and title, photograph, lede, body,
 * list, card.
 */
export function ChapterSection({ chapter }: { chapter: Chapter }) {
  const cols = COLUMNS[chapter.photoSide];
  const card = chapter.card;
  return (
    <Section
      surface={chapter.surface}
      id={chapter.slug}
      aria-labelledby={chapterTitleId(chapter.slug)}
      className={CHAPTER_SCROLL_MARGIN}
    >
      <Container>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:gap-y-12">
          <ChapterHead
            chapter={chapter}
            className={cn(cols.text, "lg:row-start-1")}
          />

          <div className={cn(cols.photo, "lg:row-span-2 lg:row-start-1")}>
            <ShoulderImage
              photo={chapter.photo}
              ratio="4/5"
              // On 3x phones the file is chosen as for 2x (the 2/3 factor) and
              // set at quality 60, so the busiest photograph (Lagos market)
              // stays under the 120 KB phone budget (Q1, 3 October 2026).
              sizes="(min-width: 1440px) 520px, (min-width: 1024px) 37vw, (min-resolution: 2.5dppx) calc((100vw - 2.5rem) * 2 / 3), calc(100vw - 2.5rem)"
              quality={60}
              reveal="wipe"
              caption="below"
              className={cn("lg:sticky", UNDER_BAR_TOP)}
            />
          </div>

          <div className={cn(cols.text, "flex flex-col lg:row-start-2")}>
            <ChapterText chapter={chapter} />
            <ChapterList chapter={chapter} className="mt-10" />
            {card ? (
              <NumeralFigure
                numeral={card.numeral}
                decimals={card.decimals}
                suffix={card.suffix}
                unit={card.unit}
                tag={card.tag}
                caption={card.caption}
                glyph={card.glyph}
                source={card.source}
                retrieved={card.retrieved}
                size="card"
                // Chapter 06: the debt-service share is the hatched part.
                shareHatch={card.glyph?.kind === "share" ? "value" : undefined}
                className="mt-12"
              />
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
