export function wordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/** Reading time in whole minutes at 220 words per minute, never below 1. */
export function readingMinutes(words: number, wordsPerMinute = 220): number {
  return Math.max(1, Math.round(words / wordsPerMinute));
}

const long = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const short = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "6 September 2026" (long) or "6 Sept 2026" (short). */
export function formatDate(
  iso: string | null | undefined,
  style: "long" | "short" = "long",
): string {
  if (!iso) return "";
  return (style === "long" ? long : short).format(new Date(iso));
}
