import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CTA } from "@/content/home";
import { getSettings } from "@/lib/supabase/queries";

/**
 * Closing call to action before the footer, shared by Home and What We Do:
 * the serif line on the left, the contact email and the button on the
 * right. The email comes from settings, so it matches the footer.
 */
export async function ClosingCta() {
  const { contact_email } = await getSettings();
  return (
    <section id="cta" className="border-line border-t">
      <Container className="py-section">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionHeading title={CTA.title} lede={CTA.body} />
          </Reveal>
          <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9">
            <a
              href={`mailto:${contact_email}`}
              className="text-ink hover:text-primary active:text-primary-hover duration-fast ease-standard text-xl [overflow-wrap:anywhere] transition-colors"
            >
              {contact_email}
            </a>
            <Button href={CTA.button.href} size="lg" icon={<ArrowRight />}>
              {CTA.button.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
