import type { CSSProperties } from "react";
import { Chip } from "@/components/ui/chip";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Glyph } from "@/components/ui/glyph";
import { GLYPH_NAMES } from "@/components/ui/glyphs";
import { RingMark } from "@/components/ui/ring";
import { ShoulderImage } from "@/components/ui/shoulder-image";
import { PHILOSOPHY, PILLARS, VALUES_LIST, WHY_OLIVIA } from "@/content/brand";
import { HOME_EVIDENCE } from "@/content/home";
import { SERVICES } from "@/content/site";
import type { GlyphName } from "@/types/contracts";
import type { Token } from "@/lib/utils/tokens";
import { Code, Row, SurfaceFrame } from "./frame";
import { Replay } from "./replay";

/** The label each glyph stands for, from the content that uses it. */
const GLYPH_LABELS: Record<GlyphName, string> = Object.fromEntries([
  ...SERVICES.map((s) => [s.glyph, s.title]),
  ...PILLARS.items.map((p) => [p.glyph, p.name]),
  ...VALUES_LIST.map((v) => [v.glyph, v.name]),
]) as Record<GlyphName, string>;

/** The fourteen glyphs at 96 and 48 on paper, the size ladder, then one row per flood. */
export function GlyphSheet() {
  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
        {GLYPH_NAMES.map((name) => (
          <li key={name} className="flex flex-col items-start gap-4">
            <div className="flex items-end gap-4">
              <Glyph name={name} size={96} />
              <Glyph name={name} size={48} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-ink text-sm font-medium">
                {GLYPH_LABELS[name]}
              </span>
              <code className="source-line text-ink-muted">{name}</code>
            </div>
          </li>
        ))}
      </ul>
      <Row label="Size ladder">
        <div className="flex flex-wrap items-end gap-5">
          {[24, 32, 48, 64, 96, 128].map((n) => (
            <div key={n} className="flex flex-col items-start gap-2">
              <Glyph name="transition" size={n} />
              <span className="source-line text-ink-muted">{n}px</span>
            </div>
          ))}
        </div>
      </Row>
      <Row label="On each flood">
        <div className="grid gap-4">
          {(["green", "night", "lime", "red"] as const).map((surface) => (
            <SurfaceFrame key={surface} surface={surface} className="p-5">
              <div className="flex flex-wrap items-center gap-4">
                <Chip tone="solid">{surface}</Chip>
                {GLYPH_NAMES.map((name) => (
                  <Glyph key={name} name={name} size={32} />
                ))}
              </div>
            </SurfaceFrame>
          ))}
        </div>
      </Row>
    </div>
  );
}

