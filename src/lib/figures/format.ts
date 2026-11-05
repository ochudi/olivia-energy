/**
 * Number and date formatting for figure labels, ticks, tables and readouts.
 * en-GB grouping throughout; no numeral is typed by hand in a component.
 */

export type ValueFormat = "percent" | "usd" | "millions" | "number";

const enGB = (min: number, max: number) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });

const whole = enGB(0, 0);
const oneDp = enGB(0, 1);
const twoDp = enGB(0, 2);
const cents = enGB(2, 2);

/** Decimals that make sense for a magnitude: 2 under 10, 1 under 100, else 0. */
export function autoDecimals(v: number): number {
  const a = Math.abs(v);
  return a < 10 ? 2 : a < 100 ? 1 : 0;
}

export function formatNumber(v: number, decimals?: number): string {
  const d = decimals ?? autoDecimals(v);
  return enGB(d, d).format(v);
}

/** A full value for an end label, a readout or a table cell. */
export function formatValue(
  v: number,
  kind: ValueFormat,
  decimals?: number,
): string {
  switch (kind) {
    case "percent":
      return `${enGB(decimals ?? 1, decimals ?? 1).format(v)}%`;
    case "usd":
      return `$${enGB(decimals ?? 2, decimals ?? 2).format(v)}`;
    case "millions":
      if (Math.abs(v) >= 1e9) {
        return `${enGB(decimals ?? 2, decimals ?? 2).format(v / 1e9)} billion`;
      }
      return `${enGB(decimals ?? 0, decimals ?? 0).format(v / 1e6)} million`;
    default:
      return formatNumber(v, decimals);
  }
}

/** A short value for an axis tick. */
export function formatTick(v: number, kind: ValueFormat): string {
  switch (kind) {
    case "percent":
      return `${oneDp.format(v)}%`;
    case "usd":
      return `$${v < 1 ? cents.format(v) : whole.format(v)}`;
    case "millions":
      if (v === 0) return "0";
      if (Math.abs(v) >= 1e9) return `${twoDp.format(v / 1e9)}bn`;
      return `${whole.format(v / 1e6)}m`;
    default:
      return v >= 1000 ? whole.format(v) : twoDp.format(v);
  }
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-10-02" to "2 October 2026". Returns the input if it is not a date. */
export function formatDateLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** A decimal year (2026.583) to "Aug 2026"; an integer year to "2026". */
export function formatYear(x: number): string {
  if (Number.isInteger(x)) return String(x);
  const year = Math.floor(x);
  const month = Math.min(11, Math.round((x - year) * 12));
  return `${MONTHS[month].slice(0, 3)} ${year}`;
}
