import Image from "next/image";
import { FigurePlate, Waffle, WaffleKey } from "@/components/figures";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ShoulderImage } from "@/components/ui/shoulder-image";
import { PHOTOS } from "@/content/images";
import { INSTALLED_FIGURE } from "@/content/what-we-do";
import { cn } from "@/lib/utils/cn";
import {
  CHAPTER_SCROLL_MARGIN,
  ChapterHead,
  ChapterList,
  ChapterText,
  chapterTitleId,
  type Chapter,
} from "./chapter-parts";
import styles from "./chapter-installed.module.css";

const F = INSTALLED_FIGURE;

/** The waffle's accessible name: the three headings and the unit. */
const WAFFLE_LABEL = `${F.steps.map((s) => s.heading).join(". ")}. ${F.legend.unit}.`;

/**
 * Fig. 2, "Installed is not delivered": 136 squares of 100 MW on a night
 * plate, over the Lekki-Ikoyi bridge at the plate's foot. The Waffle is
 * drawn in its final state (41 lit, 4 hatched, the rest outlined); the
 * pinned scene's step timelines light and darken it (the module CSS).
 */
function InstalledPlate() {
  const photo = PHOTOS[F.photo];
  return (
    <FigurePlate
      n={F.n}
      title={F.title}
      surface="night"
      sources={F.sources}
      retrieved={F.retrieved}
      className={styles.plate}
    >
      <div className="flex flex-col gap-1.5">
        <WaffleKey {...F.legend} />
        <p className="text-ink-muted text-xs">{F.note}</p>
      </div>
      <div className={cn(styles.stage, "px-3 pt-3 pb-2.5 sm:px-4 sm:pt-4")}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1440px) 572px, (min-width: 1024px) 42vw, calc(100vw - 5rem)"
          quality={60}
          className={cn(styles.photo, "object-cover")}
          style={{ objectPosition: "70% 60%" }}
        />
        <Waffle {...F.squares} ariaLabel={WAFFLE_LABEL} />
        <p className="text-ink-muted mt-6 text-right text-xs sm:mt-10">
          {F.photoCaption}
        </p>
      </div>
    </FigurePlate>
  );
}

/**
 * Chapter two, Energy Economics & Policy, on the deep field with Fig. 2 as
 * its night plate: the page's signature moment (DESIGN.md, Layout). The head, lede, body and list open the
 * chapter across the grid; below them the City Gate photograph and the
 * three steps run in columns 1 to 5 while Fig. 2 holds in columns 7 to 12
 * under the chapter bar, stepping from installed to available to
 * delivered as the reader scrolls (pure CSS, behind the module's gate).
 * On phones the plate follows the three step texts, static in its final
 * state, with its legend. The three steps are numbered: they are a
 * sequence through the grid.
 */
export function ChapterInstalled({ chapter }: { chapter: Chapter }) {
  return (
    <Section
      surface={chapter.surface}
      id={chapter.slug}
      aria-labelledby={chapterTitleId(chapter.slug)}
      className={CHAPTER_SCROLL_MARGIN}
    >
      <Container>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-6">
          <ChapterHead chapter={chapter} className="lg:col-span-6" />
          <div className="flex flex-col lg:col-span-6 lg:col-start-7 lg:justify-end">
            <ChapterText chapter={chapter} />
          </div>
          <ChapterList
            chapter={chapter}
            className="lg:col-span-12 lg:grid-cols-3 lg:gap-x-6"
          />
        </div>

        <div
          data-fold-split=""
          className={cn(
            styles.scene,
            "mt-16 grid gap-y-12 lg:mt-24 lg:grid-cols-12 lg:gap-x-6",
          )}
        >
          <div className="lg:col-span-5">
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
            />
            <ol className="mt-12 flex flex-col gap-10 lg:mt-16 lg:gap-0">
              {F.steps.map((step, i) => (
                <li
                  key={step.label}
                  data-scene-step={i + 1}
                  className={cn(styles.step, "pl-6")}
                >
                  <p className="text-ink-muted numerals font-sans text-sm font-medium">
                    {step.label}
                  </p>
                  <h3
                    className={cn(
                      styles.stepHeading,
                      "font-display text-display-sm text-ink numerals mt-3",
                    )}
                  >
                    {step.heading}
                  </h3>
                  <p className="text-ink-muted mt-4 max-w-[44ch] text-lg text-pretty">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div
            data-fold-sticky=""
            className="lg:col-span-6 lg:col-start-7 lg:row-start-1"
          >
            <InstalledPlate />
          </div>
        </div>
      </Container>
    </Section>
  );
}
