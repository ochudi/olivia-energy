import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { CLOSES } from "@/content/brand";
import { MARK_MONO_PATH, MARK_VIEWBOX } from "@/lib/brand/mark";

export type CloseBandVariant =
  "home" | "whatWeDo" | "about" | "insights" | "research";

/** Anchor per page: the home band is "We believe" (#believe). */
const IDS: Record<CloseBandVariant, string> = {
  home: "believe",
  whatWeDo: "close",
  about: "close",
  insights: "close",
  research: "close",
};

/**
 * CloseBand — the red flood that ends every page (creative brief 3.3): a
 * ghosted mark bleeding off the right edge, the ring whose gap closes as
 * the band scrolls into view (the one thing that moves here), an optional
 * small heading and lines, the statement in display-xl, roman in full, and
 * "Start a conversation".
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
            {copy.heading ? (
              <p className="font-display text-display-xs text-ink">
                {copy.heading}
              </p>
            ) : null}
            {lines.length > 0 ? (
              <ul className="mt-8 space-y-1 md:mt-10">
                {lines.map((line) => (
                  <li
                    key={line}
                    className="font-display text-display-md text-ink font-normal text-balance"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
            <Display
              as="h2"
              // display-xl is for statements of six words or fewer
              // (DESIGN.md, Typography); a longer statement takes display-lg.
              size={
                copy.statement.trim().split(/\s+/).length <= 6 ? "xl" : "lg"
              }
              id={headingId}
              className={
                lines.length > 0 || copy.heading
                  ? "mt-10 max-w-[18ch] md:mt-14"
                  : "max-w-[18ch]"
              }
            >
              {copy.statement}
            </Display>
            <Button href={copy.cta.href} size="lg" className="mt-10 md:mt-12">
              {copy.cta.label}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
