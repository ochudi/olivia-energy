import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Turn } from "@/components/ui/display";
import { Logo } from "@/components/ui/logo";
import { FOOTER, MICROCOPY, SERVICES, SOCIALS } from "@/content/site";
import { MARK_PATHS } from "@/lib/brand/mark";
import { getSettings } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils/cn";

/** Unified focus ring for every link in the footer. */
const RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
const HEADING = "text-ink-muted font-sans text-sm font-medium";
const LINK = cn(
  "link-underline tap text-ink hover:text-ink duration-fast ease-standard inline-block rounded-xs py-1 text-sm transition-colors",
  RING,
);

/**
 * The tagline in two lines, split at the first full stop. A tagline without
 * a second sentence keeps one line.
 */
export function splitTagline(tagline: string): [string, string] {
  const text = tagline.trim();
  const stop = text.indexOf(".");
  if (stop === -1 || stop === text.length - 1) return [text, ""];
  return [text.slice(0, stop + 1).trim(), text.slice(stop + 1).trim()];
}

function Column({
  title,
  id,
  className,
  children,
}: {
  title: string;
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <nav aria-labelledby={id} className={className}>
      <h2 id={id} className={HEADING}>
        {title}
      </h2>
      <ul className="mt-5 space-y-1.5">{children}</ul>
    </nav>
  );
}

/**
 * SiteFooter — night. Row 1: the tagline from
 * settings, the first sentence in display-xl, the second as the lime
 * italic turn in display-lg (with the home hero, the one italic line on the
 * site; DESIGN.md Typography). Row 2: the company, What we do, Company,
 * Get in touch. Row 3: the legal line and the photograph credits with
 * "Full credits". The ring of the mark, drawn as a faint line, bleeds off
 * the top right; the footer clips it (it is not an ancestor of <main>).
 */
export async function SiteFooter() {
  const year = new Date().getFullYear();
  const settings = await getSettings();
  const [first, second] = splitTagline(settings.tagline);
  const linkedinDefault = SOCIALS.find((social) => social.id === "linkedin");
  const linkedin = settings.socials.linkedin ?? linkedinDefault?.href;

  return (
    <footer
      id="site-footer"
      data-surface="night"
      className="bg-canvas text-ink relative isolate mt-auto overflow-clip"
    >
      <svg
        viewBox="0 0 72 100"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute top-[-18%] right-[-14%] -z-10 h-[78%] min-h-120 w-auto"
      >
        <path
          d={MARK_PATHS.ring}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.18}
          className="text-white/12"
        />
      </svg>

      <Container className="pt-section pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
        <p className="font-display font-normal text-balance">
          <span className="text-display-xl text-ink block max-w-[14ch]">
            {first}
          </span>
          {second ? (
            <span className="text-display-lg mt-2 block max-w-[18ch] md:mt-3">
              <Turn>{second}</Turn>
            </span>
          ) : null}
        </p>

        <div className="border-line mt-16 grid grid-cols-1 gap-x-6 gap-y-12 border-t pt-12 md:mt-24 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className={cn(
                "tap inline-flex rounded-xs text-[1.5rem] leading-none",
                RING,
              )}
            >
              <Logo />
              <span className="sr-only">, home</span>
            </Link>
            <div className="text-ink-muted mt-6 space-y-1 text-sm">
              <p className="text-ink">{FOOTER.legalName}</p>
              <p className="numerals">{FOOTER.registration}</p>
              <p>{FOOTER.places[0]}</p>
              <p>{FOOTER.places[1]}</p>
            </div>
          </div>

          <Column
            title={FOOTER.headings.services}
            id="footer-services"
            className="lg:col-span-3"
          >
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link href={`/what-we-do#${service.slug}`} className={LINK}>
                  {service.title}
                </Link>
              </li>
            ))}
          </Column>

          <Column
            title={FOOTER.headings.company}
            id="footer-company"
            className="lg:col-span-2"
          >
            {FOOTER.companyLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={LINK}>
                  {item.label}
                </Link>
              </li>
            ))}
          </Column>

          <Column
            title={FOOTER.headings.contact}
            id="footer-contact"
            className="lg:col-span-3"
          >
            <li>
              <a
                href={`mailto:${settings.contact_email}`}
                className={cn(LINK, "break-all")}
              >
                {settings.contact_email}
              </a>
            </li>
            {linkedin ? (
              <li>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  {linkedinDefault?.label}
                  <span className="sr-only">{MICROCOPY.newTab}</span>
                </a>
              </li>
            ) : null}
            <li className="pt-3">
              <Link
                href={FOOTER.conversation.href}
                className={cn(
                  "group tap text-primary inline-flex items-center gap-2.5 rounded-xs py-1 text-sm font-medium",
                  RING,
                )}
              >
                <span className="link-underline">
                  {FOOTER.conversation.label}
                </span>
              </Link>
            </li>
          </Column>
        </div>

        <div className="border-line text-ink-muted mt-16 flex flex-col gap-4 border-t pt-6 text-xs leading-relaxed md:mt-20 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="space-y-1">
            <p>{FOOTER.copyright(year)}</p>
            {settings.nipex_wording ? <p>{settings.nipex_wording}</p> : null}
          </div>
          <p className="max-w-[68ch] lg:text-right">
            {FOOTER.photoCredits.text}{" "}
            <Link
              href={FOOTER.photoCredits.link.href}
              className={cn(
                "text-ink tap inline-block underline decoration-current/40 underline-offset-4 hover:decoration-current",
                RING,
              )}
            >
              {FOOTER.photoCredits.link.label}
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
