import { OpEdCover, wallTones } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { Section } from "@/components/ui/section";
import { isEnergyOpEd } from "@/content/commentary";
import { HOME_COMMENTARY } from "@/content/home";
import { CATEGORY_OPED_TOPICS, INSIGHTS_PAGE } from "@/content/insights";
import { getOpEds } from "@/lib/supabase/queries";
import type { PostCategory } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

const MAX = 3;

/** Written out in full so Tailwind sees every class. */
const COLUMNS = { 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;

/**
 * The founder's newest op-eds on a category's topics (client review P1-4
 * and idea 1): every Insights path ends on his BusinessDay work. Up to
 * three standard covers under the In BusinessDay heading, with "All
 * commentary" to the full wall. One match sits beside the heading, so no
 * cover is left alone in a row. Renders nothing when no op-ed matches.
 */
export async function RelatedOpEds({ category }: { category: PostCategory }) {
  const topics = CATEGORY_OPED_TOPICS[category];
  if (!topics.length) return null;
  const all = await getOpEds();
  const picked = all
    .filter(isEnergyOpEd)
    .filter((o) => o.topics.some((t) => topics.includes(t)))
    .slice(0, MAX);
  if (!picked.length) return null;

  // Colours as on the wall (no two neighbours alike); the lime lead stays
  // the newest op-ed's on the Insights wall, so it is never used here.
  const tones = wallTones([all[0], ...picked]).slice(1);
  const copy = INSIGHTS_PAGE.businessday;
  const one = picked.length === 1;
  const titleId = `related-opeds-${category}`;

  const header = (
    <div className={cn(one ? "lg:col-span-5" : "lg:col-span-7")}>
      <Display as="h2" size="lg" id={titleId}>
        {copy.title}
      </Display>
      <Button
        href={HOME_COMMENTARY.allLink.href}
        variant="text"
        className="mt-8"
      >
        {HOME_COMMENTARY.allLink.label}
      </Button>
    </div>
  );

  return (
    <Section surface="paper" aria-labelledby={titleId}>
      <Container>
        {one ? (
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-end lg:gap-x-6">
            {header}
            <div className="lg:col-span-6 lg:col-start-7">
              <OpEdCover
                oped={picked[0]}
                size="standard"
                compactOnPhone
                tone={tones[0]}
                headingLevel={3}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-6">
              {header}
            </div>
            <ul
              className={cn(
                "mt-12 grid grid-cols-1 gap-4 md:gap-6 lg:mt-16",
                COLUMNS[picked.length as 2 | 3],
              )}
            >
              {picked.map((oped, i) => (
                <li key={oped.slug}>
                  <OpEdCover
                    oped={oped}
                    size="standard"
                    compactOnPhone
                    tone={tones[i]}
                    headingLevel={3}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </Section>
  );
}
