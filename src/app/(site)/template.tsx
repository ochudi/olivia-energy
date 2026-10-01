import type { ReactNode } from "react";
import { PageTransition } from "@/components/ui/page-transition";

/**
 * Re-mounts on every navigation (unlike a layout), so PageTransition can
 * play its entry animation: a fade and 8px lift over --duration-page.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
