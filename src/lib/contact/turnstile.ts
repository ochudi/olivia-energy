import "server-only";

/**
 * Cloudflare Turnstile, server side. The browser widget yields a one-time
 * token; nothing is trusted until Cloudflare's siteverify confirms it.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  { ok: true; hostname?: string } | { ok: false; codes: string[] };

/** Site key for the widget, or null when Turnstile is not configured. */
export function turnstileSiteKey(): string | null {
  return process.env.TURNSTILE_SITE_KEY || null;
}

export function turnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY,
  );
}

export async function verifyTurnstile(
  token: string,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: false, codes: ["missing-secret"] };
  if (!token) return { ok: false, codes: ["missing-input-response"] };
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, codes: [`http-${response.status}`] };
    const data = (await response.json()) as {
      success: boolean;
      hostname?: string;
      "error-codes"?: string[];
    };
    if (!data.success)
      return { ok: false, codes: data["error-codes"] ?? ["unknown"] };
    return { ok: true, hostname: data.hostname };
  } catch (error) {
    return {
      ok: false,
      codes: [error instanceof Error ? `network: ${error.message}` : "network"],
    };
  }
}
