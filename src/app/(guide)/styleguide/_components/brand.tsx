import type { CSSProperties, ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import {
  FAVICON,
  MARK_COLORS,
  MARK_LOCKUP,
  MARK_RULES,
} from "@/lib/brand/mark";
import { cn } from "@/lib/utils/cn";

const label =
  "tracking-caps text-ink-subtle font-sans text-xs font-medium uppercase";

/** A captioned tile for a logo specimen. */
function Tile({
  caption,
  note,
  className,
  children,
  tone,
}: {
  caption: string;
  note?: string;
  className?: string;
  children: ReactNode;
  tone?: "inverse";
}) {
  return (
    <figure className="border-line flex flex-col overflow-hidden rounded-xs border">
      <div
        data-tone={tone}
        className={cn(
          "flex min-h-40 flex-1 items-center justify-center px-6 py-10",
          tone === "inverse" ? "bg-inverse text-ink" : "bg-canvas text-ink",
          className,
        )}
      >
        {children}
      </div>
      <figcaption className="border-line bg-surface border-t px-4 py-3">
        <p className="text-ink text-sm font-medium">{caption}</p>
        {note ? (
          <p className="text-ink-muted mt-0.5 text-xs leading-relaxed">
            {note}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}

const SWATCHES: {
  name: string;
  hex: string;
  note: string;
}[] = [
  {
    name: "Ring",
    hex: MARK_COLORS.green,
    note: "Equal to green-500, the one mark colour that is also a token.",
  },
  {
    name: "Middle tongue",
    hex: MARK_COLORS.red,
    note: "The mark's own red. Interface red is the accent, #C5372B.",
  },
  {
    name: "Outer tongue",
    hex: MARK_COLORS.lime,
    note: "Lime lives in the mark and nowhere else on the site.",
  },
];

/** The mark large, its three colours, and the legacy artwork it came from. */
export function MarkAnatomy({ legacy }: { legacy: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="border-line bg-canvas flex items-center justify-center rounded-xs border px-6 py-12 lg:col-span-5">
        <Logo variant="mark" size={220} />
      </div>
      <div className="flex flex-col gap-6 lg:col-span-7">
        <ul className="border-line divide-line divide-y border-y">
          {SWATCHES.map((s) => (
            <li key={s.name} className="flex items-start gap-4 py-4">
              <span
                aria-hidden
                className="border-line size-10 shrink-0 rounded-xs border"
                style={{ backgroundColor: s.hex }}
              />
              <div className="min-w-0">
                <p className="text-ink text-sm font-medium">
                  {s.name}
                  <span className="text-ink-subtle ml-3 font-mono text-xs">
                    {s.hex}
                  </span>
                </p>
                <p className="text-ink-muted mt-1 text-sm leading-relaxed">
                  {s.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-line bg-surface flex items-center gap-4 rounded-xs border p-4">
          {legacy}
          <div className="text-ink-muted text-xs leading-relaxed">
            <p className="text-ink font-medium">The legacy artwork</p>
            <p>
              Kept: the mark and its three colours. Retired: the rounded
              wordmark, the spaced red ENERGY and the tagline &ldquo;…our fuel
              takes you further&rdquo;, which read as fuel retail.
            </p>
            <p className="text-ink-subtle mt-1 font-mono text-[0.6875rem]">
              public/brand/source/oliviaenergy-logo.png
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Lockups at presentation size. The data-kit hooks are what
 * scripts/brand-kit.mjs photographs for the client's kit.
 */
export function LockupSpecimens({ inverse = false }: { inverse?: boolean }) {
  const kit = inverse ? "-inverse" : "";
  return (
    <div className="flex flex-wrap items-end justify-around gap-x-12 gap-y-12">
      <span data-kit={`lockup-horizontal${kit}`} className="inline-flex">
        <Logo className="text-[2rem] md:text-[3rem]" />
      </span>
      <span data-kit={`lockup-stacked${kit}`} className="inline-flex">
        <Logo variant="stacked" className="text-[1.75rem] md:text-[2.25rem]" />
      </span>
    </div>
  );
}

/** Where the logo may sit: full colour on light grounds, one colour on dark. */
export function Colourways() {
  return (
    <div className="space-y-4">
      <div
        data-tone="inverse"
        className="bg-inverse text-ink rounded-xs px-6 py-12 md:py-16"
      >
        <LockupSpecimens inverse />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile caption="Canvas · full colour" note="The default everywhere.">
          <Logo className="text-[1.375rem]" />
        </Tile>
        <Tile
          caption="Inverse · one colour"
          note={'Automatic inside data-tone="inverse".'}
          tone="inverse"
        >
          <Logo className="text-[1.375rem]" />
        </Tile>
        <Tile
          caption="Ink · one colour"
          note={'Print, stamps, forms: tone="mono".'}
        >
          <Logo tone="mono" className="text-[1.375rem]" />
        </Tile>
      </div>
    </div>
  );
}

/** Clear space: a quarter of the mark's height on every side, shown tinted. */
export function ClearSpace() {
  const zone = (em: number): CSSProperties => ({
    padding: `${MARK_RULES.clearSpace * em}em`,
  });
  const frame =
    "bg-primary-soft outline-line-strong inline-flex outline-1 outline-dashed";
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-12">
        <div className="border-line bg-canvas flex items-center justify-center rounded-xs border px-4 py-10 md:col-span-8">
          <div
            className={cn(frame, "text-[1.5rem] md:text-[2.25rem]")}
            style={zone(MARK_LOCKUP.markEm)}
          >
            <span className="bg-canvas inline-flex">
              <Logo />
            </span>
          </div>
        </div>
        <div className="border-line bg-canvas flex items-center justify-center rounded-xs border px-4 py-10 md:col-span-4">
          <div className={cn(frame, "text-[4rem]")} style={zone(1)}>
            <span className="bg-canvas inline-flex">
              <Logo variant="mark" />
            </span>
          </div>
        </div>
      </div>
      <p className="text-ink-muted mt-3 flex items-center gap-2 text-xs">
        <span
          aria-hidden
          className="bg-primary-soft outline-line-strong size-3 outline-1 outline-dashed"
        />
        Clear space, x = one quarter of the mark&rsquo;s height, measured from
        the logo&rsquo;s bounding box.
      </p>
    </div>
  );
}

/** The favicon construction, inline from the same source. */
function FaviconMark({ size }: { size: number }) {
  return (
    <svg
      viewBox={FAVICON.viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path d={FAVICON.flame} fill={FAVICON.flameColor} />
      <path d={FAVICON.ring} fill={FAVICON.ringColor} />
    </svg>
  );
}

/** Smallest permitted sizes, rendered at actual size. */
export function MinimumSizes() {
  const cells: { label: string; note: string; node: ReactNode }[] = [
    {
      label: `Mark · ${MARK_RULES.minMarkPx}px`,
      note: "Full detail",
      node: <Logo variant="mark" size={MARK_RULES.minMarkPx} />,
    },
    {
      label: `Lockup · ${MARK_RULES.minLockupMarkPx}px mark`,
      note: "Wordmark at 16px",
      node: <Logo size={MARK_RULES.minLockupMarkPx} />,
    },
    {
      label: `Stacked · ${MARK_RULES.minStackedMarkPx}px mark`,
      note: "Wordmark at 15px",
      node: <Logo variant="stacked" size={MARK_RULES.minStackedMarkPx} />,
    },
    {
      label: "Favicon · 16px",
      note: `Below ${MARK_RULES.faviconBelowPx}px: one tongue, heavier ring`,
      node: (
        <span className="flex items-end gap-4">
          <FaviconMark size={16} />
          <FaviconMark size={32} />
        </span>
      ),
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cells.map((c) => (
        <Tile key={c.label} caption={c.label} note={c.note}>
          {c.node}
        </Tile>
      ))}
    </div>
  );
}

const MISUSE = [
  "Stretch, squash, rotate or skew the mark",
  "Recolour it, or swap its colours; it is full colour or one colour",
  "Add shadows, glows, outlines, gradients or transparency",
  "Put text, figures or other graphics on or inside the mark",
  "Reset the wordmark in another face, or change the lockup's spacing",
  "Use the full-colour mark on dark, busy or photographic grounds",
  "Bring back the rounded wordmark or the fuel-retail tagline",
];

/** What never happens to the mark, stated and shown. */
export function Misuse() {
  const swap = {
    "--brand-mark-lime": MARK_COLORS.red,
    "--brand-mark-red": MARK_COLORS.lime,
    "--brand-mark-green": MARK_COLORS.red,
  } as CSSProperties;
  const examples: { caption: string; node: ReactNode; dark?: boolean }[] = [
    {
      caption: "Stretched",
      node: (
        <span className="inline-flex scale-x-150">
          <Logo variant="mark" size={72} />
        </span>
      ),
    },
    {
      caption: "Recoloured",
      node: (
        <span className="inline-flex" style={swap}>
          <Logo variant="mark" size={72} />
        </span>
      ),
    },
    {
      caption: "Effects added",
      node: (
        <span className="inline-flex drop-shadow-[0_6px_8px_rgb(22_19_16/0.45)]">
          <Logo variant="mark" size={72} />
        </span>
      ),
    },
    {
      caption: "Full colour on dark",
      dark: true,
      node: <Logo variant="mark" size={72} />,
    },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className={label}>Never</p>
        <ul className="text-ink mt-3 space-y-2 text-sm leading-relaxed">
          {MISUSE.map((s) => (
            <li key={s} className="flex gap-3">
              <span
                aria-hidden
                className="bg-accent mt-[0.75em] h-px w-3 shrink-0"
              />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:col-span-7">
        {examples.map((e) => (
          <figure
            key={e.caption}
            className="border-line overflow-hidden rounded-xs border"
          >
            <div
              className={cn(
                "flex h-36 items-center justify-center",
                e.dark ? "bg-inverse" : "bg-canvas",
              )}
            >
              {e.node}
            </div>
            <figcaption className="border-line bg-surface text-ink-muted flex items-center gap-2 border-t px-4 py-2.5 text-xs">
              <span aria-hidden className="bg-accent h-px w-3 shrink-0" />
              Don&rsquo;t: {e.caption.toLowerCase()}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

const FILES: [string, string][] = [
  [
    "src/lib/brand/mark.ts",
    "Source of truth: paths, colours, lockup ratios, rules",
  ],
  ["src/components/ui/logo.tsx", "<Logo>: inline SVG mark and live wordmark"],
  ["scripts/brand-assets.mjs", "Writes every file below from mark.ts"],
  ["public/brand/mark.svg", "Full-colour mark, vector"],
  ["public/brand/mark-mono.svg", "One colour, fill=currentColor"],
  [
    "public/brand/mark-inverse.svg",
    "One colour in off-white, for dark grounds",
  ],
  [
    "public/brand/logo-512.png",
    "Mark on white with clear space; schema.org logo",
  ],
  ["public/brand/mark-128.png", "Mark 128px tall, transparent; email header"],
  ["public/brand/icon-192.png, icon-512.png", "Web app icons (manifest)"],
  [
    "public/brand/maskable-512.png",
    "Maskable icon: off-white mark on green-950",
  ],
  ["public/brand/apple-touch-icon.png", "180², white tile"],
  ["src/app/icon.svg, apple-icon.png", "Favicon construction; iOS home screen"],
  ["src/app/manifest.ts", "Web app manifest"],
  [
    "public/brand/kit/",
    "Client kit: lockup PNGs at 4×, mark SVGs (scripts/brand-kit.mjs)",
  ],
  ["public/brand/source/", "The legacy artwork, for reference only"],
];

/** Where every brand file lives. */
export function BrandFiles() {
  return (
    <dl className="border-line divide-line divide-y border-y">
      {FILES.map(([path, note]) => (
        <div key={path} className="grid gap-1 py-3 md:grid-cols-12 md:gap-6">
          <dt className="text-ink font-mono text-xs break-all md:col-span-5">
            {path}
          </dt>
          <dd className="text-ink-muted text-sm leading-relaxed md:col-span-7">
            {note}
          </dd>
        </div>
      ))}
    </dl>
  );
}
