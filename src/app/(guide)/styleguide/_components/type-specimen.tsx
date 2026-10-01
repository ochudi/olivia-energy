import type { Token } from "@/lib/utils/tokens";
import { cn } from "@/lib/utils/cn";

export function TypeSpecimen({
  token,
  lineHeight,
  letterSpacing,
  sample,
  font = "display",
  weight,
  italic = false,
  className,
}: {
  token: Token;
  lineHeight?: Token;
  letterSpacing?: Token;
  sample: string;
  font?: "display" | "sans";
  weight?: number;
  italic?: boolean;
  className?: string;
}) {
  const short = token.name.replace("--text-", "");
  return (
    <div
      className={cn(
        "border-line grid gap-2 border-b py-5 lg:grid-cols-12 lg:gap-6",
        className,
      )}
    >
      <div className="text-ink-subtle font-mono text-[0.6875rem] leading-relaxed lg:col-span-3">
        <p className="text-ink">{short}</p>
        <p className="break-all">{token.value}</p>
        {lineHeight ? <p>lh {lineHeight.value}</p> : null}
        {letterSpacing ? <p>ls {letterSpacing.value}</p> : null}
        {weight ? <p>wght {weight}</p> : null}
      </div>
      <p
        className={cn(
          "text-ink min-w-0 lg:col-span-9",
          font === "display"
            ? italic
              ? "font-display-italic italic"
              : "font-display"
            : italic
              ? "font-sans-italic italic"
              : "font-sans",
        )}
        style={{
          fontSize: `var(${token.name})`,
          lineHeight: lineHeight ? `var(${lineHeight.name})` : undefined,
          letterSpacing: letterSpacing
            ? `var(${letterSpacing.name})`
            : undefined,
          fontWeight: weight,
        }}
      >
        {sample}
      </p>
    </div>
  );
}
