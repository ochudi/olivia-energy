import { ContactHero, ContactMessage } from "@/components/sections/contact";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Viewport } from "next";
import { getSettings } from "@/lib/supabase/queries";

/** The browser chrome on phones takes the red hero. */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#d5281b",
};

export const generateMetadata = pageMetadata({
  ...SEO.contact,
  path: "/contact",
});

/**
 * Contact: the red hero with the dotted map and the
 * ring around Southwest Nigeria, then the form and the details from settings.
 */
export default async function Page() {
  const settings = await getSettings();
  return (
    <>
      <ContactHero />
      <ContactMessage settings={settings} />
    </>
  );
}
