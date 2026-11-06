import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Display } from "@/components/ui/display";
import { Logo } from "@/components/ui/logo";
import { PHILOSOPHY, TAGLINE } from "@/content/brand";
import { PHOTOS } from "@/content/images";
import {
  contrastRatio,
  formatRatio,
  SURFACE_PAIRS,
  wcagLevel,
  type ContrastPair,
} from "@/lib/utils/contrast";
import type { Token } from "@/lib/utils/tokens";
import type { Surface } from "@/types/contracts";
import { Chipset, SurfaceFrame } from "./frame";

export const SURFACE_ORDER: readonly Surface[] = [
  "paper",
  "paper-deep",
  "night",
  "green",
  "lime",
  "red",
  "photo",
];

/** The brand and surface colours as swatches, each with its rule (the token's own usage note). */
export function BrandPalette({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
      {tokens.map((t) => {
        const [use, ...never] = (t.description ?? "").split(/\.\s*Never\s/);
        return (
          <li key={t.name} className="flex flex-col gap-3">
            <span
              aria-hidden="true"
              className="border-line shoulder-sm block h-28 w-full border"
              style={{ background: `var(${t.name})` }}
            />
            <div className="flex flex-col gap-1">
              <code className="text-ink font-mono text-xs">{t.name}</code>
              <span className="text-ink-muted font-mono text-xs uppercase">
                {t.resolved}
              </span>
            </div>
            {use ? (
              <p className="text-ink text-sm">{use.replace(/\.$/, "")}.</p>
            ) : null}
            {never.length > 0 ? (
              <p className="text-ink-muted text-sm">
                <span className="label text-ink-muted mr-2">Never</span>
                {never.join(" ").replace(/\.$/, "")}.
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

const SCRIM =
  "linear-gradient(90deg, rgba(6,23,14,.85) 0%, rgba(6,23,14,.62) 50%, rgba(6,23,14,0) 78%), linear-gradient(0deg, rgba(6,23,14,.88) 0%, rgba(6,23,14,0) 52%), linear-gradient(180deg, rgba(6,23,14,.45) 0, rgba(6,23,14,0) 160px)";

const CHARTS = [
  { label: "chart-1", value: "var(--chart-1)" },
  { label: "chart-2", value: "var(--chart-2)" },
  { label: "chart-3", value: "var(--chart-3)" },
  { label: "chart-gap", value: "var(--chart-gap)" },
  { label: "chart-axis", value: "var(--chart-axis)" },
  { label: "chart-grid", value: "var(--chart-grid)" },
  { label: "turn", value: "var(--turn-color)" },
  { label: "line", value: "var(--color-line)" },
] as const;

function ratioRows(surface: Surface): ContrastPair[] {
  return SURFACE_PAIRS.filter((p) => p.surface === surface);
}

/** One surface: what it remaps, shown live, then its pairs with the computed ratios. */
function SurfaceCard({ surface }: { surface: Surface }) {
  const isPhoto = surface === "photo";
  const photo = PHOTOS["lagos-third-mainland"];
  const rows = ratioRows(surface);
  return (
    <SurfaceFrame surface={surface} id={`surface-${surface}`}>
      {isPhoto ? (
        <>
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={60}
            className="-z-20 object-cover"
            style={{ objectPosition: photo.focal }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ backgroundImage: SCRIM }}
          />
        </>
      ) : null}
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Chip tone="solid">{surface}</Chip>
          <Logo variant="lockup" size={26} />
        </div>
        <Display as="p" size="md" className="max-w-[18ch]">
          {PHILOSOPHY.statement}
        </Display>
        <dl className="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-4 gap-y-1">
          <dt className="source-line text-ink-muted">ink</dt>
          <dd className="text-ink text-base">{TAGLINE.line1}</dd>
          <dt className="source-line text-ink-muted">ink-muted</dt>
          <dd className="text-ink-muted text-base">{TAGLINE.line2}</dd>
          <dt className="source-line text-ink-muted">ink-subtle</dt>
          <dd className="text-ink-subtle text-sm">{TAGLINE.line2}</dd>
        </dl>
        <div className="flex flex-wrap items-center gap-4">
          <Button href="#surfaces">{TAGLINE.line1.replace(/\.$/, "")}</Button>
          <Button href="#surfaces" variant="secondary">
            {TAGLINE.line2.replace(/\.$/, "")}
          </Button>
        </div>
        <Chipset items={CHARTS} />
        {rows.length > 0 ? (
          <dl className="border-line border-t pt-4 text-sm">
            {rows.map((p) => {
              const ratio = contrastRatio(p.foreground, p.background);
              const pass = ratio >= p.minimum;
              return (
                <div
                  key={`${p.role}-${p.foreground}`}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-0.5 py-1.5"
                >
                  <dt className="text-ink-muted">{p.role}</dt>
                  <dd className="numerals text-ink text-right whitespace-nowrap">
                    {formatRatio(ratio)}
                    <span className="source-line text-ink-muted ml-2">
                      min {p.minimum}:1 {pass ? wcagLevel(ratio) : "fails"}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : null}
      </div>
    </SurfaceFrame>
  );
}

export function SurfaceCards() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {SURFACE_ORDER.map((s) => (
        <SurfaceCard key={s} surface={s} />
      ))}
    </div>
  );
}

/** Every pair of the surface table with its computed ratio and threshold, as one table. */
export function ContrastTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">
          Every text and graphic pair per surface, with its computed contrast
          ratio against the threshold it is held to.
        </caption>
        <thead>
          <tr className="border-line-strong border-b text-left">
            {["Surface", "Pair", "Sample", "Foreground", "Ratio", "Needs"].map(
              (h) => (
                <th key={h} className="label text-ink-muted py-2 pr-4">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {SURFACE_PAIRS.map((p, i) => {
            const ratio = contrastRatio(p.foreground, p.background);
            const pass = ratio >= p.minimum;
            return (
              <tr
                key={`${p.surface}-${i}`}
                className="border-line border-b align-middle"
              >
                <td className="text-ink py-2 pr-4 font-mono text-xs whitespace-nowrap">
                  {p.surface}
                </td>
                <td className="text-ink-muted py-2 pr-4">{p.role}</td>
                <td className="py-2 pr-4">
                  <span
                    className="font-display text-display-xs border-line inline-flex h-9 w-14 items-center justify-center border leading-none"
                    style={{ color: p.foreground, background: p.background }}
                  >
                    Aa
                  </span>
                </td>
                <td className="text-ink-muted py-2 pr-4 font-mono text-xs whitespace-nowrap uppercase">
                  {p.foreground}
                  <span className="text-ink-subtle block normal-case">
                    on {p.background}
                  </span>
                </td>
                <td className="numerals text-ink py-2 pr-4 whitespace-nowrap">
                  {formatRatio(ratio)}
                </td>
                <td className="py-2 whitespace-nowrap">
                  <Chip tone={pass ? "outline" : "gap"}>
                    {pass ? `${p.minimum}:1 met` : `${p.minimum}:1 fails`}
                  </Chip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
