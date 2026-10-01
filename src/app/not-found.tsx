import type { Metadata } from "next";
import { NotFoundSection } from "@/components/sections/not-found-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { SkipLink } from "@/components/ui/skip-link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/**
 * Root not-found. Unknown top-level URLs (e.g. /does-not-exist) fall
 * outside every route group, so this is the only not-found boundary that
 * catches them — and it lands inside the root layout, which has no chrome
 * of its own. It therefore renders the full public shell itself, exactly as
 * src/app/(site)/layout.tsx does, so the page looks identical either way.
 */
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main
        id="content"
        tabIndex={-1}
        className="pt-header scroll-mt-header flex-1 outline-none"
      >
        <NotFoundSection />
      </main>
      <SiteFooter />
    </>
  );
}
