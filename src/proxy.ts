import { NextResponse, type NextRequest } from "next/server";
import { isPublicAdminPath } from "@/lib/admin/paths";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy (the Next.js 16 name for middleware). Guards every /admin route: no session → /admin/login (with the intended
 * destination), a session on the login page → /admin. Role is checked in
 * the admin layout and in every server action, not here.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, user, configured } = await updateSession(request);
  const isPublic = isPublicAdminPath(pathname);

  if (!configured) {
    if (isPublic) return response;
    return NextResponse.redirect(
      new URL("/admin/login?error=unconfigured", request.url),
    );
  }
  if (!user && !isPublic) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  if (user && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
