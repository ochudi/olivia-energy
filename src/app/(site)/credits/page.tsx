import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import {
  CREDITS_PAGE,
  FONT_CREDITS,
  MAP_CREDIT,
  PORTRAIT_CREDITS,
} from "@/content/credits";
import { SEO } from "@/content/seo";
import { MICROCOPY } from "@/content/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils/cn";
import { CreditRow, LINK } from "./_components/credit-row";
import { DataCredits } from "./_components/data-credits";
import { PhotoCredits } from "./_components/photo-credits";

export const generateMetadata = pageMetadata({
  ...SEO.credits,
  path: "/credits",
});

/**
 * Credits: paper. Photographs, data, the map and the
 * typefaces, each with its author and licence, from content/credits; then
 * the share-alike note. Each typeface is named in its own face.
 */
export default function Page() {
  return (
    <Section surface="paper" hero="light" aria-labelledby="credits-title">
      <Container>
        <div className="max-w-text pb-16 lg:pb-24">
          <Display as="h1" size="xl" headline id="credits-title">
            {CREDITS_PAGE.title}
          </Display>
          <Lede className="mt-8">{CREDITS_PAGE.lede}</Lede>
        </div>

        <CreditRow id="photographs" title={CREDITS_PAGE.photographs.title} wide>
          <PhotoCredits />
          <ul className="text-ink mt-10 space-y-1 text-sm">
            {PORTRAIT_CREDITS.map((row) => (
              <li key={row.key}>
                <span className="font-display text-base">{row.image}.</span>{" "}
                {row.credit}.
              </li>
            ))}
            <li className="text-ink-muted">
              {CREDITS_PAGE.photographs.portraitsNote}
            </li>
          </ul>
        </CreditRow>

        <CreditRow id="data" title={CREDITS_PAGE.data.title}>
          <DataCredits />
        </CreditRow>

        <CreditRow id="map" title={CREDITS_PAGE.map.title}>
          <p className="font-display text-display-xs text-ink">
            <a
              href={MAP_CREDIT.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              {MAP_CREDIT.text}
              <span className="sr-only">{MICROCOPY.newTab}</span>
            </a>
          </p>
        </CreditRow>

        <CreditRow id="typefaces" title={CREDITS_PAGE.typefaces.title}>
          <div className="@container">
            <ul className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @xl:gap-6">
              {FONT_CREDITS.map((font, i) => (
                <li
                  key={font.name}
                  className="bg-card border-line flex flex-col rounded-xs border p-6 sm:p-8"
                >
                  <p
                    className={cn(
                      "text-ink text-display-md",
                      i === 0 ? "font-display" : "font-sans font-medium",
                    )}
                  >
                    <a
                      href={font.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK}
                    >
                      {font.name}
                      <span className="sr-only">{MICROCOPY.newTab}</span>
                    </a>
                  </p>
                  <p className="text-ink mt-6 text-sm">{font.designers}</p>
                  <p className="text-ink-muted mt-1 text-sm">
                    {font.copyright}
                  </p>
                  <p className="mt-6 text-sm">
                    <a
                      href={font.licenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(LINK, "text-ink")}
                    >
                      {font.licence}
                      <span className="sr-only">{MICROCOPY.newTab}</span>
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </CreditRow>

        <p className="border-line text-ink flex items-start gap-3 border-t pt-10 text-base lg:pl-[calc((100%+1.5rem)/3)]">
          <FlameBullet className="text-primary mt-[0.25em] h-[1.1em] shrink-0" />
          {CREDITS_PAGE.closingNote}
        </p>
      </Container>
    </Section>
  );
}
