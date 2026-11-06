import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HatchPattern } from "@/components/figures";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Display, Turn } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Lede } from "@/components/ui/lede";
import { Logo } from "@/components/ui/logo";
import { Prose } from "@/components/ui/prose";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { Source } from "@/components/ui/source";
import {
  MISSION,
  PHILOSOPHY,
  TAGLINE,
  VALUES_LIST,
  VISION,
  WHY_OLIVIA,
} from "@/content/brand";
import { FACTS } from "@/content/data/facts";
import { seriesValue } from "@/content/data/series";
import { HOME_EVIDENCE } from "@/content/home";
import { MARK_COLORS } from "@/lib/brand/mark";
import {
  findToken,
  loadTokens,
  tokensWithPrefix,
  type Token,
} from "@/lib/utils/tokens";
import {
  BrandFiles,
  ClearSpace,
  Colourways,
  LockupSpecimens,
  MarkAnatomy,
  MinimumSizes,
  Misuse,
} from "./_components/brand";
import { BlocksSheet } from "./_components/blocks-sheet";
import { ComponentsSheet } from "./_components/components-sheet";
import { Demo, DemoCell } from "./_components/demo";
import { FiguresSheet } from "./_components/figures-sheet";
import { Code, Row, SurfaceFrame } from "./_components/frame";
import { GuideSection, GuideSub, Note } from "./_components/guide-section";
import {
  DurationDemo,
  EasingDemo,
  MotionStatus,
} from "./_components/motion-demos";
import {
  GlyphSheet,
  MotionStages,
  MotionTable,
  ShapeSheet,
} from "./_components/sheets";
import { StyleguideNav, type NavItem } from "./_components/styleguide-nav";
import { ColorRamp, TokenTable } from "./_components/swatch";
import { SurfaceKit } from "./_components/surface-kit";
import {
  BrandPalette,
  ContrastTable,
  SURFACE_ORDER,
  SurfaceCards,
} from "./_components/surfaces";
import { TypeSpecimen } from "./_components/type-specimen";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Tokens, surfaces, type, shape, glyphs, figures and components for the Olivia Energy site.",
  robots: { index: false, follow: false },
};

const SECTIONS: NavItem[] = [
  { id: "principles", number: "01", label: "Principles" },
  { id: "brand", number: "02", label: "Brand" },
  { id: "colour", number: "03", label: "Colour" },
  { id: "surfaces", number: "04", label: "Surfaces" },
  { id: "typography", number: "05", label: "Typography" },
  { id: "layout", number: "06", label: "Spacing & layout" },
  { id: "shape", number: "07", label: "Shape" },
  { id: "motion", number: "08", label: "Motion" },
  { id: "glyphs", number: "09", label: "Glyphs" },
  { id: "figures", number: "10", label: "Figures" },
  { id: "components", number: "11", label: "Components" },
  { id: "blocks", number: "12", label: "Blocks" },
  { id: "prose", number: "13", label: "Prose" },
];

/**
 * The tokens the guide has always required: a missing one throws, so a
 * rename in tokens.css fails loudly here. The list is deliberately the same
 * as before the rebuild; everything newer is looked up softly.
 */
const REQUIRED_TOKENS = [
  "--color-accent",
  "--color-primary",
  "--color-primary-fg",
  "--color-primary-soft",
  "--color-primary-soft-fg",
  "--color-ink",
  "--color-ink-muted",
  "--color-ink-subtle",
  "--color-canvas",
  "--color-inverse",
  "--color-inverse-fg",
  ...["xl", "lg", "base", "sm", "xs"].map((s) => `--text-${s}`),
  ...["xl", "lg", "md", "sm", "xs"].map((s) => `--text-display-${s}`),
] as const;

/** Brief 2.1: the brand and surface colours, in the brief's order. */
const BRAND_TOKENS = [
  "--color-brand-green",
  "--color-flood-green",
  "--color-brand-lime",
  "--color-brand-red",
  "--color-red-ink",
  "--color-night",
  "--color-night-raised",
  "--color-paper",
  "--color-paper-deep",
  "--color-card",
  "--color-chart-tint",
  "--color-lime-pale",
] as const;

const SPACING_STEPS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 40];

const PRINCIPLES = [
  {
    title: "Green is the stage, lime is the evidence, red is the gap",
    body: "Three floods, three jobs. Green carries a statement, lime carries the numbers, red names the gap and closes every page. Paper is for reading and night is used one slab at a time.",
  },
  {
    title: "One flood per section",
    body: "Every section declares one surface and carries one strong statement. Never more than two dark screens in a row. The header reads the surface under its edge and follows it.",
  },
  {
    title: "The turn, once per screen",
    body: "Newsreader at 400 does the talking. The one italic word or phrase takes its colour from the surface: lime on night, pale lime on photographs, flood green on paper.",
  },
  {
    title: "One shape",
    body: "A rectangle with three tight corners and one large rounded top-right corner that echoes the ring of the mark. A single 1px line is the only edge treatment.",
  },
  {
    title: "Hatch means the gap",
    body: "Forty-five degree lines in red, six pixels apart, mark the distance between two lines and nothing else. Solid red appears only on the gap pill.",
  },
  {
    title: "Final state first",
    body: "Server HTML is always the finished page. Motion sets a pre-state only below the fold, native scrolling stays native, and reduced motion shows everything final.",
  },
] as const;

