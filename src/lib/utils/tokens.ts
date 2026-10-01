import fs from "node:fs";
import path from "node:path";

/**
 * Server-only reader for src/styles/tokens.css.
 *
 * The styleguide renders straight from the token file so it can never drift
 * from what ships. A trailing block comment on a token line is treated as its
 * usage note:  --color-primary: var(--color-green-700); /- Buttons, links -/
 */

export type Token = {
  /** Custom property name, e.g. `--color-green-500`. */
  name: string;
  /** Raw value as written in the file. */
  value: string;
  /** Value with `var()` references resolved to their final literal. */
  resolved: string;
  /** Usage note taken from a trailing comment, if any. */
  description?: string;
};

const TOKEN_FILE = path.join(process.cwd(), "src/styles/tokens.css");

/**
 * Matches one declaration, tolerating values wrapped across lines by
 * Prettier, and captures a trailing same-line block comment as the note.
 */
const DECLARATION =
  /(--[\w-]+)\s*:\s*([^;]+);[ \t]*(?:\/\*\s*([^\n]*?)\s*\*\/)?/g;

function resolveValue(
  value: string,
  map: Map<string, string>,
  depth = 0,
): string {
  if (depth > 8) return value;
  const replaced = value.replace(
    /var\((--[\w-]+)\)/g,
    (_, name: string) => map.get(name) ?? `var(${name})`,
  );
  return replaced === value ? value : resolveValue(replaced, map, depth + 1);
}

export function loadTokens(): Token[] {
  const source = fs.readFileSync(TOKEN_FILE, "utf8");
  const raw: { name: string; value: string; description?: string }[] = [];
  for (const m of source.matchAll(DECLARATION)) {
    const [, name, rawValue, description] = m;
    if (!name || !rawValue) continue;
    const value = rawValue
      .replace(/\s+/g, " ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim();
    if (value === "initial") continue;
    raw.push({ name, value, description: description || undefined });
  }
  const map = new Map(raw.map((t) => [t.name, t.value]));
  return raw.map((t) => ({
    ...t,
    resolved: resolveValue(t.value, map),
  }));
}

/** Tokens whose name starts with `prefix` (e.g. `--color-green-`). */
export function tokensWithPrefix(tokens: Token[], prefix: string): Token[] {
  return tokens.filter((t) => t.name.startsWith(prefix));
}

export function findToken(tokens: Token[], name: string): Token | undefined {
  return tokens.find((t) => t.name === name);
}
