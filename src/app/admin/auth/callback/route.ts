import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/admin/paths";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Lands invite and recovery links. Supports the PKCE `code` flow and the
 * `token_hash` + `type` email-template flow, then continues to `next`
 * (default: the set-password screen).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next") ?? "/admin/set-password");

  const supabase = await createServerSupabase();
  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    ok = !error;
  }
  return NextResponse.redirect(
    ok ? `${origin}${next}` : `${origin}/admin/login?error=link`,
  );
}
