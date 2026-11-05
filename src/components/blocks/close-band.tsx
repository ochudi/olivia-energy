import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display, Turn } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { CLOSES } from "@/content/brand";
import { MARK_MONO_PATH, MARK_VIEWBOX } from "@/lib/brand/mark";

export type CloseBandVariant =
  "home" | "whatWeDo" | "about" | "insights" | "research";

const STAGGER = 90;

/** Anchor per page: the home band is "We believe" (#believe). */
const IDS: Record<CloseBandVariant, string> = {
  home: "believe",
  whatWeDo: "close",
  about: "close",
  insights: "close",
  research: "close",
};

/**
 * CloseBand — the red flood that ends every page (creative brief 3.3,
 * signature moment 6): a ghosted mark bleeding off the right edge, the ring
 * whose gap closes as the band comes half into view, optional eyebrow and
 * lines, the statement in display-xl (its second sentence as the italic
 * turn where the copy has one), and "Start a conversation".
 *
 * The section clips its own overflow (the ghost is 130% of the band's
 * height); it holds nothing sticky, so the clip breaks nothing.
 */
export function CloseBand({ variant }: { variant: CloseBandVariant }) {
  const copy = CLOSES[variant];
  const headingId = `${IDS[variant]}-title`;
  const lines = copy.lines ?? [];
  return (
    <Section
      surface="red"
      id={IDS[variant]}
      aria-labelledby={headingId}
      className="overflow-clip"
    >
      {/* The ghosted mark: one colour, white at 7%, 130% of the band's
          height, centred on the band and bleeding off the right edge. */}
      <svg
        viewBox={MARK_VIEWBOX}
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute top-1/2 right-0 h-[130%] w-auto translate-x-[22%] -translate-y-1/2 text-white opacity-[0.07]"
      >
        <path d={MARK_MONO_PATH} fill="currentColor" />
      </svg>

      <Container className="relative">
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-6">
          {/* Ring: above the text and left-aligned on phones; top-right of
              the text column from 1024 px. */}
          <div className="text-ink lg:order-2 lg:col-span-3 lg:col-start-9">
            <span className="lg:hidden">
              <RingMark size={120} animate="close" />
            </span>
            <span className="hidden lg:inline-flex">
              <RingMark size={220} animate="close" />
            </span>
          </div>

          <div className="lg:order-1 lg:col-span-7">
            {copy.eyebrow ? (
              <Eyebrow flame className="text-ink">
                {copy.eyebrow}
              </Eyebrow>
            ) : null}
            {lines.length > 0 ? (
              <ul className="mt-8 space-y-1 md:mt-10">
                {lines.map((line, i) => (
                  <Reveal
                    key={line}
                    as="li"
                    delay={i * STAGGER}
                    className="font-display text-display-md text-ink font-normal text-balance"
                  >
                    {line}
                  </Reveal>
                ))}
              </ul>
            ) : null}
            <Display
              as="h2"
              size="xl"
              reveal="mask"
              id={headingId}
              className={
                lines.length > 0 || copy.eyebrow
                  ? "mt-10 max-w-[18ch] md:mt-14"
                  : "max-w-[18ch]"
              }
            >
              {copy.statement}
              {copy.turn ? (
                <>
                  {" "}
                  <Turn>{copy.turn}</Turn>
                </>
              ) : null}
            </Display>
            <Button
              href={copy.cta.href}
              size="lg"
              arrow
              className="mt-10 md:mt-12"
            >
              {copy.cta.label}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
