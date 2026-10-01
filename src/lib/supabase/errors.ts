import { getPublicSupabaseEnv } from "./env";

/**
 * Supabase error handling for the public read layer (queries.ts).
 *
 * A configured-but-unreachable database (the local stack is not running)
 * surfaces two different ways depending on where the network failure
 * happens: as a Postgrest `{ error }` result, or as a thrown
 * `TypeError: fetch failed` (with an `ECONNREFUSED` cause) from the fetch
 * call itself. Both are rewritten here into one message with next steps;
 * every other error passes through unchanged.
 */

function messageOf(error: unknown): string {
  if (!error || typeof error !== "object") return String(error ?? "");
  const { message, details, cause } = error as {
    message?: unknown;
    details?: unknown;
    cause?: unknown;
  };
  const causeMessage =
    cause && typeof cause === "object" && "message" in cause
      ? String((cause as { message?: unknown }).message ?? "")
      : "";
  return [message, details, causeMessage]
    .filter(
      (part): part is string => typeof part === "string" && part.length > 0,
    )
    .join(" ");
}

function isUnreachable(error: unknown): boolean {
  const text = messageOf(error);
  return text.includes("fetch failed") || text.includes("ECONNREFUSED");
}

/**
 * Rewrites an unreachable-database error into one with next steps.
 * Every other error is returned as-is, so callers rethrow the original.
 */
export function explain(error: unknown): Error {
  if (!isUnreachable(error)) return error as Error;
  const { url } = getPublicSupabaseEnv();
  return new Error(
    `Supabase is not reachable at ${url}. Start the local stack with "npm run db:start" (Docker Desktop must be running) or "scripts/harness/start.sh", then reload.`,
  );
}

/** Throws `explain(error)`. Typed `never` so it can replace `throw error` directly. */
export function raise(error: unknown): never {
  throw explain(error);
}
