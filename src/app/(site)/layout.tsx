import type { ReactNode } from "react";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { SkipLink } from "@/components/ui/skip-link";
import { getSettings } from "@/lib/supabase/queries";

/**
 * Public-site shell. The header is fixed, so <main> is offset by the header
 * token; a page whose first section should sit under the transparent header
 * marks it with data-hero="light|dark" (Section's `hero` prop) and pulls
 * it up with -mt-header.
 *
 * Nothing here clips or transforms: no ancestor of <main> may have
 * overflow: hidden, a transform or a scroll container, or position: sticky
 * (the pinned scenes on Home and What we do), anchor offsets and the
 * header's window.scrollY logic break. <main> itself uses overflow-x: clip,
 * which hides a stray horizontal bleed without creating a scroll container.
 */
export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
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
        {children}
      </main>
      <SiteFooter />
      <SiteJsonLd />
    </>
  );
}