/** The shoulder at its three sizes, the pill, and photographs cut to it. */
export function ShapeSheet({ tokens }: { tokens: Token[] }) {
  const value = (name: string) =>
    tokens.find((t) => t.name === name)?.value ?? "";
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 sm:grid-cols-4">
        {(
          [
            ["shoulder-sm", "--radius-shoulder-sm"],
            ["shoulder", "--radius-shoulder"],
            ["shoulder-lg", "--radius-shoulder-lg"],
          ] as const
        ).map(([cls, token]) => (
          <div key={cls} className="flex flex-col gap-3">
            <div
              className={`${cls} bg-surface border-line aspect-[4/3] border`}
            />
            <Code>{cls}</Code>
            <span className="source-line text-ink-muted break-all">
              {token}: {value(token)}
            </span>
          </div>
        ))}
        <div className="flex flex-col gap-3">
          <div className="border-line-strong rounded-pill flex aspect-[4/3] items-center justify-center border">
            <Chip tone="outline">Fig. 1</Chip>
          </div>
          <Code>rounded-pill</Code>
          <span className="source-line text-ink-muted break-all">
            --radius-pill: {value("--radius-pill")}
          </span>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ShoulderImage
            photo="tarfaya-wind"
            ratio="4/5"
            sizes="(min-width: 1024px) 28vw, 100vw"
            caption="below"
          />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-8">
          <ShoulderImage
            photo="abuja-lightpoles"
            ratio="21/9"
            corner="lg"
            sizes="(min-width: 1024px) 56vw, 100vw"
            caption="below"
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <ShoulderImage
              photo="lagos-lekki-night"
              ratio="16/9"
              corner="md"
              sizes="(min-width: 1024px) 28vw, 100vw"
            />
            <ShoulderImage
              photo="noor-solar"
              ratio="1/1"
              corner="sm"
              sizes="(min-width: 1024px) 28vw, 100vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* A line with its hatch, end markers and a gap pill: enough to see sweep, hatch and pop. */
function SweepDemo() {
  return (
    <div className="figure-scope relative">
      <svg
        viewBox="0 0 600 200"
        className="h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern
            id="guide-sweep-hatch"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="var(--hatch-color)"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <line
          x1="0"
          y1="180"
          x2="600"
          y2="180"
          stroke="var(--chart-axis)"
          strokeWidth="1"
        />
        <path
          d="M0 170C150 160 300 150 450 90S560 30 600 20V60C540 70 480 110 420 120S150 170 0 180Z"
          fill="url(#guide-sweep-hatch)"
          className="hatch"
        />
        <path
          d="M0 170C150 160 300 150 450 90S560 30 600 20"
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="sweep"
        />
        <path
          d="M0 180C150 170 300 150 420 120S540 70 600 60"
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="sweep"
        />
        <circle
          cx="600"
          cy="20"
          r="6"
          fill="var(--color-canvas)"
          stroke="var(--chart-1)"
          strokeWidth="2"
          className="pop"
        />
        <circle
          cx="600"
          cy="60"
          r="6"
          fill="var(--color-canvas)"
          stroke="var(--chart-2)"
          strokeWidth="2"
          className="pop"
        />
      </svg>
      <div className="pop absolute top-[36%] right-[8%]">
        <Chip tone="gap">{HOME_EVIDENCE.tiles[0].tag}</Chip>
      </div>
    </div>
  );
}

type MotionRow = {
  name: string;
  moves: string;
  /** A duration token for a load-time motion, a range token for a scroll-driven one. */
  duration: string;
  ease: string;
  trigger: string;
};

/** DESIGN.md, Motion, with each value read from its token. */
const MOTION_ROWS: readonly MotionRow[] = [
  {
    name: "wipe",
    moves: "A photograph's frame clips up; the image settles from 1.08",
    duration: "--range-wipe",
    ease: "--ease-in-out",
    trigger: "scroll, as it enters",
  },
  {
    name: "parallax",
    moves: "A photograph drifts a tenth of its height through its frame",
    duration: "--range-wipe-inner",
    ease: "--ease-linear",
    trigger: "scroll, the whole crossing",
  },
  {
    name: "draw",
    moves: "Glyph, ring and timeline strokes draw themselves",
    duration: "--range-draw-glyph",
    ease: "--ease-in-out",
    trigger: "scroll, as it enters",
  },
  {
    name: "sweep, hatch, pop",
    moves:
      "Chart lines open from the left; the gap hatch and the labels follow",
    duration: "--range-sweep",
    ease: "--ease-in-out",
    trigger: "scroll, as it enters",
  },
  {
    name: "ring-close",
    moves: "The ring's gap closes (every close band)",
    duration: "--range-draw",
    ease: "--ease-in-out",
    trigger: "scroll, as it enters",
  },
  {
    name: "assemble",
    moves: "The Insights cover wall: each cover slides in from its side",
    duration: "--range-assemble",
    ease: "--ease-out",
    trigger: "scroll, as it enters",
  },
  {
    name: "figure-lead",
    moves: "The Research timeline and the Contact map, once on load from 64rem",
    duration: "--duration-draw",
    ease: "--ease-in-out",
    trigger: "load",
  },
  {
    name: "light",
    moves: "Why Olivia line turns white; flame bullet grows",
    duration: "--duration-light",
    ease: "--ease-out",
    trigger: "the home scene's scroll controller",
  },
  {
    name: "settle",
    moves: "Hero photograph scales from 1.06, once on load",
    duration: "--duration-settle",
    ease: "--ease-out",
    trigger: "load",
  },
  {
    name: "rise",
    moves: "The home hero's turn, lede, actions and card, 90ms apart",
    duration: "--duration-rise",
    ease: "--ease-out",
    trigger: "load",
  },
  {
    name: "page",
    moves:
      "Route change: the old page leaves, the new one lifts in, the H1 morphs",
    duration: "--duration-page",
    ease: "--ease-out",
    trigger: "navigation",
  },
];

/** The motion table, each duration and easing read from the token file. */
export function MotionTable({ tokens }: { tokens: Token[] }) {
  const value = (name: string) =>
    tokens.find((t) => t.name === name)?.value ?? "missing";
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <caption className="sr-only">
          Each named motion with what it moves, its duration or scroll-range
          token and easing token, and what triggers it.
        </caption>
        <thead>
          <tr className="border-line-strong border-b text-left">
            {[
              "Name",
              "What moves",
              "Duration or range",
              "Easing",
              "Trigger",
            ].map((h) => (
              <th key={h} className="label text-ink-muted py-2 pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOTION_ROWS.map((r) => (
            <tr key={r.name} className="border-line border-b align-top">
              <td className="text-ink py-2.5 pr-4 font-mono text-xs">
                {r.name}
              </td>
              <td className="text-ink-muted py-2.5 pr-4">{r.moves}</td>
              <td className="py-2.5 pr-4 font-mono text-xs whitespace-nowrap">
                <span className="text-ink">{value(r.duration)}</span>
                <span className="text-ink-subtle block">{r.duration}</span>
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs whitespace-nowrap">
                <span className="text-ink-muted block max-w-[16rem] truncate">
                  {value(r.ease)}
                </span>
                <span className="text-ink-subtle block">{r.ease}</span>
              </td>
              <td className="text-ink-muted py-2.5 whitespace-nowrap">
                {r.trigger}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The scroll-driven reveals, live. Scroll this sheet into view to see them;
 * Replay re-mounts the block, which resets each view timeline to the
 * block's current position on screen.
 */
export function MotionStages() {
  return (
    <div className="flex flex-col gap-8">
      <SurfaceFrame surface="night" className="p-6 md:p-10">
        <Replay>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Code>text: static</Code>
              <Display as="p" size="md">
                {PHILOSOPHY.statement}
              </Display>
            </div>
            <div className="flex flex-col gap-4">
              <Code>none: headings, ledes, lists and cards never animate</Code>
              <ul className="flex flex-col gap-3">
                {PHILOSOPHY.lines.map((line) => (
                  <li key={line} className="text-lg">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <Code>
                draw: glyphs over --range-draw-glyph, rings over --range-draw
              </Code>
              <div className="flex flex-wrap items-center gap-5">
                {VALUES_LIST.map((v) => (
                  <Glyph key={v.glyph} name={v.glyph} size={48} draw />
                ))}
              </div>
              <div className="flex items-center gap-6">
                <RingMark size={96} animate="draw" />
                <RingMark size={96} animate="close" />
                <Code>draw, ring-close</Code>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Code>sweep, then hatch, then pop, on one figure-scope</Code>
              <SweepDemo />
            </div>
          </div>
        </Replay>
      </SurfaceFrame>
      <SurfaceFrame surface="green" className="p-6 md:p-10">
        <Replay>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Eyebrow as="p">{WHY_OLIVIA.heading}</Eyebrow>
              <Code>light: unlit, then lit, 60ms apart</Code>
              <ul className="flex flex-col gap-3">
                {WHY_OLIVIA.lines.slice(0, 5).map((line, i) => (
                  <li
                    key={line}
                    data-lit="true"
                    className="light font-display text-display-xs flex items-baseline gap-3"
                    style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties}
                  >
                    <FlameBullet className="text-brand-lime" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <Code>wipe and parallax</Code>
              <ShoulderImage
                photo="ethiopia-lineman"
                ratio="4/5"
                reveal="wipe"
                sizes="(min-width: 1024px) 30vw, 100vw"
                caption="below"
                className="max-w-[20rem]"
              />
            </div>
          </div>
        </Replay>
      </SurfaceFrame>
    </div>
  );
}
