import type { ReactNode } from "react";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { SkipLink } from "@/components/ui/skip-link";

/**
 * Public-site shell. The header is fixed, so <main> is offset by the header
 * token; a page whose first section should sit under the transparent header
 * marks it with data-hero="light|dark" and pulls it up with -mt-header.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main
        id="content"
        tabIndex={-1}
        className="pt-header scroll-mt-header flex-1 outline-none"
      >
        {children}
      </main>
      <SiteFooter />
      <SiteJsonLd />
    </>
  );
}
