import Image from "next/image";
import type { Counts } from "@/types/contracts";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Lede } from "@/components/ui/lede";
import { cn } from "@/lib/utils/cn";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { FOUNDER } from "@/content/about";
import { HOME_FOUNDER, type FounderCounter } from "@/content/home";
import { getCommentaryCounts } from "@/lib/supabase/queries";

/* The halo, centred on the portrait's top-right corner (brief 4.1 section
   6: about 420 px). 360 px keeps its right edge clear of the text column
   at 1440; it scales down with the portrait on phones. */
const HALO = 360;

/**
 * The two counters the band shows (DESIGN.md, Typography: two, not a strip
 * of three): the journal articles and the op-eds, the two live records.
 */
const SHOWN: readonly FounderCounter["key"][] = ["articles", "opeds"];

/** A counter's figure: its fixed value from the copy or the live count. */
function counterText(counter: FounderCounter, counts: Counts) {
  return counter.value ?? String(counts[counter.key as keyof Counts]);
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
 * portrait in the shoulder shape under a lime halo (the ring draws itself
 * as the band scrolls in), the name, the two roles, the credentials set
 * large, the lede, two counters as final numerals on a hairline, and the
 * lime button to About.
 */
export async function HomeFounder() {
  const counts = await getCommentaryCounts();
  const { portrait } = FOUNDER;
  const counters = HOME_FOUNDER.counters.filter((c) => SHOWN.includes(c.key));
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
                <div className="photo-scope wipe shoulder-lg relative isolate z-10 aspect-[4/5] overflow-hidden">
                  {/* The portrait is a PNG on white: multiplied onto the field
                      inside this box, so its ground reads as the page's. */}
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
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7 lg:col-start-6">
            <Display as="h2" size="lg" id="founder-title">
              {HOME_FOUNDER.name}
            </Display>
            <p className="text-ink-muted mt-4 text-base">
              {HOME_FOUNDER.roles[0]}
              <br />
              {HOME_FOUNDER.roles[1]}
            </p>

            <p className="font-display text-display-md text-ink mt-8">
              <span aria-hidden>{HOME_FOUNDER.credentials}</span>
              <span className="sr-only">{HOME_FOUNDER.credentialsLong}</span>
            </p>

            <Lede className="mt-6 max-w-[52ch]">{HOME_FOUNDER.lede}</Lede>

            <ul className="border-line mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8">
              {counters.map((counter) => (
                <li key={counter.key} className={cn("flex flex-col")}>
                  <span className="font-display numerals text-brand-lime text-[2.75rem] leading-[0.95] tracking-[-0.02em] lg:text-[4.5rem]">
                    {counterText(counter, counts)}
                  </span>
                  <span className="text-ink mt-3 text-sm text-pretty">
                    {counter.label}
                  </span>
                  <span className="source-line text-ink-muted mt-2 text-pretty">
                    <KeepIds text={counter.source(counts)} />
                  </span>
                </li>
              ))}
            </ul>

            <Button href={HOME_FOUNDER.cta.href} size="lg" className="mt-10">
              {HOME_FOUNDER.cta.label}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
