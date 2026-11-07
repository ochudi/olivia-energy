import { IgnitionLazy } from "@/components/signature/ignition";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { ABOUT_HERO } from "@/content/about";
import { MARK_COLORS, MARK_PATHS, MARK_VIEWBOX } from "@/lib/brand/mark";
import { cn } from "@/lib/utils/cn";
import styles from "./hero.module.css";

/** Paint order of the full-colour mark: lime, red, ring. */
const PARTS = [
  { key: "lime", d: MARK_PATHS.lime, color: MARK_COLORS.lime },
  { key: "red", d: MARK_PATHS.red, color: MARK_COLORS.red },
  { key: "ring", d: MARK_PATHS.ring, color: MARK_COLORS.green },
] as const;

/**
 * The mark in its true colours (#04923F, #D5281B, #88C029, never the
 * flood green). Each part is its fill plus a construction outline on the
 * same path that the draw-in strokes before the fill arrives
 * (hero.module.css). Decorative: the H1 carries the meaning.
 */
function AboutMark() {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className={cn(styles.mark, "ignition-mark")}
    >
      {PARTS.map((part) => (
        <g key={part.key} className={styles[part.key]}>
          <path className={styles.fill} d={part.d} fill={part.color} />
          <path
            className={styles.outline}
            d={part.d}
            stroke={part.color}
            pathLength={1}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * About section 1, "Ignition" (creative brief 4.3; the page's signature
 * moment, DESIGN.md Layout): night, the header transparent over it. Copy in cols 1 to 7, the mark
 * (about 340 x 472) in cols 8 to 12, vertically centred; on phones the
 * mark (150 x 208) sits centred above the copy. On eligible desktops
 * Ignition's sparks converge into the mark; everywhere else the mark draws
 * itself. The H1 never animates (it is the LCP element).
 */
export function AboutHero() {
  return (
    <Section surface="night" hero="dark" aria-labelledby="about-title">
      <Container>
        <div
          data-fold-split=""
          className="grid grid-cols-1 gap-y-10 md:gap-y-14 lg:grid-cols-12 lg:items-center lg:gap-x-6"
        >
          <div
            data-fold-col="2"
            className="flex justify-center lg:order-2 lg:col-span-4 lg:col-start-9 xl:col-span-5 xl:col-start-8"
          >
            <div
              data-ignition-host
              className={cn(
                styles.host,
                "relative aspect-[72/100] w-[150px] md:w-[200px] lg:w-[min(340px,100%)]",
              )}
            >
              <AboutMark />
              <IgnitionLazy className="absolute inset-0" />
            </div>
          </div>
          <div
            data-fold-col="1"
            className="lg:order-1 lg:col-span-8 xl:col-span-7"
          >
            <Display
              as="h1"
              size="lg"
              headline
              id="about-title"
              // Below 368px the size steps down to 11vw so the sentence sets
              // in six lines or fewer, where text-balance still applies.
              // From 1024 to 1279 the sentence takes a wider measure (and
              // the mark one column less), so it sets in five lines rather
              // than seven: text-balance gives up beyond six lines and the
              // rag showed ("through" alone on a line at 1024).
              className="max-w-[15ch] max-[23rem]:text-[min(var(--text-display-lg),11vw)] lg:max-w-[18ch] xl:max-w-[15ch]"
            >
              {ABOUT_HERO.title}
            </Display>
            <Lede className="mt-8 md:mt-10">{ABOUT_HERO.lede}</Lede>
          </div>
        </div>
      </Container>
    </Section>
  );
}
