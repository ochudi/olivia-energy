import type { Metadata } from "next";
import { NotFoundSection } from "@/components/sections/not-found-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { SkipLink } from "@/components/ui/skip-link";
import { getSettings } from "@/lib/supabase/queries";

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
export default async function NotFound() {
  const settings = await getSettings();
  return (
    <>
      <SkipLink />
      <SiteHeader email={settings.contact_email} />
      <main
        id="content"
        tabIndex={-1}
        className="pt-header scroll-mt-header flex-1 overflow-x-clip outline-none"
      >
        <NotFoundSection />
      </main>
      <SiteFooter />
    </>
  );
}
