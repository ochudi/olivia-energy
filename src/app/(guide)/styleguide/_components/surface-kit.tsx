import Image from "next/image";
import type { ReactNode } from "react";
import { HatchPattern } from "@/components/figures";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FigTag } from "@/components/ui/fig-tag";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { FormField, TextArea, TextInput } from "@/components/ui/form-field";
import { Glyph } from "@/components/ui/glyph";
import { Lede } from "@/components/ui/lede";
import { Logo } from "@/components/ui/logo";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { Source } from "@/components/ui/source";
import { Stat } from "@/components/ui/stat";
import { Tag } from "@/components/ui/tag";
import { MISSION, PHILOSOPHY, VALUES_LIST, WHY_OLIVIA } from "@/content/brand";
import { HOME_EVIDENCE, HOME_HERO, RETRIEVED } from "@/content/home";
import { PHOTOS } from "@/content/images";
import { NAV_CTA, SERVICES } from "@/content/site";
import type { Surface } from "@/types/contracts";

/* The gap hatch as a swatch: the figures kit's <HatchPattern>
   in the surface's hatch colour, with its outline. */
function HatchSwatch({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 96 48"
      className="h-12 w-24 shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <HatchPattern id={id} />
      </defs>
      <rect
        x="0.5"
        y="0.5"
        width="95"
        height="47"
        fill={`url(#${id})`}
        stroke="var(--hatch-outline)"
        strokeWidth="1"
      />
    </svg>
  );
}

function Swatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="border-line h-10 w-full border"
        style={{ background: value }}
      />
      <span className="source-line text-ink-muted">{label}</span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-line grid gap-4 border-t pt-5 lg:grid-cols-[10rem_1fr] lg:gap-8">
      <span className="source-line text-ink-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const SWATCHES: readonly { label: string; value: string }[] = [
  { label: "canvas", value: "var(--color-canvas)" },
  { label: "surface", value: "var(--color-surface)" },
  { label: "ink", value: "var(--color-ink)" },
  { label: "ink-muted", value: "var(--color-ink-muted)" },
  { label: "ink-subtle", value: "var(--color-ink-subtle)" },
  { label: "line-strong", value: "var(--color-line-strong)" },
  { label: "primary", value: "var(--color-primary)" },
  { label: "primary-soft", value: "var(--color-primary-soft)" },
  { label: "accent", value: "var(--color-accent)" },
  { label: "turn", value: "var(--turn-color)" },
  { label: "chart-1", value: "var(--chart-1)" },
  { label: "chart-2", value: "var(--chart-2)" },
  { label: "chart-3", value: "var(--chart-3)" },
  { label: "chart-gap", value: "var(--chart-gap)" },
  { label: "chart-axis", value: "var(--chart-axis)" },
  { label: "chart-grid", value: "var(--chart-grid)" },
];

const HERO_PHOTO = PHOTOS["lagos-third-mainland"];

/**
 * Every primitive once, on one surface. The page renders it seven times so
 * each surface's remap can be checked against the surface table in contrast.ts.
 */
