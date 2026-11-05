import { ContactHero, ContactMessage } from "@/components/sections/contact";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/supabase/queries";

export const generateMetadata = pageMetadata({
  ...SEO.contact,
  path: "/contact",
});

/**
 * Contact (creative brief 4.7): the red hero with the dotted map and the
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
