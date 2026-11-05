import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { PRIVACY } from "@/content/legal";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = pageMetadata({
  ...PRIVACY.metadata,
  path: "/privacy",
});

/**
 * Privacy (creative brief 4.9): paper, the copy from content/legal on the
 * type scale. The heading block, then one row per section: its number and
 * heading in cols 1 to 4, its paragraphs in cols 5 to 11 at reading width.
 */
export default function Page() {
  return (
    <Section surface="paper" hero="light" aria-labelledby="privacy-title">
      <Container>
        <div className="max-w-[52rem]">
          <Eyebrow flame>{PRIVACY.eyebrow}</Eyebrow>
          <Display as="h1" size="xl" id="privacy-title" className="mt-6">
            {PRIVACY.title}
          </Display>
          <Lede className="mt-8 max-w-[48ch]">{PRIVACY.lede}</Lede>
          <p className="label text-ink-muted mt-8">
            {PRIVACY.updatedLabel}{" "}
            <span className="numerals">{PRIVACY.updated}</span>
          </p>
        </div>

        <ol className="mt-16 lg:mt-24">
          {PRIVACY.sections.map((section, i) => (
            <li
              key={section.heading}
              className="border-line grid grid-cols-1 gap-x-6 gap-y-4 border-t py-10 lg:grid-cols-12 lg:py-12"
            >
              <h2 className="font-display text-display-sm text-ink flex items-baseline gap-4 lg:col-span-4">
                <span
                  aria-hidden="true"
                  className="label text-primary numerals shrink-0 translate-y-[-0.2em]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="text-ink max-w-[68ch] space-y-5 text-base text-pretty lg:col-span-7 lg:col-start-6">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