/** Every primitive once, on one surface (was /preview). */
export function SurfaceKit({ surface }: { surface: Surface }) {
  const tile = HOME_EVIDENCE.tiles[0];
  const second = HOME_EVIDENCE.tiles[1];
  const isPhoto = surface === "photo";
  const value = VALUES_LIST[0];
  return (
    <Section
      surface={surface}
      id={`kit-${surface}`}
      spacing="sm"
      aria-labelledby={`kit-${surface}-title`}
      className={isPhoto ? "overflow-hidden" : undefined}
    >
      {isPhoto ? (
        <>
          <Image
            src={HERO_PHOTO.src}
            alt=""
            fill
            sizes="100vw"
            quality={60}
            placeholder="blur"
            blurDataURL={HERO_PHOTO.blurDataURL}
            className="-z-20 object-cover"
            style={{ objectPosition: HERO_PHOTO.focal }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(6,23,14,.85) 0%, rgba(6,23,14,.62) 50%, rgba(6,23,14,0) 78%), linear-gradient(0deg, rgba(6,23,14,.88) 0%, rgba(6,23,14,0) 52%), linear-gradient(180deg, rgba(6,23,14,.45) 0, rgba(6,23,14,0) 160px)",
            }}
          />
        </>
      ) : null}
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Chip tone="solid">{surface}</Chip>
          <div className="flex items-center gap-6">
            <Logo variant="lockup" size={28} />
            <Logo variant="mark" size={28} tone="mono" />
          </div>
        </div>

        <Row label="Tokens">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {SWATCHES.map((s) => (
              <Swatch key={s.label} {...s} />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <HatchSwatch id={`hatch-${surface}`} />
            <span className="source-line text-ink-muted">
              hatch-color / hatch-outline
            </span>
          </div>
        </Row>

        <Row label="Eyebrow">
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            <Eyebrow>The gaps, measured</Eyebrow>
            <Eyebrow flame>{PHILOSOPHY.heading}</Eyebrow>
            <Eyebrow number="01">{SERVICES[0].title}</Eyebrow>
          </div>
        </Row>

        <Row label="Display + Turn">
          <Display
            as="h2"
            size="lg"
            id={`kit-${surface}-title`}
            className="max-w-[16ch]"
          >
            {PHILOSOPHY.statement}
          </Display>
          <Display as="p" size="md" className="mt-6 max-w-[22ch]">
            {HOME_EVIDENCE.title}
          </Display>
        </Row>

        <Row label="Lede, body, small">
          <div className="flex flex-col gap-4">
            <Lede>{HOME_EVIDENCE.lede}</Lede>
            <p className="max-w-[68ch] text-base">{MISSION.text}</p>
            <p className="text-ink-muted max-w-[68ch] text-sm">
              {tile.caption}
            </p>
            <p className="text-ink-subtle max-w-[68ch] text-xs">
              {second.caption}
            </p>
          </div>
        </Row>

        <Row label="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button href={NAV_CTA.href}>{NAV_CTA.label}</Button>
            <Button href={HOME_HERO.primaryCta.href} variant="secondary">
              {HOME_HERO.primaryCta.label}
            </Button>
            <Button href="https://businessday.ng" variant="text" external>
              {HOME_HERO.secondaryCta.label}
            </Button>
            <Button href={NAV_CTA.href} size="lg">
              {NAV_CTA.label}
            </Button>
            <Button href={tile.source.url ?? "#"} variant="secondary" external>
              {tile.source.org}
            </Button>
          </div>
        </Row>

        <Row label="Chips, Fig. tag, Tag">
          <div className="flex flex-wrap items-center gap-3">
            <FigTag n={HOME_EVIDENCE.figure.n} />
            <Chip>{tile.tag}</Chip>
            <Chip tone="solid">{SERVICES[0].short}</Chip>
            <Chip tone="gap">{tile.tag}</Chip>
            <Chip tone="opening">
              {HOME_EVIDENCE.tiles[3]?.tag ?? "Opening"}
            </Chip>
            <Chip href="#kit-paper">{SERVICES[1].short}</Chip>
            <Tag>{SERVICES[2].short}</Tag>
            <Tag variant="outline">{SERVICES[3].short}</Tag>
            <Tag variant="primary">{SERVICES[4].short}</Tag>
            <Tag variant="accent">{tile.tag}</Tag>
          </div>
        </Row>

        <Row label="Glyphs, ring, flame">
          <div className="flex flex-wrap items-center gap-6">
            {SERVICES.map((s) => (
              <Glyph key={s.slug} name={s.glyph} title={s.title} />
            ))}
            <RingMark size={48} />
            <RingMark size={48} gap={0} />
            <span className="text-display-sm font-display inline-flex items-center gap-2">
              <FlameBullet className="text-primary" />
              {WHY_OLIVIA.closing}
            </span>
          </div>
        </Row>

        <Row label="Card and Stat">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <Glyph name={value.glyph} />
                <Chip>{tile.tag}</Chip>
              </div>
              <h3 className="font-display text-display-sm text-ink mt-6">
                {value.name}
              </h3>
              <p className="text-ink-muted mt-3 text-sm">{value.text}</p>
              <div className="mt-6">
                <Button href={NAV_CTA.href} variant="text" size="sm">
                  {NAV_CTA.label}
                </Button>
              </div>
            </Card>
            <div className="flex flex-col gap-6">
              <Stat
                value={tile.numeral}
                suffix={tile.suffix}
                label={tile.unit ?? tile.tag}
                description={tile.caption}
                animate={false}
                size="lg"
              />
              <Source sources={tile.source} retrieved={RETRIEVED} />
              <Source
                sources={[tile.source, second.source]}
                retrieved={RETRIEVED}
              />
            </div>
          </div>
        </Row>

        <Row label="Form">
          <form className="grid max-w-[40rem] gap-5 md:grid-cols-2">
            <FormField label="Name" htmlFor={`name-${surface}`}>
              <TextInput id={`name-${surface}`} name="name" />
            </FormField>
            <FormField
              label="Email"
              htmlFor={`email-${surface}`}
              error="Enter an email address."
            >
              <TextInput
                id={`email-${surface}`}
                name="email"
                type="email"
                aria-invalid
              />
            </FormField>
            <FormField
              label="Message"
              htmlFor={`message-${surface}`}
              optional
              className="md:col-span-2"
            >
              <TextArea id={`message-${surface}`} name="message" rows={3} />
            </FormField>
          </form>
        </Row>

        <Row label="Lines">
          <div className="flex flex-col gap-4">
            <hr className="border-line" />
            <hr className="border-line-strong" />
            <div className="bg-surface shoulder-sm border-line border p-5">
              <p className="text-ink text-sm">{VALUES_LIST[1].text}</p>
            </div>
          </div>
        </Row>
      </Container>
    </Section>
  );
}
