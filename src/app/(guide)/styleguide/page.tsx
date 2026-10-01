import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FormField, TextArea, TextInput } from "@/components/ui/form-field";
import { Logo } from "@/components/ui/logo";
import { Prose } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stat } from "@/components/ui/stat";
import { Tag } from "@/components/ui/tag";
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
import { Demo, DemoCell } from "./_components/demo";
import { GuideSection, GuideSub, Note } from "./_components/guide-section";
import {
  ButtonStates,
  CounterDemo,
  DurationDemo,
  EasingDemo,
  MotionStatus,
  RevealDemo,
} from "./_components/motion-demos";
import { StyleguideNav, type NavItem } from "./_components/styleguide-nav";
import {
  ColorRamp,
  ContrastPair,
  Swatch,
  TokenTable,
} from "./_components/swatch";
import { TypeSpecimen } from "./_components/type-specimen";

export const metadata: Metadata = {
  title: "Design system",
  description: "Tokens, typography and components for the Olivia Energy site.",
  robots: { index: false, follow: false },
};

const SECTIONS: NavItem[] = [
  { id: "principles", number: "01", label: "Principles" },
  { id: "brand", number: "02", label: "Brand" },
  { id: "colour", number: "03", label: "Colour" },
  { id: "typography", number: "04", label: "Typography" },
  { id: "layout", number: "05", label: "Spacing & layout" },
  { id: "surface", number: "06", label: "Radii & elevation" },
  { id: "motion", number: "07", label: "Motion" },
  { id: "components", number: "08", label: "Components" },
  { id: "prose", number: "09", label: "Prose" },
];

const PRINCIPLES = [
  {
    title: "Evidence before emphasis",
    body: "The content is the argument. Type hierarchy, hairlines and whitespace carry the structure; colour and motion are punctuation, not persuasion.",
  },
  {
    title: "Hierarchy through type, not colour",
    body: "A serif at 400 does the talking. If a heading needs colour or weight to be noticed, the size or the spacing is wrong.",
  },
  {
    title: "One accent, spent deliberately",
    body: "The legacy red survives as a single token with a budget of one use per page. Its scarcity is what makes it mean something.",
  },
  {
    title: "Hairlines over boxes",
    body: "Boundaries are 1px lines in warm neutral. Shadows exist for genuine elevation (overlays, featured items) and nowhere else.",
  },
  {
    title: "Numbers are content",
    body: "Figures are set in the display serif with tabular numerals and sit on a rule. They are never decorated with icons or gradients.",
  },
  {
    title: "Motion is a settle, not a show",
    body: "Things arrive; they do not bounce. Short durations, decelerating curves, and nothing at all for people who ask for reduced motion.",
  },
];

const SPACING_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

