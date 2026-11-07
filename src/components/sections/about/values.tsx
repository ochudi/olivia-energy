import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Glyph } from "@/components/ui/glyph";
import { Section } from "@/components/ui/section";
import { ABOUT_VALUES } from "@/content/about";

/**
 * About section 5, "Our values" (Core Values): the
 * header, then five full-width rows divided by hairlines: the glyph at
 * 48 px (col 1), the name in display-sm (cols 2 to 5), the sentence in
 * text-lg (cols 6 to 12). On phones glyph and name share a line and the
 * sentence follows. Each glyph draws itself as it scrolls in; the text is
 * static.
 */
export function Values() {
  return (
    <Section surface="paper" id="values" aria-labelledby="values-title">
      <Container>
        <Display as="h2" size="lg" id="values-title" className="max-w-[16ch]">
          {ABOUT_VALUES.title}
        </Display>
        <ul className="border-line mt-12 border-b md:mt-16">
          {ABOUT_VALUES.items.map((value) => (
            <li
              key={value.name}
              className="border-line grid grid-cols-[3rem_1fr] items-center gap-x-5 gap-y-4 border-t py-8 md:py-10 lg:grid-cols-12 lg:gap-x-6"
            >
              <span className="flex lg:col-span-1">
                <Glyph name={value.glyph} size={48} draw />
              </span>
              <h3 className="font-display text-display-sm text-ink font-normal text-balance lg:col-span-4">
                {value.name}
              </h3>
              <p className="text-ink-muted col-span-2 max-w-[56ch] font-sans text-lg text-pretty lg:col-span-7 lg:col-start-6">
                {value.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
