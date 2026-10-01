import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { SocialIcon } from "@/components/ui/social-icon";
import { CONTACT, NAV, SERVICES, SITE, SOCIALS } from "@/content/site";
import { getSettings } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils/cn";

/** Unified focus ring for every custom control in the footer. */
const RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
const heading =
  "tracking-caps text-ink-muted font-sans text-xs font-medium uppercase";
const link = cn(
  "text-ink/80 hover:text-ink hover:underline active:text-ink/60 decoration-ink/40 underline-offset-4 duration-fast ease-standard active:duration-instant inline-block rounded-xs py-1 text-sm transition-colors",
  RING,
);

/**
 * SiteFooter — four columns on the inverse surface, then the legal line.
 * `data-tone="inverse"` remaps every semantic token, so the markup uses the
 * same classes as the rest of the site.
 */
export async function SiteFooter() {
  const year = new Date().getFullYear();
  const settings = await getSettings();
  const socials = SOCIALS.map((social) => ({
    ...social,
    href: settings.socials[social.id] ?? social.href,
  }));
  return (
    <footer
      id="site-footer"
      data-tone="inverse"
      className="bg-inverse text-ink mt-auto"
    >
      <Container size="wide" className="pt-section-sm pb-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Link
              href="/"
              className={cn(
                "inline-flex rounded-xs text-[1.625rem] leading-none",
                RING,
              )}
            >
              <Logo tone="mono" />
              <span className="sr-only">, home</span>
            </Link>
            <p className="text-ink-muted mt-5 max-w-[34ch] text-sm leading-relaxed text-pretty">
              {settings.tagline}
            </p>
          </div>

          <nav aria-labelledby="footer-navigation" className="lg:col-span-2">
            <h2 id="footer-navigation" className={heading}>
              Navigation
            </h2>
            <ul className="mt-5 space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={heading}>Services</h2>
            <ul className="mt-5 space-y-1">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link href={`/what-we-do#${service.slug}`} className={link}>
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-3">
            <h2 className={heading}>Contact</h2>
            <p className="mt-5">
              <a href={`mailto:${settings.contact_email}`} className={link}>
                {settings.contact_email}
              </a>
            </p>
            <ul className="mt-2 space-y-1">
              {CONTACT.offices.map((office) => (
                <li key={office} className="text-ink/80 py-1 text-sm">
                  {office}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex gap-2" aria-label="Social">
              {socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${SITE.name} on ${social.label} (opens in a new tab)`}
                    className={cn(
                      "border-line text-ink-muted hover:border-line-strong hover:bg-surface-muted hover:text-ink active:duration-instant duration-fast ease-standard inline-flex size-10 items-center justify-center rounded-xs border transition-[color,border-color,background-color,transform] active:translate-y-px motion-reduce:transform-none",
                      RING,
                    )}
                  >
                    <SocialIcon name={social.id} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-line text-ink-muted mt-14 flex flex-col gap-2 border-t pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name}. All rights reserved.{" "}
            {CONTACT.offices.join(" · ")}
          </p>
          <div className="flex items-center gap-4">
            {settings.nipex_wording ? <p>{settings.nipex_wording}</p> : null}
            <Link
              href="/privacy"
              className="link-underline hit-area hover:text-ink"
            >
              Privacy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
