import { ContactDetails, ContactForm } from "@/components/contact";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { turnstileSiteKey } from "@/lib/contact/turnstile";
import type { SiteSettings } from "@/lib/supabase/types";

/**
 * Message and details (creative brief 4.7, section 2): the field. The form
 * in a square-cornered card (an instrument that takes input, DESIGN.md
 * Shapes) in cols 1 to 7 (fields, validation and the server action
 * unchanged), the details in cols 9 to 12. Phones: form, then details. The
 * Turnstile site key is read here on the server and handed to the widget,
 * so it needs no NEXT_PUBLIC_ prefix.
 */
export function ContactMessage({ settings }: { settings: SiteSettings }) {
  return (
    <Section surface="paper" id="message">
      <Container>
        <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-6">
          <div className="bg-card border-line rounded-xs border p-5 sm:p-8 lg:col-span-7 lg:p-12">
            <ContactForm
              siteKey={turnstileSiteKey()}
              contactEmail={settings.contact_email}
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <ContactDetails settings={settings} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
