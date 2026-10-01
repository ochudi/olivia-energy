/** Reading time in whole minutes at 220 words per minute, never below 1. */
export function readingMinutes(words: number, wordsPerMinute = 220): number {
  return Math.max(1, Math.round(words / wordsPerMinute));
}

const long = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Lagos",
});
const short = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Lagos",
});

/** "6 September 2026" (long) or "6 Sep 2026" (short), in Lagos time. */
export function formatDate(
  iso: string | null | undefined,
  style: "long" | "short" = "long",
): string {
  if (!iso) return "";
  return (style === "long" ? long : short).format(new Date(iso));
}

/** Characters after which a quotation mark opens rather than closes. */
const BEFORE_OPENING = /[\s(\[{\u2013\u2014/"'\u201c\u2018-]/;

/**
 * Sets straight quotation marks and apostrophes as typographic ones
 * ("Nigeria's" becomes "Nigeria’s", "so-called" in straight quotes gains
 * curly ones), because editors type the straight kind and display type shows
 * the difference. `before` and `after` are the characters either side of
 * `text` on the page, for text that continues from or into another node (a
 * quotation that opens just before a link, or closes just after one).
 */
export function typeset(text: string, before = "", after = ""): string {
  if (!/["']/.test(text)) return text;
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char !== '"' && char !== "'") {
      out += char;
      continue;
    }
    const prev = i === 0 ? before : text[i - 1];
    const next = text[i + 1] ?? after;
    const opens =
      (prev === "" || BEFORE_OPENING.test(prev)) &&
      next !== "" &&
      !/\s/.test(next);
    if (char === '"') {
      out += opens ? "\u201c" : "\u201d";
      continue;
    }
    // A mark before two digits is an elision ('90s, FY'24) unless a closing
    // mark follows, in which case it opens a quotation ('50 per cent', he said).
    const rest = text.slice(i + 1);
    const elision =
      /^\d\d(s\b|\b)/.test(rest) && !/\S'(?![A-Za-z\d])/.test(rest);
    out += opens && !elision ? "\u2018" : "\u2019";
  }
  return out;
}
