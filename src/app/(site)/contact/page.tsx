import { ContactDetails, ContactForm } from "@/components/contact";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SEO } from "@/content/seo";
import { pageMetadata } from "@/lib/seo/metadata";
import { turnstileSiteKey } from "@/lib/contact/turnstile";
import { getSettings } from "@/lib/supabase/queries";

export const generateMetadata = pageMetadata({
  ...SEO.contact,
  path: "/contact",
});

/**
 * Contact. Left: invitation, offices, email and socials from settings.
 * Right: the form. The Turnstile site key is read here on the server and
 * handed to the widget, so it needs no NEXT_PUBLIC_ prefix.
 */
export default async function Page() {
  const settings = await getSettings();
  return (
    <section className="py-section">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <ContactDetails settings={settings} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Card padding="none" className="p-5 sm:p-8 lg:p-10">
              <ContactForm
                siteKey={turnstileSiteKey()}
                contactEmail={settings.contact_email}
              />
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
