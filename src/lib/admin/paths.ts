/** Only allow post-login redirects inside the admin. */
export function safeNext(value: string | null | undefined): string {
  if (!value) return "/admin";
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  return value;
}

/** The one-time links the site emails: a new member's invite, a password reset. */
export const ADMIN_LINK_TYPES = ["invite", "recovery"] as const;
export type AdminLinkType = (typeof ADMIN_LINK_TYPES)[number];

export function isAdminLinkType(value: unknown): value is AdminLinkType {
  return ADMIN_LINK_TYPES.includes(value as AdminLinkType);
}

/** Routes under /admin that work without a session. */
export const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/reset",
  "/admin/auth",
] as const;

export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
