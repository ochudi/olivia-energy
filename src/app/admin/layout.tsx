import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Olivia Energy" },
  robots: { index: false, follow: false },
};

/** Every admin screen depends on the session cookie; never prerender. */
export const dynamic = "force-dynamic";

/** Admin has no site chrome; the (app) group adds the sidebar shell. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
