import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HERO } from "@/content/home";
import { HeroCurrents } from "./hero-currents";

/**
 * Hero — the one display-xl statement on the site, on the flat inverse
 * surface with the Currents canvas moving behind it. `data-hero="dark"`
 * lets the fixed header sit transparent over it; `-mt-header` pulls the
 * section under the header and `pt-header` gives the space back. The text
 * block is the LCP element and carries `data-currents-avoid`, which the
 * canvas reads to thin the field behind the words. The canvas paints after
 * hydration and never changes layout.
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-hero="dark"
      data-tone="inverse"
      className="bg-inverse text-ink -mt-header pt-header relative isolate overflow-hidden"
    >
      <HeroCurrents className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      <Container className="flex max-h-[56rem] min-h-[calc(100svh-var(--spacing-header))] flex-col py-[clamp(4rem,10vh,8rem)]">
        <div className="my-auto" data-currents-avoid>
          <Eyebrow>{HERO.eyebrow}</Eyebrow>
          <h1 className="font-display text-display-xl mt-6 max-w-[17ch] font-normal text-balance">
            {HERO.title}
          </h1>
          <p className="text-ink-muted mt-8 max-w-[38ch] text-lg text-balance">
            {HERO.lede}
          </p>
          <div className="mt-10 flex w-fit flex-wrap items-center gap-x-8 gap-y-4">
            <Button href={HERO.primary.href} size="lg">
              {HERO.primary.label}
            </Button>
            <Button href={HERO.secondary.href} variant="ghost" size="lg">
              {HERO.secondary.label}
            </Button>
          </div>
        </div>
        <ul className="border-line text-ink-muted mt-auto flex flex-col gap-1 border-t pt-5 text-sm sm:flex-row sm:gap-x-6">
          {HERO.credentials.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
