/**
 * Formatting helpers for copy that carries a number or a date.
 *
 * House rules: counts in prose are words from one to
 * twenty and en-GB numerals after that ("eleven op-eds", "21 op-eds");
 * dates are "10 September 2026" in prose and "10 Sep 2026" on cards.
 * Month names are written out here rather than taken from Intl, whose
 * en-GB short month for September is "Sept" in current ICU data.
 */

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
] as const;

const MONTHS_LONG = [
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
] as const;

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** One to twenty as words; zero, negatives, fractions and 21+ as en-GB numerals. */
export function countWords(n: number): string {
  if (Number.isInteger(n) && n >= 1 && n <= 20) return NUMBER_WORDS[n];
  return n.toLocaleString("en-GB");
}

/** Upper-cases the first character, for a count that opens a sentence. */
export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type DateParts = { year: number; month: number; day: number };

/**
 * Reads the calendar date from "YYYY-MM-DD" or the date part of a full ISO
 * timestamp, without a time zone round trip (so "2026-09-10" never becomes
 * 9 September on a server west of UTC).
 */
function parts(iso: string): DateParts {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso.trim());
  if (!match) throw new RangeError(`Not an ISO date: "${iso}"`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] ? Number(match[3]) : 1;
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new RangeError(`Not an ISO date: "${iso}"`);
  }
  return { year, month, day };
}

/** "10 September 2026": prose and article headers. */
export function formatDateLong(iso: string): string {
  const { year, month, day } = parts(iso);
  return `${day} ${MONTHS_LONG[month - 1]} ${year}`;
}

/** "10 Sep 2026": cards and covers. */
export function formatDateShort(iso: string): string {
  const { year, month, day } = parts(iso);
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

/** "June 2025": ranges such as "June 2025 to September 2026". */
export function monthYear(iso: string): string {
  const { year, month } = parts(iso);
  return `${MONTHS_LONG[month - 1]} ${year}`;
}