const NEVER = [
  "Arches (two rounded top corners), notches or die-cuts",
  "Offset or drop shadows, glow, glassmorphism",
  "Gradients other than photo scrims",
  "The mark in the flood green, or the flood green as the mark",
  "Lime as text on paper, green or red; small red text on paper",
  "Newsreader at any weight but 400; italic for anything but the turn",
  "Two dark screens in a row; a second turn on one screen",
] as const;

const ALWAYS = [
  "Semantic tokens in components: bg-canvas, text-ink, border-line",
  "A twelve column grid, 24px gaps at 1024 and up",
  "Ledes at 42 characters, body at 68",
  "A source line under every figure, with its retrieval date",
  "Lining tabular numerals wherever figures align",
  "Reduced-motion parity: every motion has a final-state equivalent",
  "Alt text on every photograph and its credit beside it",
] as const;

export default function StyleguidePage() {
  const tokens = loadTokens();
  const tok = (name: string): Token => {
    const t = findToken(tokens, name);
    if (!t) throw new Error(`Missing token ${name}`);
    return t;
  };
  REQUIRED_TOKENS.forEach(tok);

  /** Newer tokens: absent ones are left out of their group rather than throwing. */
  const soft = (names: readonly string[]): Token[] =>
    names
      .map((n) => findToken(tokens, n))
      .filter((t): t is Token => t !== undefined);

  const brand = soft(BRAND_TOKENS);
  const ink = tokens.filter(
    (t) =>
      /^--color-ink-(paper|night|green|lime|photo)/.test(t.name) ||
      t.name === "--color-light-unlit" ||
      t.name === "--color-white",
  );
  const legacyGreen = tokensWithPrefix(tokens, "--color-green-");
  const legacyNeutral = tokensWithPrefix(tokens, "--color-neutral-");
  const taken = new Set([
    ...BRAND_TOKENS,
    ...ink.map((t) => t.name),
    ...legacyGreen.map((t) => t.name),
    ...legacyNeutral.map((t) => t.name),
  ]);
  const semantic = tokens.filter(
    (t) => t.name.startsWith("--color-") && !taken.has(t.name),
  );
  const fonts = [
    ...tokensWithPrefix(tokens, "--font-"),
    ...tokensWithPrefix(tokens, "--tracking-"),
  ];
  const textSizes = ["xl", "lg", "base", "sm", "xs"].map((s) => ({
    size: tok(`--text-${s}`),
    lh: findToken(tokens, `--text-${s}--line-height`),
  }));
  const displaySizes = ["2xl", "xl", "lg", "md", "sm", "xs"].flatMap((s) => {
    const size = findToken(tokens, `--text-display-${s}`);
    return size
      ? [
          {
            size,
            lh: findToken(tokens, `--text-display-${s}--line-height`),
            ls: findToken(tokens, `--text-display-${s}--letter-spacing`),
          },
        ]
      : [];
  });
  const numeral = findToken(tokens, "--text-numeral");
  const spacingNamed = tokensWithPrefix(tokens, "--spacing");
  const containers = tokensWithPrefix(tokens, "--container-");
  const radii = tokensWithPrefix(tokens, "--radius-");
  const shadows = tokensWithPrefix(tokens, "--shadow-");
  const durations = tokensWithPrefix(tokens, "--duration-");
  const easings = tokensWithPrefix(tokens, "--ease-");
  const motionMisc = tokensWithPrefix(tokens, "--motion-");

  const displaySamples: Record<string, string> = {
    "--text-display-2xl": TAGLINE.line1.split(" ")[0] ?? "",
    "--text-display-xl": WHY_OLIVIA.closing,
    "--text-display-lg": HOME_EVIDENCE.title,
    "--text-display-md": WHY_OLIVIA.lines[0] ?? "",
    "--text-display-sm": VALUES_LIST[0]?.name ?? "",
    "--text-display-xs": MISSION.heading,
  };
  const textSamples: Record<string, string> = {
    "--text-xl": PHILOSOPHY.lines[0] ?? "",
    "--text-lg": VISION.text,
    "--text-base": MISSION.text,
    "--text-sm": `${HOME_EVIDENCE.tiles[0].numeral} ${HOME_EVIDENCE.tiles[0].unit ?? ""} ${HOME_EVIDENCE.tiles[0].caption}`,
    "--text-xs": "Last updated 29 September 2026",
  };

  const tile = HOME_EVIDENCE.tiles[0];
  const access = [2000, 2008, 2016, 2024].map((year) => ({
    year,
    nigeria: seriesValue("electricity_access_pct", "Nigeria", year),
    world: seriesValue("electricity_access_pct", "World", year),
  }));
  const pct = (v: number | undefined) =>
    v === undefined ? "" : `${v.toFixed(1)}%`;

  return (
    <div id="top" className="min-h-dvh">
      {/* Chrome */}
      <header className="border-line bg-canvas sticky top-0 z-30 border-b">
        <Container
          size="wide"
          className="flex h-14 items-center justify-between gap-4"
        >
          <Link href="/" className="flex items-center gap-3">
            <Logo className="text-[1.0625rem]" />
            <span aria-hidden className="text-ink-subtle hidden sm:inline">
              /
            </span>
            <span className="text-ink-muted hidden text-sm sm:inline">
              Design system
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="source-line text-ink-muted hidden md:inline">
              October 2026
            </span>
            <Chip>v2</Chip>
          </div>
        </Container>
      </header>

      <main>
        {/* Masthead: the night surface, the ring, the mark's three colours */}
        <Section
          surface="night"
          spacing="default"
          aria-labelledby="guide-title"
          className="overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="text-brand-lime pointer-events-none absolute top-1/2 -right-24 hidden -translate-y-1/2 opacity-[0.14] lg:block"
          >
            <RingMark size={520} stroke={3} animate="none" />
          </div>
          <Container size="wide" className="relative">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="flex flex-col gap-6 lg:col-span-8">
                <Eyebrow flame>Design system</Eyebrow>
                <Display as="h1" size="xl" id="guide-title">
                  Bridging <Turn>Light</Turn>
                </Display>
                <Lede className="max-w-[48ch]">
                  Every token, typeface, surface and component the Olivia Energy
                  site is permitted to use. If it is not on this page, it is not
                  in the build.
                </Lede>
              </div>
              <dl className="border-line grid grid-cols-2 gap-x-6 gap-y-6 self-end lg:col-span-4 lg:grid-cols-1 lg:border-l lg:pl-8">
                {[
                  ["Surfaces", SURFACE_ORDER.join(", ")],
                  ["Typefaces", "Newsreader 400 · Instrument Sans"],
                  ["Shape", "The shoulder, one large corner"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="label text-ink-muted">{k}</dt>
                    <dd className="text-ink mt-1 text-sm">{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="label text-ink-muted">The mark</dt>
                  <dd className="mt-2 flex gap-2">
                    {Object.values(MARK_COLORS).map((c) => (
                      <span
                        key={c}
                        title={c}
                        className="border-line size-8 rounded-full border"
                        style={{ background: c }}
                      />
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </Container>
        </Section>

        <Container size="wide">
          <div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-2">
              <StyleguideNav items={SECTIONS} />
            </div>

            <div className="min-w-0 lg:col-span-10">
              {/* 01 Principles */}
              <GuideSection
                id="principles"
                number="01"
                title="Principles"
                lede="Six rules that decide most questions before they are asked. When a choice is not covered by a token, these settle it."
              >
                <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {PRINCIPLES.map((p, i) => (
                    <div key={p.title} className="border-line border-t pt-5">
                      <p className="label text-ink-muted numerals">0{i + 1}</p>
                      <h3 className="font-display text-display-xs text-ink mt-3">
                        {p.title}
                      </h3>
                      <p className="text-ink-muted mt-3 text-sm">{p.body}</p>
                    </div>
                  ))}
                </div>
                <GuideSub
                  title="Never and always"
                  description="The lines the system does not cross, and the habits that keep it one system."
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    {(
                      [
                        ["Never", NEVER, "bg-accent"],
                        ["Always", ALWAYS, "bg-primary"],
                      ] as const
                    ).map(([label, list, mark]) => (
                      <Card key={label} variant="muted" padding="sm">
                        <p className="label text-ink-muted">{label}</p>
                        <ul className="text-ink mt-3 space-y-2 text-sm">
                          {list.map((s) => (
                            <li key={s} className="flex gap-3">
                              <span
                                aria-hidden
                                className={`${mark} mt-[0.7em] h-px w-3 shrink-0`}
                              />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 02 Brand */}
              <GuideSection
                id="brand"
                number="02"
                title="Brand"
                lede="The client's own mark, kept and redrawn: an open ring with a three-tongue flame rising from its gap, paired with the name set in the house serif. Every rendering, from this page to the favicon, reads one file: src/lib/brand/mark.ts."
              >
                <GuideSub
                  title="The mark"
                  description="Redrawn as vector geometry from the legacy artwork: true circles for the ring, three smooth tongues for the flame, colours sampled from the original. The ring's upper end is the flame's third, innermost tongue."
                >
                  <MarkAnatomy
                    legacy={
                      <Image
                        src="/brand/source/oliviaenergy-logo.png"
                        alt="The legacy Olivia Energy logo, with rounded wordmark and tagline"
                        width={157}
                        height={182}
                        className="h-20 w-auto shrink-0"
                      />
                    }
                  />
                </GuideSub>

                <GuideSub
                  title="Lockups"
                  description="Horizontal is the default; stacked is for square or centred placements. The wordmark's baseline sits on the ring's base and its cap height reaches the top of the ring's counter, so the mark is 1.264 times the wordmark's size."
                >
                  <Demo
                    name="Logo"
                    path="@/components/ui/logo"
                    description="Inline SVG mark with the wordmark as live text. No request, crisp at any density, no layout shift: every dimension is in ems."
                    usage={[
                      "Size it with a text-* class on the logo or its parent (1em is the wordmark), or with size, the mark's height in px.",
                      'tone="color" is the default. It shows true colours on paper, paper-deep and night, and goes one colour (white, or ink on lime) on green, lime, red and photographs.',
                      'tone="mono" takes currentColor everywhere: print, forms, anywhere colour would fight the page.',
                      "The mark is aria-hidden; a wrapping link supplies the name. The header link reads “Olivia Energy, home”.",
                    ]}
                    props={[
                      {
                        name: "variant",
                        type: '"lockup" | "stacked" | "mark"',
                      },
                      { name: "tone", type: '"color" | "mono"' },
                      {
                        name: "size",
                        type: "number",
                        note: "Mark height in px. Omit to inherit the font size.",
                      },
                      { name: "className", type: "string" },
                    ]}
                  >
                    <div className="space-y-12">
                      <LockupSpecimens />
                      <div className="border-line flex flex-wrap items-start gap-x-10 gap-y-6 border-t pt-8">
                        <DemoCell label="header · 22px">
                          <Logo className="text-[1.375rem]" />
                        </DemoCell>
                        <DemoCell label="admin · 19px">
                          <Logo className="text-lg" />
                        </DemoCell>
                        <DemoCell label='variant="mark"'>
                          <Logo variant="mark" size={40} />
                          <Logo variant="mark" tone="mono" size={40} />
                        </DemoCell>
                      </div>
                    </div>
                  </Demo>
                </GuideSub>

                <GuideSub
                  title="Colourways"
                  description="True colours on paper, paper-deep and night. One colour on the floods and photographs: white on green, red and photo, ink on lime. The mark is always #04923F, #D5281B and #88C029, never the flood green."
                >
                  <Colourways />
                </GuideSub>

                <GuideSub
                  title="Clear space"
                  description="A quarter of the mark's height, x, on every side of the mark or a lockup. No text, edge or other logo comes inside it."
                >
                  <ClearSpace />
                </GuideSub>

                <GuideSub
                  title="Minimum sizes"
                  description="Shown at actual size. Below 24px the full mark's secondary tips and the channel under the flame close up, so favicons use their own construction."
                >
                  <MinimumSizes />
                </GuideSub>

                <GuideSub
                  title="Misuse"
                  description="The mark is drawn once and used as drawn."
                >
                  <Misuse />
                </GuideSub>

                <GuideSub
                  title="Files"
                  description="Regenerate everything with node scripts/brand-assets.mjs after changing mark.ts; the kit with node scripts/brand-kit.mjs against a running server."
                >
                  <BrandFiles />
                </GuideSub>
              </GuideSection>

              {/* 03 Colour */}
              <GuideSection
                id="colour"
                number="03"
                title="Colour"
                lede="The mark's three colours, the floods and grounds built from them, and a semantic layer every component reads. Surfaces remap the semantic layer; components never name a raw colour."
              >
                <GuideSub
                  title="Brand and surface"
                  description="Each colour with the one job it has and the one thing it never does. The mark's own colours are exact; the flood green is deeper so white text passes."
                >
                  <BrandPalette tokens={brand} />
                </GuideSub>

                <GuideSub
                  title="Rules"
                  description="What keeps three floods from becoming a rainbow."
                >
                  <ul className="text-ink-muted max-w-text space-y-2 text-sm">
                    {[
                      "One flood per section, carrying one strong statement. Never more than two dark screens in a row.",
                      "The italic turn appears at most once per screen: lime on night, pale lime on photographs, flood green on paper, ink on lime, white on green and red.",
                      "Lime is never text on paper, green or red. Red is never small text on paper: use red ink.",
                      "The mark is true colour on paper, paper-deep and night, and one colour everywhere else.",
                      "Chart colours come from the surface: --chart-1, --chart-2, --chart-3, --chart-gap, --chart-axis, --chart-grid.",
                    ].map((s) => (
                      <li key={s} className="flex gap-3">
                        <span
                          aria-hidden
                          className="bg-line-strong mt-[0.7em] h-px w-3 shrink-0"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </GuideSub>

                <GuideSub
                  title="The gap hatch"
                  description="Forty-five degree lines, 6px pitch, 1.5px stroke, in --hatch-color: red at 85% on night and paper. On lime the shape also carries a 1px ink outline (--hatch-outline), and a solid red pill names the gap."
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    {(["paper", "night", "lime"] as const).map((surface) => (
                      <SurfaceFrame key={surface} surface={surface}>
                        <div className="flex flex-col items-start gap-4 p-5">
                          <Chip tone="solid">{surface}</Chip>
                          <svg
                            viewBox="0 0 240 96"
                            className="h-auto w-full"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <defs>
                              <HatchPattern id={`guide-hatch-${surface}`} />
                            </defs>
                            <rect
                              x="0.5"
                              y="0.5"
                              width="239"
                              height="95"
                              fill={`url(#guide-hatch-${surface})`}
                              stroke="var(--hatch-outline)"
                              strokeWidth="1"
                            />
                          </svg>
                          <Chip tone="gap">{tile.tag}</Chip>
                        </div>
                      </SurfaceFrame>
                    ))}
                  </div>
                </GuideSub>

                <GuideSub
                  title="Ink steps"
                  description="The text colours per surface, with the ratio the brief states for each. Surfaces map ink, ink-muted and ink-subtle onto these."
                >
                  <TokenTable tokens={ink} showSwatch valueLabel="Value" />
                </GuideSub>

                <GuideSub
                  title="Semantic tokens"
                  description="What components actually consume. The values shown are the paper surface; every other surface remaps them."
                >
                  <TokenTable
                    tokens={semantic}
                    showSwatch
                    valueLabel="Resolves to"
                  />
                  <Note>
                    A section declares data-surface and the surface rules in
                    globals.css remap canvas, ink, ink-muted, ink-subtle,
                    primary, primary-fg, accent, line, glyph, error, the six
                    chart variables, the hatch, the turn and the logo variables.
                    Components keep the same classes and need no per-surface
                    variants. data-tone=&quot;inverse&quot; still shares the
                    night values (the inverse logo specimens).
                  </Note>
                </GuideSub>

                <GuideSub
                  title="Legacy ramps"
                  description="Kept so nothing built on them breaks, and used by the admin. New work uses the tokens above."
                >
                  <div className="flex flex-col gap-8">
                    <ColorRamp tokens={legacyGreen} />
                    <ColorRamp tokens={legacyNeutral} />
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 04 Surfaces */}
              <GuideSection
                id="surfaces"
                number="04"
                title="Surfaces"
                lede="Seven surfaces, each shown live with the tokens it remaps and every pair it is held to, with the ratio computed from the same table the tests read."
              >
                <div id="surfaces-cards">
                  <SurfaceCards />
                </div>

                <GuideSub
                  title="Contrast"
                  description="Every text and graphic pair of the surface table, computed at render time. Text needs 4.5:1; large text (24px and up) and graphics need 3:1. Photo rows are tested against the lightest pixel the scrim allows."
                >
                  <ContrastTable />
                </GuideSub>

                <GuideSub
                  title="Every primitive on every surface"
                  description="Eyebrow, display and turn, lede, body, buttons, chips, glyphs, cards, stats, sources, form and lines, once per surface."
                >
                  <div className="flex flex-col gap-8">
                    {SURFACE_ORDER.map((s) => (
                      <div
                        key={s}
                        className="border-line shoulder overflow-hidden border"
                      >
                        <SurfaceKit surface={s} />
                      </div>
                    ))}
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 05 Typography */}
              <GuideSection
                id="typography"
                number="05"
                title="Typography"
                lede="An editorial serif at one weight for everything that is said, and a precise grotesk for everything a reader has to operate. Display sizes are fluid between 390 and 1440 pixels."
              >
                <GuideSub
                  title="The pair"
                  description="No new family and no new weight. The full decision record is in src/app/fonts.ts."
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card padding="md">
                      <p className="label text-ink-muted">
                        Display · Newsreader
                      </p>
                      <p className="font-display text-ink mt-6 text-[6rem] leading-none md:text-[7.5rem]">
                        Aa
                      </p>
                      <p className="font-display text-display-xs text-ink mt-6">
                        {TAGLINE.line1} <Turn>{TAGLINE.line2}</Turn>
                      </p>
                      <p className="font-display text-ink-muted mt-4 text-lg break-words">
                        ABCDEFGHIJKLM abcdefghijklm 0123456789 &amp;?!
                      </p>
                      <ul className="text-ink-muted mt-6 space-y-2 text-sm">
                        <li>
                          Weight 400 only, optical sizing on. Every headline,
                          the Why Olivia lines, numerals, quotations and cover
                          titles.
                        </li>
                        <li>
                          Italic is the turn and nothing else: a static Latin
                          subset, preloaded.
                        </li>
                        <li>
                          Numerals are lining and tabular (<Code>numerals</Code>
                          ).
                        </li>
                      </ul>
                    </Card>
                    <Card padding="md">
                      <p className="label text-ink-muted">
                        Body and UI · Instrument Sans
                      </p>
                      <p className="text-ink mt-6 font-sans text-[6rem] leading-none font-medium md:text-[7.5rem]">
                        Aa
                      </p>
                      <p className="text-ink mt-6 font-sans text-xl">
                        {PHILOSOPHY.lines[0]}
                      </p>
                      <p className="text-ink-muted mt-4 font-sans text-lg break-words">
                        ABCDEFGHIJKLM abcdefghijklm 0123456789 &amp;?!
                      </p>
                      <ul className="text-ink-muted mt-6 space-y-2 text-sm">
                        <li>
                          Body, ledes, labels, buttons, chips, sources and
                          navigation. Weights 400 to 600.
                        </li>
                        <li>
                          Labels are 12px uppercase 600 with the label tracking;
                          source lines are 12px regular, sentence case.
                        </li>
                      </ul>
                    </Card>
                  </div>
                </GuideSub>

                <GuideSub
                  title="Display scale"
                  description="Fluid between 390px and 1440px. Leading and tracking are part of the token, so text-display-lg is a complete setting. 2xl is the home H1 only."
                >
                  <div className="border-line border-t">
                    {displaySizes.map(({ size, lh, ls }) => (
                      <TypeSpecimen
                        key={size.name}
                        token={size}
                        lineHeight={lh}
                        letterSpacing={ls}
                        sample={displaySamples[size.name] ?? size.name}
                      />
                    ))}
                    {numeral ? (
                      <div className="border-line grid gap-2 border-b py-5 lg:grid-cols-12 lg:gap-6">
                        <div className="text-ink-subtle font-mono text-[0.6875rem] leading-relaxed lg:col-span-3">
                          <p className="text-ink">text-numeral</p>
                          <p className="break-all">{numeral.value}</p>
                          <p>lh 0.9 · ls -0.03em</p>
                        </div>
                        <p className="font-display text-numeral numerals text-ink min-w-0 lg:col-span-9">
                          {tile.numeral}
                          <span className="text-display-md text-ink-muted ml-3 align-baseline">
                            {tile.unit}
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </GuideSub>

                <GuideSub
                  title="The turn"
                  description="One italic word or phrase, in the colour of its surface. At most once per screen."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {(
                      [
                        "paper",
                        "night",
                        "lime",
                        "green",
                        "red",
                        "photo",
                      ] as const
                    ).map((surface) => (
                      <SurfaceFrame key={surface} surface={surface}>
                        <div className="flex flex-col items-start gap-3 p-5">
                          <Chip tone="solid">{surface}</Chip>
                          <Display as="p" size="md">
                            {PHILOSOPHY.statement}
                          </Display>
                        </div>
                      </SurfaceFrame>
                    ))}
                  </div>
                </GuideSub>

                <GuideSub
                  title="Text scale"
                  description="Fixed sizes in the sans, except the lede, which is fluid. Body is 17px at 1.6 and never wider than 68 characters; ledes stop at 42."
                >
                  <div className="border-line border-t">
                    {textSizes.map(({ size, lh }) => (
                      <TypeSpecimen
                        key={size.name}
                        token={size}
                        lineHeight={lh}
                        font="sans"
                        sample={textSamples[size.name] ?? size.name}
                        className="[&>p:last-child]:max-w-[68ch]"
                      />
                    ))}
                  </div>
                </GuideSub>

                <GuideSub
                  title="Labels and source lines"
                  description="The two 12px settings: the label is uppercase 600 with tracking, the source line is regular and sentence case."
                >
                  <div className="flex flex-col gap-4">
                    <Row label="label">
                      <p className="label text-ink">Year</p>
                    </Row>
                    <Row label="source-line">
                      <p className="source-line text-ink-muted">
                        {tile.source.org}, {tile.source.title}
                      </p>
                    </Row>
                    <Row label="Source">
                      <Source
                        sources={tile.source}
                        retrieved={
                          tile.retrieved ?? FACTS[tile.fact]?.retrieved
                        }
                      />
                    </Row>
                  </div>
                  <div className="mt-8">
                    <TokenTable tokens={fonts} />
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 06 Spacing & layout */}
              <GuideSection
                id="layout"
                number="06"
                title="Spacing & layout"
                lede="A 4px unit for components, fluid named tokens for page rhythm, and a 1296px container on a twelve column grid."
              >
                <GuideSub
                  title="Scale"
                  description="Multiples of the 4px unit. Component padding lives in 4 to 8; gaps between blocks in 8 to 16; page rhythm uses the named tokens."
                >
                  <div className="space-y-2">
                    {SPACING_STEPS.map((n) => (
                      <div key={n} className="flex items-center gap-4">
                        <span className="text-ink numerals w-8 shrink-0 font-mono text-xs">
                          {n}
                        </span>
                        <span className="text-ink-subtle numerals w-12 shrink-0 font-mono text-[0.6875rem]">
                          {n * 4}px
                        </span>
                        <span
                          className="bg-primary h-3"
                          style={{ width: `calc(var(--spacing) * ${n})` }}
                        />
                      </div>
                    ))}
                  </div>
                </GuideSub>

                <GuideSub
                  title="Named spacing and widths"
                  description="Fluid tokens scale with the viewport. Sections take --spacing-section above and below; bands inside a section take --spacing-section-sm; the side gutter is 20px at 390, 40px at 768 and 72px at 1440."
                >
                  <TokenTable tokens={[...spacingNamed, ...containers]} />
                </GuideSub>

                <GuideSub
                  title="Containers"
                  description="Nested widths, shown at true size where the viewport allows. Reading text lives in text; the page in page (1296px); chrome and data in wide."
                >
                  <div className="space-y-3">
                    {containers.map((c) => (
                      <div
                        key={c.name}
                        className="border-line bg-surface text-ink-muted flex h-10 items-center border px-3 font-mono text-xs"
                        style={{ maxWidth: c.resolved }}
                      >
                        <span className="text-ink">
                          {c.name.replace("--container-", "max-w-")}
                        </span>
                        <span className="text-ink-subtle ml-3">
                          {c.resolved}
                        </span>
                      </div>
                    ))}
                  </div>
                </GuideSub>

                <GuideSub
                  title="Grid"
                  description="Twelve columns with 24px gaps at 1024 and up; eight columns with 20px at 768; four columns with 16px at 390. Cols 1 to 6 means grid columns at 1440."
                >
                  <div className="grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-5 lg:grid-cols-12 lg:gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-primary-soft h-10 ${i >= 8 ? "hidden lg:block" : i >= 4 ? "hidden md:block" : ""}`}
                      />
                    ))}
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 07 Shape */}
              <GuideSection
                id="shape"
                number="07"
                title="Shape"
                lede="One shape everywhere: a rectangle with three tight corners and one large rounded top-right corner that echoes the ring. Circles appear only where the ring is meant."
              >
                <GuideSub
                  title="The shoulder"
                  description="Three sizes, plus the pill. Photographs and flood panels take the large one; cards, covers and figure plates the middle one."
                >
                  <ShapeSheet tokens={radii} />
                </GuideSub>
                <GuideSub
                  title="Edges"
                  description="No elevation on the public site: a single 1px line is the only edge treatment. The legacy shadow tokens remain for the admin."
                >
                  <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    {shadows.map((s) => (
                      <div key={s.name}>
                        <div
                          className="bg-surface aspect-[4/3] w-full rounded-sm"
                          style={{ boxShadow: s.resolved }}
                        />
                        <p className="text-ink mt-4 font-mono text-xs">
                          {s.name.replace("--shadow-", "shadow-")}
                        </p>
                        <p className="text-ink-muted mt-1 text-xs">
                          Admin only
                        </p>
                      </div>
                    ))}
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 08 Motion */}
              <GuideSection
                id="motion"
                number="08"
                title="Motion"
                lede="Native scroll only. Server HTML is the final state; JavaScript may set a pre-state only below the fold. Eleven named motions, every duration and easing a token, every one with a static equivalent."
              >
                <GuideSub
                  title="Your setting"
                  description="Detected live from the operating system. The stages below respond to it."
                >
                  <MotionStatus />
                  <Note>
                    With <Code>prefers-reduced-motion: reduce</Code> (or with no
                    JavaScript): everything is final, nothing pins, all lines
                    are lit, counters show their value, rings are closed, charts
                    are drawn and the ignition is the static mark.
                  </Note>
                </GuideSub>

                <GuideSub
                  title="The table"
                  description="Each motion with what it moves, read from the token file."
                >
                  <MotionTable tokens={tokens} />
                </GuideSub>

                <GuideSub
                  title="Live"
                  description="The production reveals, rewound and replayed. Scroll them into view or press replay."
                >
                  <MotionStages />
                </GuideSub>

                <GuideSub
                  title="Durations"
                  description="Short for state, longer for arrival."
                >
                  <DurationDemo durations={durations} />
                  <div className="mt-8">
                    <TokenTable tokens={durations} />
                  </div>
                </GuideSub>

                <GuideSub
                  title="Easings"
                  description="Standard for state, out for arrival, in-out for strokes and clips, in for exits. No springs, no overshoot."
                >
                  <EasingDemo easings={easings} />
                  <div className="mt-8">
                    <TokenTable tokens={[...easings, ...motionMisc]} />
                  </div>
                </GuideSub>

                <GuideSub
                  title="Pinned scenes"
                  description="At most one per page, desktop only, enabled purely in CSS."
                >
                  <Note>
                    <Code>
                      @media (scripting: enabled) and (prefers-reduced-motion:
                      no-preference) and (min-width: 1024px) and (min-height:
                      640px)
                    </Code>
                    . One passive scroll listener and one rAF write a single
                    custom property, <Code>--p</Code>, on the scene; everything
                    else is CSS reading <Code>--p</Code> or a{" "}
                    <Code>data-step</Code> attribute.
                  </Note>
                </GuideSub>

                <GuideSub
                  title="Interaction states"
                  description="Every control answers the same way, regardless of component."
                >
                  <ul className="text-ink-muted space-y-2 text-sm">
                    <li>
                      <span className="text-ink font-medium">Hover</span>: the
                      external-link ring moves 4px, a card photograph scales to
                      1.04, a cover lifts 4px, at 200, 600 and 300ms; fine
                      pointers only.
                    </li>
                    <li>
                      <span className="text-ink font-medium">Press</span>:
                      active:translate-y-px on buttons, snapped to
                      duration-instant.
                    </li>
                    <li>
                      <span className="text-ink font-medium">Focus</span>: one
                      ring everywhere: ring-2 ring-focus ring-offset-2
                      ring-offset-canvas.
                    </li>
                  </ul>
                </GuideSub>
              </GuideSection>

              {/* 09 Glyphs */}
              <GuideSection
                id="glyphs"
                number="09"
                title="Glyphs"
                lede="One family of fourteen line glyphs on a 48 unit grid. Stroke 2px at 48, round caps and joins, no fills but a dot. Drawn in flood green on paper, white on green, night and red, ink on lime; never filled, never more than one colour."
              >
                <GuideSub
                  title="The family"
                  description="Built only from the ring, the flame tongue, straight strokes at 0, 45 or 90 degrees and the dot, at most four elements each. Path data is in src/components/ui/glyphs.ts."
                >
                  <GlyphSheet />
                </GuideSub>
              </GuideSection>

              {/* 10 Figures */}
              <GuideSection
                id="figures"
                number="10"
                title="Figures"
                lede="Every chart is a figure on a plate: server-rendered SVG with HTML labels, a source line, a table alternative and the data as CSV. Real series, never typed numbers."
              >
                <GuideSub
                  title="Anatomy"
                  description="What every figure carries."
                >
                  <ul className="text-ink-muted max-w-text space-y-2 text-sm">
                    {[
                      "The Fig. tag and the title in display-xs, then an optional subtitle in text-sm.",
                      "A wide viewBox at 768 and up and a tall one below, switched in CSS; the aspect ratio is set, so nothing shifts.",
                      "Series labels at the line ends as HTML, the value in Newsreader and the name in Instrument Sans 12px.",
                      "Ring end markers; a hatched gap between the two lines that define it, with one solid red pill.",
                      "One or two sentences of interpretation, then the source line with the retrieval date.",
                      "View as table in a details element, and Get the data (CSV) linking /data/{series}.csv.",
                      "Numbering restarts on each page. Numeral cards carry a tag (Gap, Opening, Target, Context) instead of a Fig. number.",
                    ].map((s) => (
                      <li key={s} className="flex gap-3">
                        <span
                          aria-hidden
                          className="bg-line-strong mt-[0.7em] h-px w-3 shrink-0"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </GuideSub>
                <FiguresSheet />
              </GuideSection>

              {/* 11 Components */}
              <GuideSection
                id="components"
                number="11"
                title="Components"
                lede="The primitives in src/components/ui. Each consumes semantic tokens only, ships with its usage notes, and is the sole way to produce its pattern."
              >
                <ComponentsSheet />
              </GuideSection>

              {/* 12 Blocks */}
              <GuideSection
                id="blocks"
                number="12"
                title="Blocks"
                lede="The shared page blocks in src/components/blocks, shown on their surfaces with the real op-eds: the cover wall, the quote panel, the audience tiles and the closing band."
              >
                <BlocksSheet />
              </GuideSection>

              {/* 13 Prose */}
              <GuideSection
                id="prose"
                number="13"
                title="Prose"
                lede="Article typography for insights and anything authored in the editor. One wrapper, every element styled from tokens."
              >
                <Demo
                  name="Prose"
                  path="@/components/ui/prose"
                  description="Wraps rendered HTML or MDX. Sizes sm, md and lg."
                  preview="surface"
                  usage={[
                    "Place inside a text container; the wrapper caps its own measure at 65ch.",
                    "Headings inside prose are serif at display-sm and display-xs; h4 is sans.",
                    "Tables get hairlines and tabular numerals; add class num to right-align figures.",
                  ]}
                  props={[
                    { name: "size", type: '"sm" | "md" | "lg"' },
                    { name: "as", type: "ElementType" },
                  ]}
                >
                  <Prose>
                    <p className="lede">{MISSION.text}</p>
                    <h2>{WHY_OLIVIA.heading}</h2>
                    <p>{PHILOSOPHY.lines.join(" ")}</p>
                    <ul>
                      {VALUES_LIST.slice(0, 3).map((v) => (
                        <li key={v.name}>
                          <strong>{v.name}.</strong> {v.text}
                        </li>
                      ))}
                    </ul>
                    <blockquote>
                      <p>{VISION.text}</p>
                      <cite>{VISION.heading}</cite>
                    </blockquote>
                    <h3>Access to electricity, share of population</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th className="num">Nigeria</th>
                          <th className="num">World</th>
                        </tr>
                      </thead>
                      <tbody>
                        {access.map((r) => (
                          <tr key={r.year}>
                            <td>{r.year}</td>
                            <td className="num">{pct(r.nigeria)}</td>
                            <td className="num">{pct(r.world)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <hr />
                    <h4>{TAGLINE.line1}</h4>
                    <p>
                      <small>{TAGLINE.line2}</small>
                    </p>
                  </Prose>
                </Demo>
              </GuideSection>
            </div>
          </div>
        </Container>
      </main>

      <Section
        surface="night"
        as="footer"
        spacing="sm"
        className="mt-section-sm"
      >
        <Container
          size="wide"
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="text-sm">
            <p className="text-ink font-medium">
              Olivia Energy design system · v2
            </p>
            <p className="source-line text-ink-muted mt-1 font-mono">
              tokens: src/styles/tokens.css · components: src/components/ui ·
              fonts: src/app/fonts.ts · mark: src/lib/brand/mark.ts
            </p>
          </div>
          <Button variant="text" href="#top" icon={<ArrowUpRight />}>
            Back to top
          </Button>
        </Container>
      </Section>
    </div>
  );
}
