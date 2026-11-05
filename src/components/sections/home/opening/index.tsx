import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Turn } from "@/components/ui/display";
import { HOME_HERO, HOME_WHY } from "@/content/home";
import { MARK_HEIGHT, MARK_MONO_PATH, MARK_WIDTH } from "@/lib/brand/mark";
import { formatDateShort } from "@/lib/content/format";
import { getLatestOpEd } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils/cn";
import { FLOOD_PATH } from "./flood";
import { HeroPicture, HeroPreload, heroSources } from "./hero-picture";
import { OpeningMotion } from "./opening-motion";
import s from "./opening.module.css";

const CLIP_ID = "olivia-mark-clip";

/** Stagger for the load fades (brief 4.1: from 150 ms, 90 ms apart; the card at 400 ms). */
const rise = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * A " · "-separated line that wraps only between whole items, never with a
 * dot ending or starting a line (opening.module.css, .separated). Screen
 * readers get the string once, as written.
 */
function Separated({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className={s.separatedClip} aria-hidden="true">
        <span className={s.separated}>
          {text.split(" · ").map((part, i) => (
            <span key={`${i}-${part}`} className={s.separatedItem}>
              {part}
            </span>
          ))}
        </span>
      </span>
    </>
  );
}

/**
 * HomeOpening (P1) — the home page's first two sections, `#hero` and
 * `#why-olivia`, in one DOM with two layouts (creative brief 2.10):
 *
 *  • Static (phones, tablets, reduced motion, no JavaScript): the graded
 *    Lagos photograph under the hero copy, then Why Olivia as its own green
 *    section with the photograph inside the mark.
 *  • Pinned (desktop, motion allowed, scripting on; gated in CSS): a 280svh
 *    wrapper with a sticky stage; the green flood closes around the mark
 *    and the photograph survives inside it while the nine lines light.
 *
 * Server HTML is the final state: the H1 and photograph are never hidden,
 * every line is lit, and OpeningMotion only adds pre-states it can undo.
 */
export async function HomeOpening() {
  const oped = await getLatestOpEd();
  const sources = heroSources(HOME_HERO.photo);
  const focal = {
    "--focal-desktop": sources.focal.desktop,
    "--focal-phone": sources.focal.phone,
  } as CSSProperties;

  return (
    <section
      id="hero"
      data-surface="photo"
      data-hero="dark"
      data-opening=""
      aria-labelledby="hero-title"
      className={cn(s.opening, "bg-canvas text-ink -mt-header")}
    >
      <HeroPreload sources={sources} />
      <div className={s.stage} data-stage="" style={focal}>
        <div className={s.photo}>
          <div className={s.photoScale}>
            <HeroPicture
              sources={sources}
              eager
              imgClassName={cn(s.photoImg, "animate-settle")}
            />
          </div>
          <div className={s.scrims} aria-hidden="true" />
        </div>

        <svg className={s.flood} aria-hidden="true" focusable="false">
          <g data-flood="">
            <path d={FLOOD_PATH} fillRule="evenodd" />
          </g>
        </svg>

        <div className={s.hero} data-hero-copy="">
          <Container className={s.heroInner}>
            <div className={s.copy}>
              <div className={s.copyHead}>
                <Eyebrow>
                  <Separated text={HOME_HERO.eyebrow} />
                </Eyebrow>
                <h1
                  id="hero-title"
                  className={cn(
                    s.title,
                    "font-display text-ink font-normal text-balance",
                  )}
                >
                  {HOME_HERO.title}
                </h1>
                <p
                  className={cn(s.turn, s.rise, "font-display")}
                  style={rise(150)}
                >
                  <Turn>{HOME_HERO.turn}</Turn>
                </p>
              </div>
              <div className={s.copyBody}>
                <p
                  className={cn(
                    s.lede,
                    s.rise,
                    "text-ink-muted font-sans text-pretty",
                  )}
                  style={rise(240)}
                >
                  {HOME_HERO.lede}
                </p>
                <div className={cn(s.actions, s.rise)} style={rise(330)}>
                  <Button
                    href={HOME_HERO.primaryCta.href}
                    size="lg"
                    arrow
                    className={s.primary}
                  >
                    {HOME_HERO.primaryCta.label}
                  </Button>
                  <Button
                    href={HOME_HERO.secondaryCta.href}
                    variant="secondary"
                    size="lg"
                    className={s.secondary}
                  >
                    {HOME_HERO.secondaryCta.label}
                  </Button>
                </div>
              </div>
            </div>

            <article
              className={cn(s.card, s.rise, "shoulder")}
              style={rise(400)}
              aria-labelledby="latest-oped-title"
            >
              <p className={s.cardTop}>
                <span className="label text-ink">{HOME_HERO.latestLabel}</span>
                <time
                  dateTime={oped.publishedOn}
                  className="source-line text-ink-muted numerals"
                >
                  {formatDateShort(oped.publishedOn)}
                </time>
              </p>
              <p
                id="latest-oped-title"
                className={cn(
                  s.cardTitle,
                  "font-display text-display-xs text-ink text-balance",
                )}
              >
                {oped.title}
              </p>
              <div className={s.cardFoot}>
                <p className="text-ink-muted text-sm">
                  <Separated text={HOME_HERO.cardMeta(oped)} />
                </p>
                <a
                  href={oped.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={HOME_HERO.cardLinkLabel(oped.title)}
                  className={s.cardLink}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="hover-arrow size-4"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
              </div>
            </article>

            <p className={cn(s.credit, "source-line")}>{HOME_HERO.credit}</p>
          </Container>
        </div>

        <section
          id="why-olivia"
          data-surface="green"
          aria-labelledby="why-olivia-title"
          className={cn(s.why, "text-ink")}
        >
          <Container className={s.whyGrid}>
            <h2
              id="why-olivia-title"
              className={cn(s.whyHeading, "label text-ink")}
            >
              <FlameBullet className="text-brand-lime h-[1.1em]" />
              {HOME_WHY.heading}
            </h2>

            <figure className={s.window}>
              <div className={s.windowBox} data-mark-slot="">
                <div className={s.windowClip}>
                  <HeroPicture
                    sources={sources}
                    eager={false}
                    decorative
                    imgClassName={s.windowImg}
                  />
                </div>
              </div>
              <figcaption className={cn(s.windowCaption, "source-line")}>
                {HOME_HERO.credit}
              </figcaption>
            </figure>

            <ul className={s.lines}>
              {HOME_WHY.lines.map((line) => (
                <li
                  key={line}
                  data-line=""
                  className={cn(s.line, "light font-display")}
                >
                  <FlameBullet className={cn(s.bullet, "text-brand-lime")} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p data-line="" className={cn(s.closing, "light")}>
              <span className={s.underline}>{HOME_WHY.closing}</span>
            </p>
          </Container>
        </section>
      </div>

      <svg width="0" height="0" aria-hidden="true" className={s.defs}>
        <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
          <path
            d={MARK_MONO_PATH}
            transform={`scale(${1 / MARK_WIDTH} ${1 / MARK_HEIGHT})`}
          />
        </clipPath>
      </svg>
      <OpeningMotion />
    </section>
  );
}
