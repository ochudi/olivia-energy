import Image from "next/image";
import { Fragment } from "react";
import type { Counts } from "@/types/contracts";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Lede } from "@/components/ui/lede";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/reveal";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { FOUNDER } from "@/content/about";
import { HOME_FOUNDER, type FounderCounter } from "@/content/home";
import { getCommentaryCounts } from "@/lib/supabase/queries";

const STAGGER = 90;
/* The halo, centred on the portrait's top-right corner (brief 4.1 section
   6: about 420 px). 360 px keeps its right edge clear of the text column
   at 1440; it scales down with the portrait on phones. */
const HALO = 360;

/** "200+" counts up to 200 and keeps its "+"; a count from data is bare. */
function counterValue(counter: FounderCounter, counts: Counts) {
  if (counter.value === undefined) {
    return { numeral: counts[counter.key as keyof Counts] as number };
  }
  const match = /^(\d+)(.*)$/.exec(counter.value);
  return match
    ? { numeral: Number(match[1]), suffix: match[2] || undefined }
    : { numeral: 0, text: counter.value };
}

/** An ORCID iD (0000-0003-2658-916X) never breaks at its hyphens. */
const ORCID_ID = /(\d{4}-\d{4}-\d{4}-\d{3}[\dX])/;

function KeepIds({ text }: { text: string }) {
  return text.split(ORCID_ID).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Our founder (creative brief 4.1 section 6): a night band with the
 * portrait in the shoulder shape under a lime halo, the name, the
 * credentials set large with lime middle dots, the lede, three counters
 * (articles and citations from content, op-eds from the publication data)
 * and the lime button to About.
 */
export async function HomeFounder() {
  const counts = await getCommentaryCounts();
  const { portrait } = FOUNDER;
  const credentials = HOME_FOUNDER.credentials.split(" · ");
  return (
    <Section
      surface="night"
      id="founder"
      aria-labelledby="founder-title"
      className="overflow-x-clip"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-x-6">
          <div className="flex justify-center pt-10 lg:col-span-5 lg:justify-start lg:pt-16">
            <div className="relative w-60 lg:w-[300px]">
              <div
                aria-hidden
                className="text-brand-lime pointer-events-none absolute top-0 right-0 z-0 flex translate-x-1/2 -translate-y-1/2 scale-[0.76] items-center justify-center lg:scale-100"
                style={{ width: HALO, height: HALO }}
              >
                <RingMark size={HALO} stroke={2} gap={0} animate="draw" />
              </div>
              {portrait.src ? (
                <Reveal
                  variant="wipe"
                  className="shoulder-lg relative isolate z-10 aspect-[4/5] overflow-hidden"
                >
                  {/* The portrait is a PNG on white: multiplied onto paper
                      inside this box, so its ground reads as the brand paper. */}
                  <div className="bg-paper absolute inset-0">
                    <Image
                      src={portrait.src}
                      alt={portrait.alt}
                      fill
                      sizes="(min-width: 1024px) 300px, 240px"
                      quality={75}
                      className="wipe-inner object-cover object-[50%_18%] mix-blend-multiply"
                    />
                  </div>
                </Reveal>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7 lg:col-start-6">
            <Eyebrow flame>{HOME_FOUNDER.eyebrow}</Eyebrow>
            <Display
              as="h2"
              size="lg"
              reveal="mask"
              id="founder-title"
              className="mt-5"
            >
              {HOME_FOUNDER.name}
            </Display>
            <p className="text-ink-muted mt-4 text-base">{HOME_FOUNDER.role}</p>

            <p className="font-display text-display-md text-ink mt-8">
              <span aria-hidden>
                {credentials.map((c, i) => (
                  <Fragment key={c}>
                    {/* Each dot stays with the credential before it, and the
                        row wraps at the spaces after the dots on phones. */}
                    <span className="whitespace-nowrap">
                      {c}
                      {i < credentials.length - 1 ? (
                        <span className="text-brand-lime">{"\u00a0·"}</span>
                      ) : null}
                    </span>{" "}
                  </Fragment>
                ))}
              </span>
              <span className="sr-only">{HOME_FOUNDER.credentialsLong}</span>
            </p>

            <Lede className="mt-6 max-w-[52ch]">{HOME_FOUNDER.lede}</Lede>

            <ul className="border-line mt-10 grid grid-cols-2 gap-x-4 gap-y-8 border-t pt-8 sm:grid-cols-3 md:gap-6">
              {HOME_FOUNDER.counters.map((counter, i) => {
                const v = counterValue(counter, counts);
                return (
                  <Reveal
                    key={counter.key}
                    as="li"
                    delay={i * STAGGER}
                    className={cn(
                      "flex flex-col",
                      // Phones: two counters, then the third across the row.
                      i === HOME_FOUNDER.counters.length - 1 &&
                        i % 2 === 0 &&
                        "col-span-2 sm:col-span-1",
                    )}
                  >
                    <span className="font-display numerals text-brand-lime text-[2.75rem] leading-[0.95] tracking-[-0.02em] lg:text-[4.5rem]">
                      {v.text ?? (
                        <AnimatedNumber value={v.numeral} suffix={v.suffix} />
                      )}
                    </span>
                    <span className="text-ink mt-3 text-sm text-pretty">
                      {counter.label}
                    </span>
                    <span className="source-line text-ink-muted mt-2 text-pretty">
                      <KeepIds text={counter.source(counts)} />
                    </span>
                  </Reveal>
                );
              })}
            </ul>

            <Button
              href={HOME_FOUNDER.cta.href}
              arrow
              size="lg"
              className="mt-10"
            >
              {HOME_FOUNDER.cta.label}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
