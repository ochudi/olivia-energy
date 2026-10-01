import { SectionHeading } from "@/components/ui/section-heading";
import { SocialIcon } from "@/components/ui/social-icon";
import { CONTACT_PAGE } from "@/content/contact";
import { SITE, SOCIALS } from "@/content/site";
import type { SiteSettings } from "@/lib/supabase/types";

const heading =
  "tracking-caps text-ink-muted font-sans text-xs font-medium uppercase";

/**
 * Safety net for Admin → Settings: drops an address line that is a
 * stand-in rather than an address, so it never reaches the page.
 */
const STAND_IN_LINE = /\bto follow\b|\bTBC\b|placeholder/i;

/**
 * Left column: invitation copy, one block per office that has address
 * lines (or, if none has, the countries on one line), the contact email,
 * phone numbers when there are any, and the social links. Every value
 * comes from settings (Admin → Settings).
 */
export function ContactDetails({ settings }: { settings: SiteSettings }) {
  const offices = settings.addresses
    .map((address) => ({
      ...address,
      lines: address.lines
        .map((line) => line.trim())
        .filter((line) => line && !STAND_IN_LINE.test(line)),
    }))
    .filter((address) => address.lines.length > 0);
  const countries = [
    ...new Set(settings.addresses.map((address) => address.country)),
  ];
  const socials = SOCIALS.map((social) => ({
    ...social,
    href: settings.socials[social.id] ?? social.href,
  }));
  return (
    <div>
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow={CONTACT_PAGE.eyebrow}
        title={CONTACT_PAGE.title}
        lede={CONTACT_PAGE.invitation}
      />

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {offices.length ? (
          offices.map((address, index) => (
            <address
              key={`${address.country}-${index}`}
              className="text-ink text-base leading-relaxed not-italic"
            >
              <h2 className={heading}>{address.label ?? address.country}</h2>
              <p className="mt-3">
                {address.lines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
                {address.label ? (
                  <span className="text-ink-muted block">
                    {address.country}
                  </span>
                ) : null}
              </p>
            </address>
          ))
        ) : countries.length ? (
          <div className="sm:col-span-2">
            <h2 className={heading}>{CONTACT_PAGE.headings.offices}</h2>
            <p className="text-ink mt-3 text-base">
              {countries.join(CONTACT_PAGE.countrySeparator)}
            </p>
          </div>
        ) : null}

        <div className="sm:col-span-2">
          <h2 className={heading}>{CONTACT_PAGE.headings.email}</h2>
          <p className="mt-3 [overflow-wrap:anywhere]">
            <a
              href={`mailto:${settings.contact_email}`}
              className="hit-area text-ink hover:text-primary duration-fast ease-standard text-base transition-colors"
            >
              {settings.contact_email}
            </a>
          </p>
          {settings.phones.length ? (
            <>
              <h2 className={`${heading} mt-8`}>
                {CONTACT_PAGE.headings.phone}
              </h2>
              <ul className="mt-3 space-y-1">
                {settings.phones.map((phone, i) => (
                  <li key={`${phone.number}-${i}`} className="text-base">
                    <a
                      href={`tel:${phone.number.replace(/[^\d+]/g, "")}`}
                      className="text-ink hover:text-primary duration-fast ease-standard transition-colors"
                    >
                      {phone.number}
                    </a>
                    {phone.label ? (
                      <span className="text-ink-muted"> · {phone.label}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <h2 className={heading}>{CONTACT_PAGE.headings.social}</h2>
          <ul className="mt-3 flex gap-2" aria-label="Social">
            {socials.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE.name} on ${social.label} (opens in a new tab)`}
                  className="border-line hover:border-line-strong hover:bg-surface-muted duration-fast ease-standard inline-flex size-10 items-center justify-center rounded-xs border transition-colors"
                >
                  <SocialIcon name={social.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
