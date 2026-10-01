import type { Token } from "@/lib/utils/tokens";
import { cn } from "@/lib/utils/cn";
import { contrastRatio, formatRatio, wcagLevel } from "@/lib/utils/color";
import { Tag } from "@/components/ui/tag";

function step(name: string): string {
  return name.split("-").pop() ?? name;
}

/** A continuous colour ramp with per-step labels (table on small screens). */
export function ColorRamp({
  tokens,
  annotations = {},
}: {
  tokens: Token[];
  annotations?: Record<string, string>;
}) {
  return (
    <div>
      <div className="border-line flex h-20 w-full overflow-hidden rounded-xs border md:h-24">
        {tokens.map((t) => (
          <div
            key={t.name}
            className="flex-1"
            style={{ backgroundColor: t.resolved }}
            title={`${t.name}: ${t.resolved}`}
          />
        ))}
      </div>
      <div className="mt-3 hidden md:flex">
        {tokens.map((t) => {
          const note = annotations[step(t.name)];
          return (
            <div key={t.name} className="min-w-0 flex-1 pr-1">
              <p className="text-ink font-mono text-xs">{step(t.name)}</p>
              <p className="text-ink-subtle truncate font-mono text-[0.6875rem] uppercase">
                {t.resolved}
              </p>
              {note ? (
                <p className="text-primary mt-1 text-[0.6875rem] font-medium tracking-[0.08em] uppercase">
                  {note}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 md:hidden">
        {tokens.map((t) => {
          const note = annotations[step(t.name)];
          return (
            <div
              key={t.name}
              className="flex items-center gap-2 font-mono text-xs"
            >
              <span
                aria-hidden
                className="border-line size-3 shrink-0 rounded-xs border"
                style={{ backgroundColor: t.resolved }}
              />
              <dt className="text-ink">{step(t.name)}</dt>
              <dd className="text-ink-subtle uppercase">{t.resolved}</dd>
              {note ? (
                <dd className="text-primary text-[0.625rem] tracking-[0.08em] uppercase">
                  {note}
                </dd>
              ) : null}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** Single large swatch, used for the accent and for spot tokens. */
export function Swatch({
  token,
  label,
  className,
}: {
  token: Token;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className="border-line h-24 w-full rounded-xs border"
        style={{ backgroundColor: token.resolved }}
      />
      <div>
        {label ? <p className="text-ink text-sm font-medium">{label}</p> : null}
        <p className="text-ink font-mono text-xs">{token.name}</p>
        <p className="text-ink-subtle font-mono text-[0.6875rem] uppercase">
          {token.resolved}
        </p>
      </div>
    </div>
  );
}

/** Contrast proof for a foreground/background token pair. */
export function ContrastPair({
  fg,
  bg,
  sample = "Aa",
  caption,
}: {
  fg: Token;
  bg: Token;
  sample?: string;
  caption: string;
}) {
  const ratio = contrastRatio(fg.resolved, bg.resolved);
  const level = wcagLevel(ratio);
  return (
    <div className="border-line overflow-hidden rounded-xs border">
      <div
        className="flex h-24 items-center justify-between px-5"
        style={{ backgroundColor: bg.resolved, color: fg.resolved }}
      >
        <span className="font-display text-display-sm leading-none">
          {sample}
        </span>
        <span className="font-sans text-sm">{caption}</span>
      </div>
      <div className="bg-surface flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-ink-subtle min-w-0 font-mono text-[0.6875rem] leading-relaxed">
          <p className="truncate">{fg.name}</p>
          <p className="truncate">on {bg.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-ink font-mono text-xs tabular-nums">
            {formatRatio(ratio)}
          </span>
          <Tag size="sm" variant={level === "Fail" ? "outline" : "primary"}>
            {level}
          </Tag>
        </div>
      </div>
    </div>
  );
}

/** Semantic token table: name, resolves to, usage. Stacks on small screens. */
export function TokenTable({
  tokens,
  showSwatch = false,
  valueLabel = "Value",
}: {
  tokens: Token[];
  showSwatch?: boolean;
  valueLabel?: string;
}) {
  const swatch = (t: Token) =>
    showSwatch ? (
      <span
        aria-hidden
        className="border-line size-3 shrink-0 rounded-xs border"
        style={{ backgroundColor: t.resolved }}
      />
    ) : null;

  return (
    <div>
      {/* Small screens: one stacked entry per token */}
      <dl className="divide-line border-line divide-y border-y md:hidden">
        {tokens.map((t) => (
          <div key={t.name} className="py-3">
            <dt className="text-ink flex items-center gap-2 font-mono text-xs">
              {swatch(t)}
              {t.name}
            </dt>
            <dd className="text-ink-subtle mt-1 font-mono text-[0.6875rem] break-all">
              {t.value !== t.resolved ? (
                <>
                  <span className="text-ink-muted">{t.value}</span>
                  <span className="ml-2 uppercase">{t.resolved}</span>
                </>
              ) : (
                t.resolved
              )}
            </dd>
            {t.description ? (
              <dd className="text-ink-muted mt-1 text-sm leading-relaxed">
                {t.description}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>

      {/* md and up: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-line-strong border-b text-left">
              <th className="tracking-caps text-ink-muted py-2 pr-4 font-sans text-xs font-medium uppercase">
                Token
              </th>
              <th className="tracking-caps text-ink-muted py-2 pr-4 font-sans text-xs font-medium uppercase">
                {valueLabel}
              </th>
              <th className="tracking-caps text-ink-muted py-2 font-sans text-xs font-medium uppercase">
                Usage
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.name} className="border-line border-b align-top">
                <td className="text-ink py-2.5 pr-4 font-mono text-xs whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    {swatch(t)}
                    {t.name}
                  </span>
                </td>
                <td className="text-ink-subtle py-2.5 pr-4 font-mono text-xs">
                  {t.value !== t.resolved ? (
                    <>
                      <span className="text-ink-muted">{t.value}</span>
                      <span className="block uppercase">{t.resolved}</span>
                    </>
                  ) : (
                    t.resolved
                  )}
                </td>
                <td className="text-ink-muted py-2.5 text-sm">
                  {t.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