export default function StyleguidePage() {
  const tokens = loadTokens();
  const tok = (name: string): Token => {
    const t = findToken(tokens, name);
    if (!t) throw new Error(`Missing token ${name}`);
    return t;
  };

  const green = tokensWithPrefix(tokens, "--color-green-");
  const neutral = tokensWithPrefix(tokens, "--color-neutral-");
  const accent = tok("--color-accent");
  const semantic = tokens.filter(
    (t) =>
      t.name.startsWith("--color-") &&
      !t.name.startsWith("--color-green-") &&
      !t.name.startsWith("--color-neutral-") &&
      t.name !== "--color-accent",
  );
  const fonts = [
    ...tokensWithPrefix(tokens, "--font-"),
    ...tokensWithPrefix(tokens, "--tracking-"),
  ];
  const textSizes = ["xl", "lg", "base", "sm", "xs"].map((s) => ({
    size: tok(`--text-${s}`),
    lh: findToken(tokens, `--text-${s}--line-height`),
  }));
  const displaySizes = ["xl", "lg", "md", "sm", "xs"].map((s) => ({
    size: tok(`--text-display-${s}`),
    lh: findToken(tokens, `--text-display-${s}--line-height`),
    ls: findToken(tokens, `--text-display-${s}--letter-spacing`),
  }));
  const spacingNamed = tokensWithPrefix(tokens, "--spacing");
  const containers = tokensWithPrefix(tokens, "--container-");
  const radii = tokensWithPrefix(tokens, "--radius-");
  const shadows = tokensWithPrefix(tokens, "--shadow-");
  const durations = tokensWithPrefix(tokens, "--duration-");
  const easings = tokensWithPrefix(tokens, "--ease-");
  const motionMisc = tokensWithPrefix(tokens, "--motion-");

  const displaySamples: Record<string, string> = {
    "--text-display-xl": "Measured, independent, accountable.",
    "--text-display-lg": "The transition is a capital allocation problem.",
    "--text-display-md": "Where the grid meets the balance sheet",
    "--text-display-sm": "Reading the 2030 pipeline honestly",
    "--text-display-xs": "Regional gas outlook, third quarter",
  };
  const textSamples: Record<string, string> = {
    "--text-xl":
      "Advisory for producers, distributors and the institutions that finance them.",
    "--text-lg":
      "We work where engineering, regulation and capital meet, and we publish what we find. Our clients pay for judgement, not for reassurance.",
    "--text-base":
      "Demand for firm, dispatchable power has not fallen with the arrival of cheap renewables; it has changed shape. Utilities that model the hour-by-hour profile of that demand, rather than the annual total, are the ones whose procurement decisions survive contact with the market.",
    "--text-sm":
      "Figure 3. Contracted capacity by delivery year, West Africa, 2024–2032. Source: company filings, Olivia Energy analysis.",
    "--text-xs": "Insight · 12 min read · Updated 3 September 2026",
  };

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
            <span className="text-ink-subtle hidden font-mono text-xs md:inline">
              September 2026
            </span>
            <Tag variant="outline">v0.1</Tag>
          </div>
        </Container>
      </header>

      <main>
        <Container size="wide">
          {/* Masthead */}
          <div className="border-line-strong border-b pt-14 pb-12 md:pt-24 md:pb-20">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-8">
                <Eyebrow>Design system · v0.1</Eyebrow>
                <h1 className="font-display text-display-xl text-ink mt-6 tracking-tight">
                  The contract for everything that follows.
                </h1>
                <p className="max-w-text text-ink-muted mt-8 text-lg leading-relaxed md:text-xl">
                  Every token, typeface and component the Olivia Energy site is
                  permitted to use. If it is not on this page, it is not in the
                  build.
                </p>
              </div>
              <dl className="border-line grid grid-cols-2 gap-x-6 gap-y-6 self-end lg:col-span-4 lg:grid-cols-1 lg:border-l lg:pl-8">
                {[
                  ["Register", "Editorial · institutional · calm"],
                  ["Typefaces", "Newsreader · Instrument Sans"],
                  [
                    "Primary",
                    `green-700 · ${tok("--color-primary").resolved.toUpperCase()}`,
                  ],
                  ["Accent budget", "One red per page"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                      {k}
                    </dt>
                    <dd className="text-ink mt-1 text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
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
                    <Reveal key={p.title} delay={i * 60}>
                      <div className="border-line border-t pt-5">
                        <p className="text-ink-subtle font-mono text-xs tabular-nums">
                          0{i + 1}
                        </p>
                        <h3 className="font-display text-display-xs text-ink mt-3 tracking-tight">
                          {p.title}
                        </h3>
                        <p className="text-ink-muted mt-3 text-sm leading-relaxed">
                          {p.body}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <GuideSub
                  title="Out of bounds"
                  description="Things the reference points never do, and neither do we."
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card variant="muted" padding="md">
                      <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                        Never
                      </p>
                      <ul className="text-ink mt-3 space-y-2 text-sm leading-relaxed">
                        {[
                          "Gradients of any kind, including on buttons and text",
                          "Glassmorphism, frosted panels, backdrop blur",
                          "Bold weights of the serif; bold anything above 24px",
                          "More than one primary button in a section",
                          "Purple, teal, or any hue not in this file",
                          "Icons as decoration beside headings",
                          "Bouncy, springy or looping UI motion; ambient motion only as Currents, in the home hero",
                        ].map((s) => (
                          <li key={s} className="flex gap-3">
                            <span
                              aria-hidden
                              className="bg-accent mt-[0.75em] h-px w-3 shrink-0"
                            />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card variant="muted" padding="md">
                      <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                        Always
                      </p>
                      <ul className="text-ink mt-3 space-y-2 text-sm leading-relaxed">
                        {[
                          "Serif for headings at 400–500, sans for everything else",
                          "A measure of 60–70 characters for running text",
                          "Tabular numerals wherever figures align",
                          "Hairline borders in the line token; shadows only for elevation",
                          "Semantic colour tokens in components, never raw steps",
                          "Reduced-motion parity: every animation has a static equivalent",
                          "Left alignment; centre only for a standalone statement",
                        ].map((s) => (
                          <li key={s} className="flex gap-3">
                            <span
                              aria-hidden
                              className="bg-primary mt-[0.75em] h-px w-3 shrink-0"
                            />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Card>
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
                      'tone="color" is the default and goes one colour by itself inside data-tone="inverse", the header over a dark hero, and the open menu.',
                      'tone="mono" takes currentColor everywhere: print, forms, anywhere colour would fight the page.',
                      "The mark is aria-hidden; a wrapping link supplies the name. The header link reads \u201cOlivia Energy, home\u201d.",
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
                  description="Full colour on light grounds. On dark or busy grounds, one colour: off-white on the inverse green, ink where colour is unavailable or would compete."
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
                lede="A deep green family derived from the mark, warm neutrals from off-white to ink, and a single red. Components only ever reference the semantic layer."
              >
                <GuideSub
                  title="Brand green"
                  description="Sampled from the legacy logo. Step 500 is the mark; 700 is the working primary because the mark itself does not pass AA as text on the canvas."
                >
                  <ColorRamp
                    tokens={green}
                    annotations={{
                      "500": "the mark",
                      "700": "primary",
                      "800": "hover",
                      "950": "inverse",
                    }}
                  />
                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    <div className="border-line bg-surface flex items-center gap-3 rounded-xs border p-3">
                      <Logo variant="mark" size={44} />
                      <div className="text-ink-muted text-xs leading-relaxed">
                        <p className="text-ink font-medium">Source: the mark</p>
                        <p>Ring #04923F is step 500 exactly</p>
                        <p>Accent #C5372B tones the mark&rsquo;s red for UI</p>
                      </div>
                    </div>
                    <Note>
                      Steps are evenly spaced in OKLCH lightness. Hue drifts
                      about eight degrees cooler from 500 to 950 so the deep
                      greens read as forest rather than olive.
                    </Note>
                  </div>
                </GuideSub>

                <GuideSub
                  title="Neutrals"
                  description="Warm, not grey. Canvas and surface differ by a hair so cards sit on the page without borders doing all the work."
                >
                  <ColorRamp
                    tokens={neutral}
                    annotations={{
                      "0": "surface",
                      "50": "canvas",
                      "200": "line",
                      "600": "muted",
                      "950": "ink",
                    }}
                  />
                </GuideSub>

                <GuideSub
                  title="Accent"
                  description="The legacy red. One token, one use per page."
                >
                  <div className="grid gap-6 md:grid-cols-12">
                    <Swatch
                      token={accent}
                      label="Accent"
                      className="md:col-span-3"
                    />
                    <div className="md:col-span-9">
                      <Card variant="default" padding="md">
                        <p className="font-display text-display-xs text-ink tracking-tight">
                          The budget
                        </p>
                        <p className="max-w-text text-ink-muted mt-3 text-sm leading-relaxed">
                          At most one instance of the accent per page: a live
                          indicator, the active item in a navigation, the mark
                          on a single eyebrow. It is never a button, a fill
                          larger than 24px, or a run of text. Its value is
                          scarcity.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-6">
                          <DemoCell label="Tag · accent">
                            <Tag variant="accent">Live</Tag>
                          </DemoCell>
                          <DemoCell label="Eyebrow · accent mark">
                            <Eyebrow accent>Now hiring</Eyebrow>
                          </DemoCell>
                          <DemoCell label="Active state">
                            <span className="text-ink inline-flex items-center gap-2 text-sm">
                              <span
                                aria-hidden
                                className="bg-accent size-1.5 rounded-full"
                              />
                              Markets open
                            </span>
                          </DemoCell>
                        </div>
                      </Card>
                    </div>
                  </div>
                </GuideSub>

                <GuideSub
                  title="Semantic tokens"
                  description="What components actually consume. Each resolves to a step above; change the step, and every use follows."
                >
                  <TokenTable
                    tokens={semantic}
                    showSwatch
                    valueLabel="Resolves to"
                  />
                  <Note>
                    Dark surfaces: add data-tone=&quot;inverse&quot; to the
                    element (the footer, a dark hero, the inverse card, the
                    mobile menu). Every semantic token remaps inside it: ink
                    becomes inverse-fg, primary becomes an off-white
                    (neutral-50, hover neutral-200) so buttons on dark stay
                    quiet rather than mint, hairlines become translucent
                    off-white. Components keep their light-surface classes and
                    need no dark variants.
                  </Note>
                </GuideSub>

                <GuideSub
                  title="Contrast"
                  description="Computed from the token file at render time. AA is the floor for text; subtle ink is restricted to meta and large text."
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContrastPair
                      fg={tok("--color-ink")}
                      bg={tok("--color-canvas")}
                      caption="Body text"
                    />
                    <ContrastPair
                      fg={tok("--color-ink-muted")}
                      bg={tok("--color-canvas")}
                      caption="Muted text"
                    />
                    <ContrastPair
                      fg={tok("--color-primary")}
                      bg={tok("--color-canvas")}
                      caption="Links"
                    />
                    <ContrastPair
                      fg={tok("--color-primary-fg")}
                      bg={tok("--color-primary")}
                      caption="Primary button"
                    />
                    <ContrastPair
                      fg={tok("--color-primary-soft-fg")}
                      bg={tok("--color-primary-soft")}
                      caption="Soft tag"
                    />
                    <ContrastPair
                      fg={tok("--color-inverse-fg")}
                      bg={tok("--color-inverse")}
                      caption="Inverse section"
                    />
                    <ContrastPair
                      fg={tok("--color-accent")}
                      bg={tok("--color-canvas")}
                      caption="Accent mark"
                    />
                    <ContrastPair
                      fg={tok("--color-ink-subtle")}
                      bg={tok("--color-canvas")}
                      caption="Meta only"
                    />
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 04 Typography */}
              <GuideSection
                id="typography"
                number="04"
                title="Typography"
                lede="An editorial serif with a true optical-size axis for display, and a precise grotesk for everything a reader has to operate. Weights are deliberately narrow."
              >
                <GuideSub
                  title="The pair"
                  description="Evaluated Fraunces, Newsreader and Source Serif 4 against Instrument Sans, Schibsted Grotesk and Inter. The full decision record is in src/app/fonts.ts."
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card padding="lg">
                      <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                        Display · Newsreader
                      </p>
                      <p className="font-display text-ink mt-6 text-[6rem] leading-none tracking-tight md:text-[7.5rem]">
                        Aa
                      </p>
                      <p className="font-display text-display-xs text-ink mt-6 leading-snug">
                        Quiet authority, drawn for the screen.
                      </p>
                      <p className="font-display text-ink-muted mt-4 text-lg leading-relaxed break-words">
                        ABCDEFGHIJKLM abcdefghijklm 0123456789 &amp;?!
                      </p>
                      <ul className="text-ink-muted mt-6 space-y-2 text-sm leading-relaxed">
                        <li>
                          Optical size axis 6–72: genuine display and text cuts
                          from one family.
                        </li>
                        <li>
                          Narrow set width and modest x-height echo the printed
                          report.
                        </li>
                        <li>
                          Weights 400 and 500 only. Italic for emphasis and
                          citations.
                        </li>
                      </ul>
                    </Card>
                    <Card padding="lg">
                      <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                        UI &amp; body · Instrument Sans
                      </p>
                      <p className="text-ink mt-6 font-sans text-[6rem] leading-none font-medium tracking-tight md:text-[7.5rem]">
                        Aa
                      </p>
                      <p className="text-ink mt-6 font-sans text-xl leading-snug">
                        Precise, compact, and quiet enough to let the serif
                        speak.
                      </p>
                      <p className="text-ink-muted mt-4 font-sans text-lg leading-relaxed break-words">
                        ABCDEFGHIJKLM abcdefghijklm 0123456789 &amp;?!
                      </p>
                      <ul className="text-ink-muted mt-6 space-y-2 text-sm leading-relaxed">
                        <li>
                          Even colour at small sizes; tabular figures for data.
                        </li>
                        <li>Not Inter: avoids the visual signature of SaaS.</li>
                        <li>
                          Weights 400, 500, 600. Emphasis in UI belongs to the
                          sans.
                        </li>
                      </ul>
                    </Card>
                  </div>
                </GuideSub>

                <GuideSub
                  title="Display scale"
                  description="Fluid between 390px and 1440px. Line height and letter spacing are part of the token, so text-display-lg is a complete setting."
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
                  </div>
                </GuideSub>

                <GuideSub
                  title="Text scale"
                  description="Fixed sizes in the sans. Body is 17px on a 1.65 line height; UI runs at 14px."
                >
                  <div className="border-line border-t">
                    {textSizes.map(({ size, lh }) => (
                      <TypeSpecimen
                        key={size.name}
                        token={size}
                        lineHeight={lh}
                        font="sans"
                        sample={textSamples[size.name] ?? size.name}
                        className="[&>p:last-child]:max-w-text"
                      />
                    ))}
                  </div>
                </GuideSub>

                <GuideSub
                  title="Details"
                  description="The small decisions that make it feel finished."
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card padding="md">
                      <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                        Numerals
                      </p>
                      <p className="text-ink-muted mt-3 text-sm">
                        Figures that align use{" "}
                        <code className="font-mono text-xs">tabular-nums</code>.
                        Both faces support it.
                      </p>
                      <div className="font-display text-display-xs text-ink mt-5 grid grid-cols-2 gap-4 leading-none">
                        <div>
                          <p className="text-ink-subtle mb-2 font-sans text-[0.6875rem]">
                            serif · tabular
                          </p>
                          <p
                            data-testid="tabular-display"
                            className="tabular-nums"
                          >
                            1,111,111
                          </p>
                          <p
                            data-testid="tabular-display"
                            className="tabular-nums"
                          >
                            0,000,000
                          </p>
                        </div>
                        <div>
                          <p className="text-ink-subtle mb-2 font-sans text-[0.6875rem]">
                            serif · proportional
                          </p>
                          <p className="proportional-nums">1,111,111</p>
                          <p className="proportional-nums">0,000,000</p>
                        </div>
                      </div>
                      <div className="text-display-xs text-ink mt-5 grid grid-cols-2 gap-4 font-sans leading-none font-medium">
                        <div>
                          <p className="text-ink-subtle mb-2 text-[0.6875rem] font-normal">
                            sans · tabular
                          </p>
                          <p
                            data-testid="tabular-sans"
                            className="tabular-nums"
                          >
                            1,111,111
                          </p>
                          <p
                            data-testid="tabular-sans"
                            className="tabular-nums"
                          >
                            0,000,000
                          </p>
                        </div>
                        <div>
                          <p className="text-ink-subtle mb-2 text-[0.6875rem] font-normal">
                            sans · proportional
                          </p>
                          <p className="proportional-nums">1,111,111</p>
                          <p className="proportional-nums">0,000,000</p>
                        </div>
                      </div>
                    </Card>
                    <Card padding="md">
                      <p className="tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase">
                        Italic, caps, measure
                      </p>
                      <p className="font-display-italic text-display-sm text-ink mt-4 leading-snug italic">
                        “What gets financed gets built.”
                      </p>
                      <p className="text-ink-muted mt-2 text-sm">
                        Serif italic for pull quotes and citations. Never for
                        emphasis inside UI.
                      </p>
                      <p className="tracking-caps text-ink-muted mt-5 font-sans text-xs font-medium uppercase">
                        Uppercase labels track at 0.14em
                      </p>
                      <p className="text-ink-muted mt-2 text-sm">
                        Eyebrows, tags and table heads. Never below 11px, never
                        on more than one line.
                      </p>
                      <div className="border-line text-ink-muted mt-5 max-w-[65ch] border-t pt-4 text-sm leading-relaxed">
                        Running text is capped at 65 characters (the{" "}
                        <code className="font-mono text-xs">max-w-text</code>{" "}
                        container). Long lines are the fastest way to make a
                        serious page feel careless.
                      </div>
                    </Card>
                  </div>
                  <div className="mt-8">
                    <TokenTable tokens={fonts} />
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 05 Spacing & layout */}
              <GuideSection
                id="layout"
                number="05"
                title="Spacing & layout"
                lede="A 4px base for components, fluid named tokens for page rhythm, and four container widths. Everything sits on a twelve-column grid."
              >
                <GuideSub
                  title="Scale"
                  description="Multiples of the 4px base. Component padding lives in 4–8; gaps between blocks in 8–16; page rhythm uses the named tokens."
                >
                  <div className="space-y-2">
                    {SPACING_STEPS.map((n) => (
                      <div key={n} className="flex items-center gap-4">
                        <span className="text-ink w-8 shrink-0 font-mono text-xs tabular-nums">
                          {n}
                        </span>
                        <span className="text-ink-subtle w-12 shrink-0 font-mono text-[0.6875rem] tabular-nums">
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
                  title="Named spacing & widths"
                  description="Fluid tokens scale with the viewport so a section break feels proportionate on a phone and on a 27-inch display."
                >
                  <TokenTable tokens={[...spacingNamed, ...containers]} />
                </GuideSub>

                <GuideSub
                  title="Containers"
                  description="Nested widths, shown at true size where the viewport allows. Reading text lives in text; grids in page; chrome and data in wide."
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
                  description="Twelve columns with a 24px gap (32px from lg). The house split is 4 + 8, or 3 + 9 on wide layouts, as used on this page."
                >
                  <div className="grid grid-cols-12 gap-3 md:gap-6 lg:gap-8">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-primary-soft h-10" />
                    ))}
                    <div className="border-line bg-surface col-span-12 h-10 border md:col-span-4" />
                    <div className="border-line bg-surface col-span-12 h-10 border md:col-span-8" />
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 06 Radii & elevation */}
              <GuideSection
                id="surface"
                number="06"
                title="Radii & elevation"
                lede="Corners are barely rounded and shadows are barely there. The hairline does the work of separating surfaces."
              >
                <GuideSub
                  title="Radii"
                  description="2px for controls, 4px for cards. Anything larger is reserved for media, and rarely."
                >
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
                    {radii.map((r) => (
                      <div key={r.name}>
                        <div
                          className="border-line-strong bg-surface aspect-square w-full border"
                          style={{ borderRadius: r.resolved }}
                        />
                        <p className="text-ink mt-3 font-mono text-xs">
                          {r.name.replace("--radius-", "rounded-")}
                        </p>
                        <p className="text-ink-subtle font-mono text-[0.6875rem]">
                          {r.resolved}
                        </p>
                        {r.description ? (
                          <p className="text-ink-muted mt-1 text-xs">
                            {r.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </GuideSub>

                <GuideSub
                  title="Shadows"
                  description="Warm ink at low alpha, two layers. Use only where something genuinely floats."
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
                        {s.description ? (
                          <p className="text-ink-muted mt-1 text-xs">
                            {s.description}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </GuideSub>
              </GuideSection>

              {/* 07 Motion */}
              <GuideSection
                id="motion"
                number="07"
                title="Motion"
                lede="Seven durations, five curves, two reveal parameters. Everything decelerates into place. Everything has a static equivalent for reduced motion."
              >
                <GuideSub
                  title="Your setting"
                  description="Detected live from the operating system. The demos below respond to it."
                >
                  <MotionStatus />
                  <Note>
                    With{" "}
                    <code className="font-mono text-xs">
                      prefers-reduced-motion: reduce
                    </code>
                    : Reveal renders in place with no transition; AnimatedNumber
                    shows its final value immediately; hover transitions
                    collapse to zero; the framer-motion context skips
                    transforms; Currents draws one still frame. Nothing is
                    hidden, nothing moves.
                  </Note>
                </GuideSub>

                <GuideSub
                  title="Durations"
                  description="Short for state, longer for arrival. Nothing in UI exceeds 400ms; the count-up is the only exception."
                >
                  <DurationDemo durations={durations} />
                  <div className="mt-8">
                    <TokenTable tokens={durations} />
                  </div>
                </GuideSub>

                <GuideSub
                  title="Easings"
                  description="Standard for UI state, out for arrival, in for exits. No springs, no overshoot."
                >
                  <EasingDemo easings={easings} />
                  <div className="mt-8">
                    <TokenTable tokens={[...easings, ...motionMisc]} />
                  </div>
                </GuideSub>

                <GuideSub
                  title="Reveal"
                  description="8px lift, 400ms, ease-out. Siblings stagger by 90ms. Triggers at 20% visibility, once."
                >
                  <RevealDemo />
                </GuideSub>

                <GuideSub
                  title="Count-up"
                  description="1400ms, ease-out, tabular numerals. Server-rendered at the final value so nothing is lost without JavaScript."
                >
                  <CounterDemo />
                </GuideSub>

                <GuideSub
                  title="Currents"
                  description="The one ambient surface: the home hero's canvas of streamlines drifting slowly along one coherent field in green-500 and green-300 at a third alpha, parted gently by the pointer, thinned to a quarter behind the text block. Once per site, never under running text, paused off screen, still under reduced motion."
                >
                  <Note>
                    Lives in{" "}
                    <code className="font-mono text-xs">
                      components/sections/home/hero-currents.tsx
                    </code>
                    . No library, one canvas, about 1 ms a frame; every trail is
                    redrawn from a short buffer after a full clear, so nothing
                    ghosts. The h1 stays the largest contentful paint. Do not
                    add a second one, and do not put it under running text.
                  </Note>
                </GuideSub>

                <GuideSub
                  title="Interaction states"
                  description="Every control answers the same way, regardless of component."
                >
                  <ul className="text-ink-muted space-y-2 text-sm leading-relaxed">
                    <li>
                      <span className="text-ink font-medium">Hover</span> —
                      colour, border or shadow at duration-fast, ease-standard.
                    </li>
                    <li>
                      <span className="text-ink font-medium">Press</span> —
                      active:translate-y-px on buttons and icon controls (no
                      lift on cards), snapped to duration-instant so it reads as
                      an immediate response, not an animation.
                    </li>
                    <li>
                      <span className="text-ink font-medium">Focus</span> — one
                      ring everywhere: ring-2 ring-focus ring-offset-2
                      ring-offset-canvas. No bare browser outlines on custom
                      controls.
                    </li>
                  </ul>
                </GuideSub>
              </GuideSection>

              {/* 08 Components */}
              <GuideSection
                id="components"
                number="08"
                title="Components"
                lede="Eleven primitives in src/components/ui. Each consumes semantic tokens only, ships with its usage notes, and is the sole way to produce its pattern."
              >
                <Demo
                  name="Button"
                  path="@/components/ui/button"
                  description="Three variants, three sizes. Renders a Next.js link when given an href."
                  usage={[
                    "One primary per section. It is the answer to “what should I do here?”",
                    "Secondary pairs with primary or stands alone for low-stakes actions.",
                    "Ghost is an inline text action with a trailing arrow and a draw-in underline on hover; use it in cards and lists.",
                    "Icons are 16px lucide glyphs, trailing by default. Never icon-only.",
                    'On an inverse surface (data-tone="inverse") primary renders off-white, not mint — see Colour → Semantic tokens.',
                  ]}
                  props={[
                    {
                      name: "variant",
                      type: '"primary" | "secondary" | "ghost"',
                    },
                    { name: "size", type: '"sm" | "md" | "lg"' },
                    {
                      name: "href",
                      type: "string",
                      note: "Switches to <Link>.",
                    },
                    {
                      name: "icon / iconPosition",
                      type: 'ReactNode / "start" | "end"',
                    },
                  ]}
                >
                  <div className="space-y-8">
                    <DemoCell label="variants">
                      <Button>Request a briefing</Button>
                      <Button variant="secondary">Download the report</Button>
                      <Button variant="ghost" icon={<ArrowRight />}>
                        Read the analysis
                      </Button>
                    </DemoCell>
                    <DemoCell label="sizes">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                    </DemoCell>
                    <DemoCell label="with icon · as link">
                      <Button
                        href="/styleguide#components"
                        icon={<ArrowUpRight />}
                      >
                        Open in new context
                      </Button>
                      <Button
                        variant="secondary"
                        icon={<Download />}
                        iconPosition="start"
                      >
                        PDF, 2.4 MB
                      </Button>
                    </DemoCell>
                    <DemoCell label="states">
                      <ButtonStates />
                    </DemoCell>
                  </div>
                </Demo>

                <Demo
                  name="Container"
                  path="@/components/ui/container"
                  description="Centres content, applies the gutter token, and caps width at one of four presets."
                  usage={[
                    "Default is page (1216px). Wrap reading text in text (672px).",
                    "Use wide for site chrome and full-width data. Never nest wide inside page.",
                    "The as prop renders section, article, header, footer, main or nav.",
                  ]}
                  props={[
                    {
                      name: "size",
                      type: '"text" | "narrow" | "page" | "wide"',
                    },
                    { name: "as", type: "ElementType" },
                  ]}
                >
                  <div className="space-y-3">
                    {(["wide", "page", "narrow", "text"] as const).map((s) => (
                      <Container
                        key={s}
                        size={s}
                        className="border-line-strong text-ink-muted border border-dashed py-2 text-center font-mono text-xs"
                      >
                        size=&quot;{s}&quot;
                      </Container>
                    ))}
                  </div>
                </Demo>

                <Demo
                  name="SectionHeading"
                  path="@/components/ui/section-heading"
                  description="Eyebrow, serif title and optional lede in the house proportions."
                  usage={[
                    "Left-aligned by default; centre only for a standalone closing statement.",
                    "Pass number for numbered chapters. The eyebrow mark disappears in favour of the numeral.",
                    'Use as="h1" exactly once per page.',
                  ]}
                  props={[
                    { name: "title / eyebrow / lede", type: "ReactNode" },
                    { name: "number", type: "string" },
                    { name: "align", type: '"left" | "center"' },
                    { name: "size", type: '"sm" | "md" | "lg"' },
                    { name: "as", type: '"h1" | "h2" | "h3"' },
                  ]}
                >
                  <div className="space-y-14">
                    <SectionHeading
                      eyebrow="Our practice"
                      number="02"
                      title="Independent advice for the capital that builds the grid"
                      lede="We advise producers, distributors and their financiers on strategy, procurement and regulatory positioning across sub-Saharan Africa."
                    />
                    <Divider />
                    <SectionHeading
                      eyebrow="Get in touch"
                      title="Start with a conversation."
                      align="center"
                      size="sm"
                      as="h3"
                    />
                  </div>
                </Demo>

                <Demo
                  name="Eyebrow"
                  path="@/components/ui/eyebrow"
                  description="Small-caps label with a hairline mark, a numeral, or nothing."
                  usage={[
                    "One eyebrow per heading. It names the section, it does not summarise it.",
                    "The accent mark is the page's single red. Use it once or not at all.",
                  ]}
                  props={[
                    { name: "number", type: "string" },
                    { name: "accent / plain", type: "boolean" },
                    { name: "as", type: "ElementType" },
                  ]}
                >
                  <div className="flex flex-wrap gap-x-12 gap-y-6">
                    <DemoCell label="default">
                      <Eyebrow>Insights</Eyebrow>
                    </DemoCell>
                    <DemoCell label="number">
                      <Eyebrow number="04">Methodology</Eyebrow>
                    </DemoCell>
                    <DemoCell label="accent">
                      <Eyebrow accent>Live data</Eyebrow>
                    </DemoCell>
                    <DemoCell label="plain">
                      <Eyebrow plain>Appendix</Eyebrow>
                    </DemoCell>
                  </div>
                </Demo>

                <Demo
                  name="Card"
                  path="@/components/ui/card"
                  description="A bounded surface. Five variants; padding presets; optional link behaviour."
                  usage={[
                    "default is the workhorse. elevated only for featured or floating items.",
                    "outline sits on coloured or photographic backgrounds. muted groups quiet content.",
                    "inverse is for dark editorial moments; keep text to inverse-fg and inverse-muted.",
                    "Pass href to make the whole card a link; the hover state is implied.",
                  ]}
                  props={[
                    {
                      name: "variant",
                      type: '"default" | "elevated" | "outline" | "muted" | "inverse"',
                    },
                    { name: "padding", type: '"none" | "sm" | "md" | "lg"' },
                    { name: "href", type: "string" },
                    { name: "interactive", type: "boolean" },
                  ]}
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(
                      [
                        "default",
                        "elevated",
                        "outline",
                        "muted",
                        "inverse",
                      ] as const
                    ).map((v) => (
                      <Card key={v} variant={v} padding="md">
                        <p
                          className={`font-mono text-[0.6875rem] ${v === "inverse" ? "text-inverse-muted" : "text-ink-subtle"}`}
                        >
                          variant=&quot;{v}&quot;
                        </p>
                        <p className="font-display text-display-xs mt-3 tracking-tight">
                          Gas-to-power in the Niger Delta
                        </p>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${v === "inverse" ? "text-inverse-muted" : "text-ink-muted"}`}
                        >
                          Where contracted capacity is going, and what it will
                          cost to deliver.
                        </p>
                      </Card>
                    ))}
                    <Card href="/styleguide#components" padding="md">
                      <p className="text-ink-subtle font-mono text-[0.6875rem]">
                        href=&quot;…&quot;
                      </p>
                      <p className="font-display text-display-xs text-ink mt-3 tracking-tight">
                        Linked card
                      </p>
                      <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                        The whole surface is the target. Hover to see the border
                        darken.
                      </p>
                      <span className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-medium">
                        Read more <ArrowRight aria-hidden className="size-4" />
                      </span>
                    </Card>
                  </div>
                </Demo>

                <Demo
                  name="Stat"
                  path="@/components/ui/stat"
                  description="A headline figure on a rule, with label, description and trend. Counts up in view."
                  usage={[
                    "Three or four in a row, aligned on the shared hairline. Never in boxes.",
                    "Keep labels to a few words; put the caveat in description.",
                    "Set animate={false} for figures that are not the point of the section.",
                  ]}
                  props={[
                    { name: "value", type: "number" },
                    {
                      name: "prefix / suffix / decimals",
                      type: "string / string / number",
                    },
                    { name: "label / description", type: "ReactNode" },
                    {
                      name: "trend",
                      type: '{ direction: "up" | "down" | "flat"; label: string }',
                    },
                    { name: "size", type: '"md" | "lg"' },
                  ]}
                >
                  <div className="grid gap-8 sm:grid-cols-3">
                    <Stat
                      value={68}
                      suffix=" GW"
                      label="Capacity advised"
                      description="Across generation and transmission mandates since 2018."
                      trend={{ direction: "up", label: "+9 GW this year" }}
                    />
                    <Stat
                      value={3.2}
                      decimals={1}
                      prefix="$"
                      suffix="bn"
                      label="Capital structured"
                      description="Project and corporate finance closed with our advice."
                    />
                    <Stat
                      value={27}
                      label="Markets"
                      description="Countries with active or completed engagements."
                      trend={{ direction: "flat", label: "Unchanged" }}
                    />
                  </div>
                </Demo>

                <Demo
                  name="Tag"
                  path="@/components/ui/tag"
                  description="Compact categorical label. Square, uppercase, tracked."
                  usage={[
                    "default for categories, outline for meta.",
                    "primary is a quiet, text-only treatment (no fill) for a positive or published status — mint pills are gone from the pages.",
                    "accent is the page's single red: one live or active state, nothing else.",
                  ]}
                  props={[
                    {
                      name: "variant",
                      type: '"default" | "outline" | "primary" | "accent"',
                    },
                    { name: "size", type: '"sm" | "md" | "lg"' },
                  ]}
                >
                  <div className="flex flex-wrap gap-x-12 gap-y-6">
                    <DemoCell label="md">
                      <Tag>Insight</Tag>
                      <Tag variant="outline">PDF</Tag>
                      <Tag variant="primary">Published</Tag>
                      <Tag variant="accent">Live</Tag>
                    </DemoCell>
                    <DemoCell label="sm">
                      <Tag size="sm">Insight</Tag>
                      <Tag size="sm" variant="outline">
                        PDF
                      </Tag>
                      <Tag size="sm" variant="primary">
                        Published
                      </Tag>
                      <Tag size="sm" variant="accent">
                        Live
                      </Tag>
                    </DemoCell>
                  </div>
                </Demo>

                <Demo
                  name="Divider"
                  path="@/components/ui/divider"
                  description="A hairline, optionally interrupted by a label."
                  usage={[
                    "Use between unrelated blocks inside a section. Sections themselves use the strong line.",
                    "Labelled dividers introduce a run of items (“Related”, “Appendix”).",
                  ]}
                  props={[
                    { name: "label", type: "string" },
                    { name: "strong", type: "boolean" },
                  ]}
                >
                  <div className="space-y-8">
                    <Divider />
                    <Divider strong />
                    <Divider label="Related reading" />
                  </div>
                </Demo>

                <Demo
                  name="AnimatedNumber"
                  path="@/components/ui/animated-number"
                  description="Counts from zero to a value when it enters the viewport. Used inside Stat, available on its own."
                  usage={[
                    "Server-renders the final value; animates only on the client with motion allowed.",
                    "Reads --duration-counter and --ease-out from the token file at run time.",
                    "Wrap in the display face with leading-none for headline figures.",
                  ]}
                  props={[
                    { name: "value", type: "number" },
                    {
                      name: "decimals / prefix / suffix",
                      type: "number / string / string",
                    },
                    { name: "format", type: "Intl.NumberFormatOptions" },
                    { name: "once", type: "boolean" },
                  ]}
                >
                  <CounterDemo />
                </Demo>

                <Demo
                  name="Reveal"
                  path="@/components/ui/reveal"
                  description="Fades and lifts children into place on scroll. Static under reduced motion; visible without JavaScript."
                  usage={[
                    "Wrap blocks, not words. One Reveal per card, paragraph group or figure.",
                    "Stagger siblings with delay in multiples of the stagger token (90ms).",
                    "Do not nest Reveals. Do not reveal above-the-fold content.",
                  ]}
                  props={[
                    { name: "delay", type: "number (ms)" },
                    { name: "once", type: "boolean" },
                    { name: "amount", type: "number (0–1)" },
                    {
                      name: "as",
                      type: '"div" | "section" | "article" | "li" | "figure"',
                    },
                  ]}
                >
                  <RevealDemo />
                </Demo>

                <Demo
                  name="FormField, TextInput, TextArea"
                  path="@/components/ui/form-field"
                  description="Public-site form controls: a label row with an optional marker, 48px inputs, and the error announced in place of the hint. Used by the contact form."
                  usage={[
                    "Validate with zod on submit and pass the first message per field as error; the control takes aria-invalid and aria-describedby.",
                    "Accent is reserved for the invalid state. Success is a panel that replaces the form, never a green field.",
                    "Keep hints to one line; the error replaces the hint, so the layout does not jump.",
                  ]}
                  props={[
                    { name: "label / htmlFor", type: "ReactNode / string" },
                    { name: "hint / error", type: "ReactNode / string" },
                    {
                      name: "optional / optionalLabel",
                      type: "boolean / string",
                    },
                  ]}
                >
                  <div className="grid max-w-xl gap-6">
                    <FormField label="Name" htmlFor="demo-name">
                      <TextInput
                        id="demo-name"
                        defaultValue="Ada Okafor"
                        autoComplete="off"
                      />
                    </FormField>
                    <FormField
                      label="Email"
                      htmlFor="demo-email"
                      error="Enter a valid email address."
                    >
                      <TextInput
                        id="demo-email"
                        type="email"
                        defaultValue="ada@"
                        aria-invalid
                        aria-describedby="demo-email-error"
                        autoComplete="off"
                      />
                    </FormField>
                    <FormField
                      label="Message"
                      htmlFor="demo-message"
                      hint="What is the decision, and when does it need to be made?"
                    >
                      <TextArea
                        id="demo-message"
                        rows={3}
                        placeholder="A sentence or two is enough."
                      />
                    </FormField>
                  </div>
                </Demo>
              </GuideSection>

              {/* 09 Prose */}
              <GuideSection
                id="prose"
                number="09"
                title="Prose"
                lede="Article typography for insights, reports and anything authored in the editor. One wrapper, every element styled from tokens."
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
                    <p className="lede">
                      Sub-Saharan Africa will add more contracted generation
                      this decade than in the previous three combined. Most of
                      it will be financed by institutions that have never
                      underwritten an African power asset.
                    </p>
                    <h2>The shape of demand</h2>
                    <p>
                      Demand for firm, dispatchable power has not fallen with
                      the arrival of cheap renewables; it has changed shape.
                      Utilities that model the <em>hour-by-hour</em> profile of
                      that demand, rather than the annual total, are the ones
                      whose procurement decisions survive contact with the
                      market. The rest discover the difference at the first dry
                      season.
                    </p>
                    <p>
                      Three things follow from this. Each is unremarkable on its
                      own; together they explain most of the variance in project
                      outcomes we have reviewed since 2018.
                    </p>
                    <ul>
                      <li>
                        Capacity payments must reflect availability during the
                        evening ramp, not annual load factor.
                      </li>
                      <li>
                        Gas supply agreements need take-or-pay terms that track
                        the same ramp, or the generator carries the risk twice.
                      </li>
                      <li>
                        Currency convertibility, not tariff level, is the
                        binding constraint on{" "}
                        <a href="#prose">foreign participation</a>.
                      </li>
                    </ul>
                    <blockquote>
                      <p>
                        What gets financed gets built. The question is never
                        whether a project is bankable in principle, but which
                        balance sheet is willing to hold the risk between
                        financial close and first power.
                      </p>
                      <cite>Olivia Energy, West Africa Power Review 2026</cite>
                    </blockquote>
                    <h3>Contracted capacity by delivery year</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Delivery year</th>
                          <th className="num">Capacity (MW)</th>
                          <th className="num">Share financed</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>2026</td>
                          <td className="num">1,240</td>
                          <td className="num">78%</td>
                        </tr>
                        <tr>
                          <td>2027</td>
                          <td className="num">2,105</td>
                          <td className="num">61%</td>
                        </tr>
                        <tr>
                          <td>2028</td>
                          <td className="num">3,380</td>
                          <td className="num">42%</td>
                        </tr>
                        <tr>
                          <td>2029</td>
                          <td className="num">2,960</td>
                          <td className="num">19%</td>
                        </tr>
                      </tbody>
                    </table>
                    <p>
                      Figures are indicative and drawn from public filings; see
                      the methodology note in <code>appendix-b.md</code>. Where
                      a project has reached financial close but not notice to
                      proceed, we count it as financed.
                    </p>
                    <hr />
                    <h4>About this note</h4>
                    <p>
                      <small>
                        Published 3 September 2026. Contact the authors for the
                        underlying dataset.
                      </small>
                    </p>
                  </Prose>
                </Demo>
              </GuideSection>
            </div>
          </div>
        </Container>
      </main>

      <footer className="mt-section-sm border-line-strong border-t">
        <Container
          size="wide"
          className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between"
        >
          <div className="text-ink-muted text-sm">
            <p className="text-ink font-medium">
              Olivia Energy design system · v0.1
            </p>
            <p className="text-ink-subtle mt-1 font-mono text-xs">
              tokens: src/styles/tokens.css · components: src/components/ui ·
              fonts: src/app/fonts.ts · mark: src/lib/brand/mark.ts
            </p>
          </div>
          <Button variant="ghost" href="#top" icon={<ArrowUpRight />}>
            Back to top
          </Button>
        </Container>
      </footer>
    </div>
  );
}
