import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { FlameBullet } from "@/components/ui/flame-bullet";
import { Lede } from "@/components/ui/lede";
import { Section } from "@/components/ui/section";
import { AUDIENCES } from "@/content/brand";
import { cn } from "@/lib/utils/cn";

export type WhoWeServeProps = {
  /**
   * compact (home): four tiles in a row at 1024 px and up, about 306 x 380.
   * full (What we do): a 2 x 2 of wide tiles with larger titles and the
   * list in two columns where it is long.
   */
  variant: "compact" | "full";
  id?: string;
};

/**
 * WhoWeServe — the four kinds of institution (creative brief 4.1 section 5,
 * 4.2 section 11), each on its own flood tile in the shoulder (the firm's
 * own objects, DESIGN.md Shapes): Governments green, Private sector night,
 * Development partners lime, Academia red. Every list is visible; no
 * interaction; nothing animates.
 */
export function WhoWeServe({ variant, id = "who-we-serve" }: WhoWeServeProps) {
  const full = variant === "full";
  const headingId = `${id}-title`;
  return (
    <Section surface="paper-deep" id={id} aria-labelledby={headingId}>
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Display
            as="h2"
            size="lg"
            id={headingId}
            className="max-w-[16ch] lg:col-span-7"
          >
            {AUDIENCES.title}
          </Display>
          <Lede className="lg:col-span-5 lg:pb-2">{AUDIENCES.lede}</Lede>
        </div>

        {/* Columns follow the list's own width (container queries), so a
            near-square screen gets two columns, not a stretched stack. */}
        <div className="@container">
          <ul
            className={cn(
              "mt-12 grid grid-cols-1 gap-4 md:mt-16 @xl:grid-cols-2 @xl:gap-6",
              !full && "@4xl:grid-cols-4",
            )}
          >
            {AUDIENCES.items.map((audience) => (
              <li key={audience.name}>
                <article
                  data-surface={audience.surface}
                  className={cn(
                    "shoulder bg-canvas text-ink flex h-full flex-col p-6 md:p-7",
                    full ? "min-h-[20rem] lg:p-10" : "lg:min-h-[23.75rem]",
                  )}
                >
                  <h3
                    className={cn(
                      "font-display text-ink pt-12 font-normal text-balance",
                      full
                        ? "text-display-md lg:pt-16"
                        : "text-display-sm lg:pt-20",
                    )}
                  >
                    {audience.name}
                  </h3>
                  <ul
                    className={cn(
                      "border-line mt-5 border-t pt-5 text-sm",
                      full &&
                        audience.items.length > 3 &&
                        "sm:columns-2 sm:gap-6",
                    )}
                  >
                    {audience.items.map((item) => (
                      <li
                        key={item}
                        className="flex break-inside-avoid items-baseline gap-2.5 py-1"
                      >
                        <FlameBullet className="text-primary relative top-[0.1em] h-[0.95em]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
