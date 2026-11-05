import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Display, Turn } from "@/components/ui/display";
import { Divider } from "@/components/ui/divider";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FigTag } from "@/components/ui/fig-tag";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { FormField, TextArea, TextInput } from "@/components/ui/form-field";
import { Glyph } from "@/components/ui/glyph";
import { Lede } from "@/components/ui/lede";
import { RingMark } from "@/components/ui/ring";
import { Source } from "@/components/ui/source";
import { Stat } from "@/components/ui/stat";
import { Tag } from "@/components/ui/tag";
import {
  MISSION,
  PHILOSOPHY,
  TAGLINE,
  VALUES_LIST,
  WHY_OLIVIA,
} from "@/content/brand";
import { HOME_EVIDENCE, HOME_HERO, RETRIEVED } from "@/content/home";
import { NAV_CTA, SERVICES } from "@/content/site";
import { Demo, DemoCell } from "./demo";
import { Code } from "./frame";
import { ButtonStates, CounterDemo } from "./motion-demos";

const tile = HOME_EVIDENCE.tiles[0];
const second = HOME_EVIDENCE.tiles[1];

/** The UI primitives in src/components/ui, each with usage notes and props. */
export function ComponentsSheet() {
  return (
    <>
      <Demo
        name="Button"
        path="@/components/ui/button"
        description="Three variants and three sizes. Renders a Next.js link when given an href. A pill, with the arrow inside its own ring."
        usage={[
          "One primary per section: it answers what to do here. It is flood green on paper, lime on night, paper on green and red, ink on lime.",
          "Secondary is an outline pill that pairs with primary or stands alone.",
          "Text is an inline action with a draw-in underline; use it in cards and lists.",
          "arrow adds the ring. external opens a new tab and says so to screen readers.",
          "Ghost, size sm, icon and iconPosition still work for the older sections.",
        ]}
        props={[
          { name: "variant", type: '"primary" | "secondary" | "text"' },
          { name: "size", type: '"md" | "lg"', note: "sm kept for old code." },
          { name: "href", type: "string", note: "Switches to <Link>." },
          { name: "arrow / external", type: "boolean" },
        ]}
      >
        <div className="flex flex-col gap-8">
          <DemoCell label="variants">
            <Button href={NAV_CTA.href} arrow>
              {NAV_CTA.label}
            </Button>
            <Button href={HOME_HERO.primaryCta.href} variant="secondary" arrow>
              {HOME_HERO.primaryCta.label}
            </Button>
            <Button href={HOME_HERO.secondaryCta.href} variant="text" arrow>
              {HOME_HERO.secondaryCta.label}
            </Button>
          </DemoCell>
          <DemoCell label="sizes">
            <Button href={NAV_CTA.href}>{NAV_CTA.label}</Button>
            <Button href={NAV_CTA.href} size="lg">
              {NAV_CTA.label}
            </Button>
          </DemoCell>
          <DemoCell label="external, with icon">
            <Button
              href={tile.source.url ?? "#"}
              variant="secondary"
              external
              icon={<ArrowUpRight />}
            >
              {tile.source.org}
            </Button>
            <Button
              href={second.source.url ?? "#"}
              variant="secondary"
              icon={<Download />}
              iconPosition="start"
            >
              {second.source.org}
            </Button>
          </DemoCell>
          <DemoCell label="states">
            <ButtonStates />
          </DemoCell>
        </div>
      </Demo>

      <Demo
        name="Display, Turn and Lede"
        path="@/components/ui/display, lede"
        description="Every headline is Newsreader at 400. The turn is the one italic word or phrase, once per screen."
        usage={[
          "Six sizes: 2xl is the home H1 only; xl is the inner-page H1 and closing statements; lg the section H2.",
          "reveal=mask clips the heading up as it enters. Never on an above-the-fold H1.",
          "The turn takes its colour from the surface: lime on night, pale lime on photographs, flood green on paper, ink on lime, white on green and red.",
          "A lede is text-xl, muted, at most 42 characters a line.",
        ]}
        props={[
          { name: "Display.as", type: '"h1" | "h2" | "h3" | "p"' },
          {
            name: "Display.size",
            type: '"2xl" | "xl" | "lg" | "md" | "sm" | "xs"',
          },
          { name: "Display.reveal", type: '"mask" | "none"' },
          {
            name: "Turn.block",
            type: "boolean",
            note: "Sets the turn on its own line.",
          },
        ]}
      >
        <div className="flex flex-col gap-6">
          <Display as="p" size="lg" className="max-w-[18ch]">
            {TAGLINE.line1} <Turn block>{TAGLINE.line2}</Turn>
          </Display>
          <Lede>{PHILOSOPHY.lines[0]}</Lede>
        </div>
      </Demo>

      <Demo
        name="Eyebrow"
        path="@/components/ui/eyebrow"
        description="The 12px label above a heading: uppercase, 600, tracked, in the surface's muted ink."
        usage={[
          "One eyebrow per heading. It names the section; it does not summarise it.",
          "The rule is the default mark; flame swaps in the mark's flame; number takes the section numeral.",
        ]}
        props={[
          { name: "flame / number", type: "boolean / string" },
          { name: "as", type: '"p" | "span" | "h2" | "h3"' },
        ]}
      >
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <DemoCell label="default">
            <Eyebrow>{HOME_EVIDENCE.eyebrow}</Eyebrow>
          </DemoCell>
          <DemoCell label="flame">
            <Eyebrow flame>{PHILOSOPHY.eyebrow}</Eyebrow>
          </DemoCell>
          <DemoCell label="number">
            <Eyebrow number={SERVICES[0].number}>{SERVICES[0].title}</Eyebrow>
          </DemoCell>
        </div>
      </Demo>

      <Demo
        name="Chip, FigTag, Tag"
        path="@/components/ui/chip, fig-tag, tag"
        description="Pills are for buttons, chips, the Fig. tag and the gap pill. 12px uppercase 600, 28px tall."
        usage={[
          "outline is the default (topic and format chips, Target, Context). solid marks a selected chip.",
          "gap is the solid red gap pill: the only solid red on a page. opening is the opening that answers a gap.",
          "Tag is the older component and keeps working; new work uses Chip.",
        ]}
        props={[
          { name: "tone", type: '"outline" | "solid" | "gap" | "opening"' },
          { name: "href", type: "string", note: "Renders a link." },
          { name: "FigTag.n", type: "number" },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <FigTag n={HOME_EVIDENCE.figure.n} />
          <Chip>{tile.tag}</Chip>
          <Chip tone="solid">{SERVICES[0].short}</Chip>
          <Chip tone="gap">{tile.tag}</Chip>
          <Chip tone="opening">{HOME_EVIDENCE.tiles[3]?.tag ?? tile.tag}</Chip>
          <Chip href="#components">{SERVICES[1].short}</Chip>
          <Tag>{SERVICES[2].short}</Tag>
          <Tag variant="outline">{SERVICES[3].short}</Tag>
          <Tag variant="accent">{tile.tag}</Tag>
        </div>
      </Demo>

      <Demo
        name="Card"
        path="@/components/ui/card"
        description="A bounded surface in the shoulder shape. A single 1px line is the only edge; no shadow."
        usage={[
          "default sits on the surface token; elevated takes the stronger line; outline is transparent; muted fills quietly. Put a dark card in a night surface instead of using inverse, which is kept for older sections.",
          "Pass href to make the whole card a link; hover and focus are implied.",
        ]}
        props={[
          {
            name: "variant",
            type: '"default" | "elevated" | "outline" | "muted"',
          },
          { name: "padding", type: '"none" | "sm" | "md" | "lg"' },
          { name: "href", type: "string" },
        ]}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(["default", "elevated", "outline", "muted"] as const).map((v) => (
            <Card key={v} variant={v} padding="sm">
              <div className="flex items-start justify-between gap-4">
                <Glyph name={VALUES_LIST[0].glyph} />
                <Chip>{v}</Chip>
              </div>
              <p className="font-display text-display-xs mt-5">
                {VALUES_LIST[0].name}
              </p>
              <p className="mt-2 text-sm opacity-80">{VALUES_LIST[0].text}</p>
            </Card>
          ))}
          <Card href="#components" padding="sm">
            <p className="font-display text-display-xs">
              {VALUES_LIST[1].name}
            </p>
            <p className="text-ink-muted mt-2 text-sm">{VALUES_LIST[1].text}</p>
            <span className="text-primary mt-4 inline-flex text-sm font-medium">
              {NAV_CTA.label}
            </span>
          </Card>
        </div>
      </Demo>

      <Demo
        name="Stat and Source"
        path="@/components/ui/stat, source"
        description="A headline figure on a rule, with its source line underneath. Numerals are Newsreader with lining tabular figures."
        usage={[
          "Every figure carries a Source: organisation, title, series code, licence and the retrieval date.",
          "Numbers come from the data files or FACTS, never from the component.",
          "animate={false} for a figure that is not the point of its section.",
        ]}
        props={[
          { name: "value", type: "number" },
          {
            name: "prefix / suffix / decimals",
            type: "string / string / number",
          },
          { name: "Source.sources", type: "SourceRef | SourceRef[]" },
          { name: "Source.retrieved", type: "ISO date" },
        ]}
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Stat
              value={tile.numeral}
              suffix={tile.suffix}
              label={tile.unit ?? tile.tag}
              description={tile.caption}
              animate={false}
              size="lg"
            />
            <Source sources={tile.source} retrieved={RETRIEVED} />
          </div>
          <div className="flex flex-col gap-4">
            <Source
              sources={[tile.source, second.source]}
              retrieved={RETRIEVED}
            />
          </div>
        </div>
      </Demo>

      <Demo
        name="FlameBullet and RingMark"
        path="@/components/ui/flame-bullet, ring"
        description="The mark's own parts as bullets and ornaments. The ring closes once, in the last band of every page."
        usage={[
          "FlameBullet is the list bullet and the Why Olivia marker; it takes currentColor.",
          "RingMark animate=close draws the gap shut; draw strokes it in; none is static.",
        ]}
        props={[
          { name: "RingMark.size / stroke / gap", type: "number" },
          { name: "RingMark.animate", type: '"close" | "draw" | "none"' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-8">
          <span className="font-display text-display-sm inline-flex items-center gap-3">
            <FlameBullet className="text-primary" />
            {WHY_OLIVIA.closing}
          </span>
          <RingMark size={72} animate="none" />
          <RingMark size={72} gap={0} animate="none" />
        </div>
      </Demo>

      <Demo
        name="Container and Divider"
        path="@/components/ui/container, divider"
        description="The page container is 1296px with the fluid gutter. A hairline separates blocks."
        usage={[
          "size: text 672px for reading, narrow 896px, page 1296px, wide 1408px for chrome and data.",
          "Divider is a 1px line; with a label it takes the eyebrow style.",
        ]}
        props={[
          {
            name: "Container.size",
            type: '"text" | "narrow" | "page" | "wide"',
          },
          { name: "Divider.label / strong", type: "string / boolean" },
        ]}
      >
        <div className="flex flex-col gap-3">
          {(["wide", "page", "narrow", "text"] as const).map((s) => (
            <Container
              key={s}
              size={s}
              className="border-line-strong text-ink-muted border border-dashed py-2 text-center"
            >
              <Code>size=&quot;{s}&quot;</Code>
            </Container>
          ))}
          <Divider />
          <Divider strong />
          <Divider label={MISSION.eyebrow} />
        </div>
      </Demo>

      <Demo
        name="AnimatedNumber"
        path="@/components/ui/animated-number"
        description="Counts to its value in view. The server renders the final number, so nothing is lost without JavaScript."
        usage={[
          "Reads --duration-counter and --ease-out from the token file at run time.",
          "en-GB grouping; prefix, suffix and decimals as props.",
        ]}
        props={[
          { name: "value", type: "number" },
          {
            name: "decimals / prefix / suffix",
            type: "number / string / string",
          },
        ]}
      >
        <CounterDemo />
      </Demo>

      <Demo
        name="FormField, TextInput, TextArea"
        path="@/components/ui/form-field"
        description="Public-site form controls: a label row, 48px inputs, and the error announced in place of the hint."
        usage={[
          "The error takes the surface's error colour: red ink on paper, never the flood red.",
          "Success is a panel that replaces the form, never a green field.",
        ]}
        props={[
          { name: "label / htmlFor", type: "ReactNode / string" },
          { name: "hint / error", type: "ReactNode / string" },
          { name: "optional", type: "boolean" },
        ]}
      >
        <div className="grid max-w-xl gap-6">
          <FormField label="Name" htmlFor="guide-name">
            <TextInput id="guide-name" autoComplete="off" />
          </FormField>
          <FormField
            label="Email"
            htmlFor="guide-email"
            error="Enter an email address."
          >
            <TextInput
              id="guide-email"
              type="email"
              aria-invalid
              aria-describedby="guide-email-error"
              autoComplete="off"
            />
          </FormField>
          <FormField label="Message" htmlFor="guide-message" optional>
            <TextArea id="guide-message" rows={3} />
          </FormField>
        </div>
      </Demo>
    </>
  );
}
