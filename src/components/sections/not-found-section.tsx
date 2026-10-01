import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { NAV } from "@/content/site";
import { NOT_FOUND, NOT_FOUND_LINKS } from "@/content/errors";

/**
 * NotFoundSection — the 404 body. Shared by the root not-found.tsx (unknown
 * top-level URLs, which miss the (site) route group entirely) and the
 * (site) not-found.tsx, so both render identically.
 */
export function NotFoundSection() {
  return (
    <section className="border-line border-b">
      <Container className="py-section-lg">
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow={NOT_FOUND.eyebrow}
          title={NOT_FOUND.title}
          lede={NOT_FOUND.lede}
        />

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href="/">{NOT_FOUND.actions.home}</Button>
          <Button href="/insights" variant="ghost" icon={<ArrowRight />}>
            {NOT_FOUND.actions.insights}
          </Button>
        </div>

        <div className="mt-16 md:mt-20">
          <h2 className="tracking-caps text-ink-muted font-sans text-xs font-medium uppercase">
            {NOT_FOUND.whereNext.heading}
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-x-10 md:grid-cols-2">
            {NAV.map((item) => {
              const description = NOT_FOUND_LINKS.find(
                (link) => link.href === item.href,
              )?.description;
              return (
                <li key={item.href} className="border-line border-t">
                  <Link
                    href={item.href}
                    className="group/link duration-fast ease-standard focus-visible:ring-focus focus-visible:ring-offset-canvas hover:text-primary flex items-center justify-between gap-6 py-5 transition-colors focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <span>
                      <span className="font-display text-display-xs block font-normal">
                        {item.label}
                      </span>
                      {description ? (
                        <span className="text-ink-muted mt-1 block text-sm">
                          {description}
                        </span>
                      ) : null}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="duration-fast ease-standard text-ink-muted group-hover/link:text-primary size-5 shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
