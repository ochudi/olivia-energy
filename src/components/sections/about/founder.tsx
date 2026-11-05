import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { Counts } from "@/types/contracts";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Reveal } from "@/components/ui/reveal";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { FOUNDER, FOUNDER_PAGE } from "@/content/about";
import { getCommentaryCounts, getSettings } from "@/lib/supabase/queries";
import { FounderTimeline } from "./founder-timeline";

type Counter = (typeof FOUNDER_PAGE.counters)[number];

/**
 * A counter's figure: its fixed value from the copy ("9", "200+") or the
 * live count from the publication data. Split into the number that counts
 * up and the suffix that stays.
 */
function counterFigure(counter: Counter, counts: Counts) {
  const raw =
    counter.value ??
    String(
      counter.key === "opeds"
        ? counts.opeds
        : counter.key === "mentions"
          ? counts.mentions
          : counts.articles,
    );
  const match = /^(\d+)(.*)$/.exec(raw);
  return match
    ? { value: Number(match[1]), suffix: match[2], text: raw }
    : { value: null, suffix: "", text: raw };
}

/**
 * The profile pills under the portrait. A pill is shown only with a real
 * URL for the founder himself: ORCID from FOUNDER.links, Google Scholar
 * from settings (falling back to FOUNDER.links). No founder LinkedIn URL
 * has been supplied yet (the settings LinkedIn is the company's page), so
 * that pill waits for one.
 */
function profileLinks(scholarUrl: string) {
  const urls: Record<string, string | undefined> = {
    ORCID: FOUNDER.links.orcid,
    "Google Scholar": scholarUrl || FOUNDER.links.scholar,
  };
  return FOUNDER_PAGE.profileLabels.flatMap((label) =>
    urls[label] ? [{ label, href: urls[label] }] : [],
  );
}

/**
 * About section 6, "Our founder" (#founder, the JSON-LD Person url;
 * creative brief 4.3): the portrait in the shoulder with a flood-green
 * ring halo and the profile pills (cols 1 to 5, sticky from 1024 px);
 * then the eyebrow, name, role, the six points with flame bullets, the
 * credentials timeline, four counters and the source line (cols 6 to 12).
 * Counts come from getCommentaryCounts(); only verified facts, as written
 * in content/about.ts.
 */
export async function Founder() {
  const [counts, settings] = await Promise.all([
    getCommentaryCounts(),
    getSettings(),
  ]);
  const points = FOUNDER_PAGE.points(counts);
  const profiles = profileLinks(settings.scholar_url);
  const { portrait } = FOUNDER;

  return (
    <Section surface="paper-deep" id="founder" aria-labelledby="founder-title">
      <Container>
        <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--spacing-header)+3rem)]">
              <div className="relative w-68 pt-6 pr-8 md:w-83">
                {/* The halo: the ring of the mark, drawn round the head. */}
                <span
                  aria-hidden="true"
                  className="text-primary absolute top-0 right-0 hidden md:block"
                >
                  <RingMark size={328} animate="draw" />
                </span>
                <span
                  aria-hidden="true"
                  className="text-primary absolute top-0 right-0 md:hidden"
                >
                  <RingMark size={268} animate="draw" />
                </span>
                {portrait.src ? (
                  <Reveal
                    variant="wipe"
                    className="shoulder-lg relative isolate aspect-4/5 w-full overflow-hidden"
                  >
                    {/* The paper ground sits inside the clip, so the
                        multiply blend turns the photograph's white into
                        paper (the clip isolates its own group). */}
                    <span
                      aria-hidden="true"
                      className="bg-paper absolute inset-0"
                    />
                    <Image
                      src={portrait.src}
                      alt={portrait.alt}
                      fill
                      sizes="(min-width: 48rem) 300px, 240px"
                      className="wipe-inner object-cover object-top mix-blend-multiply"
                    />
                  </Reveal>
                ) : null}
              </div>
              {profiles.length > 0 ? (
                <ul className="mt-8 flex flex-wrap gap-2">
                  {profiles.map((profile) => (
                    <Chip key={profile.label} as="li" href={profile.href}>
                      {profile.label}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </Chip>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Eyebrow>{FOUNDER_PAGE.eyebrow}</Eyebrow>
            <Display
              as="h2"
              size="lg"
              reveal="mask"
              id="founder-title"
              className="mt-6 md:mt-8"
            >
              {FOUNDER_PAGE.name}
            </Display>
            <p className="text-ink-muted mt-4 font-sans text-lg">
              {FOUNDER_PAGE.role}
            </p>

            <ul className="mt-10 space-y-5 md:mt-12">
              {points.map((point, i) => (
                <Reveal
                  as="li"
                  key={point}
                  delay={i * 90}
                  className="text-ink flex gap-4 font-sans text-lg text-pretty"
                >
                  <FlameBullet className="text-primary mt-[0.3em] h-[1.05em]" />
                  <span>{point}</span>
                </Reveal>
              ))}
            </ul>

            <div className="border-line mt-14 border-t pt-10 md:mt-16">
              <FounderTimeline />
            </div>

            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-16 md:gap-y-12">
              {FOUNDER_PAGE.counters.map((counter) => {
                const figure = counterFigure(counter, counts);
                return (
                  <div
                    key={counter.key}
                    className="border-line flex flex-col-reverse justify-end border-t pt-6"
                  >
                    <dt className="text-ink-muted mt-3 font-sans text-sm text-pretty">
                      {counter.label}
                    </dt>
                    <dd className="font-display text-numeral numerals text-ink">
                      {figure.value === null ? (
                        figure.text
                      ) : (
                        <AnimatedNumber
                          value={figure.value}
                          suffix={figure.suffix}
                        />
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <p className="source-line text-ink-muted mt-10 max-w-[68ch] text-pretty">
              {FOUNDER_PAGE.timeline.source}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
