import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { FOUNDER } from "@/content/about";

/**
 * Founder — portrait, name, credentials row, biography and a link to
 * Publications. The portrait is a PNG on white: multiply-blended onto the
 * canvas with no frame, cropped to 4:5. Without a file the slot is a quiet
 * muted panel of the same shape.
 */
export function Founder() {
  const { portrait } = FOUNDER;
  return (
    <section id="founder" className="py-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal as="figure" className="max-w-sm lg:col-span-4 lg:max-w-none">
            <div
              className={
                portrait.src
                  ? "bg-canvas relative overflow-hidden"
                  : "bg-surface-muted relative overflow-hidden"
              }
              style={{ aspectRatio: portrait.aspect }}
            >
              {portrait.src ? (
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(min-width: 64rem) 358px, (min-width: 24rem) 384px, calc(100vw - 40px)"
                  className="object-cover mix-blend-multiply"
                />
              ) : null}
            </div>
            {portrait.src ? null : (
              <figcaption className="text-ink-muted mt-3 font-mono text-xs">
                {portrait.caption}
              </figcaption>
            )}
          </Reveal>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal>
              <Eyebrow number="03">{FOUNDER.eyebrow}</Eyebrow>
              <h2 className="font-display text-display-md mt-6 font-normal tracking-tight">
                {FOUNDER.name}
              </h2>
            </Reveal>
            <p className="text-ink-muted mt-2 text-base">{FOUNDER.role}</p>
            <ul
              aria-label="Credentials"
              className="text-ink mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm font-medium"
            >
              {FOUNDER.credentials.map((credential, index) => (
                <Fragment key={credential}>
                  {index > 0 ? (
                    <li aria-hidden className="text-ink-subtle">
                      ·
                    </li>
                  ) : null}
                  <li>{credential}</li>
                </Fragment>
              ))}
            </ul>
            <div className="text-ink-muted max-w-text mt-8 space-y-5 text-base leading-relaxed text-pretty">
              {FOUNDER.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <Button
              href={FOUNDER.link.href}
              variant="ghost"
              icon={<ArrowRight />}
              className="mt-8"
            >
              {FOUNDER.link.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
