import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  PublicationCard,
  PublicationList,
  PublicationsJsonLd,
} from "@/components/publications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { PUBLICATIONS } from "@/content/publications";
import { SEO } from "@/content/seo";
import { groupByYear } from "@/lib/publications/group";
import { doiOf } from "@/lib/research/doi";
import { getAuthorMetrics, getCitationCounts } from "@/lib/research/openalex";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/urls";
import { getPublications, getSettings } from "@/lib/supabase/queries";

export const generateMetadata = pageMetadata({
  ...SEO.publications,
  path: "/publications",
});

/**
 * Publications. The papers come from `publications` (featured first, then
 * the admin's sort, then year) and the founder's Google Scholar link from
 * settings; both are cached by tag, so the page is static until an admin
 * saves. Citation figures come from OpenAlex and refresh daily; when that
 * read fails the page simply shows no counts.
 */
export default async function Page() {
  const [publications, settings, metrics] = await Promise.all([
    getPublications(),
    getSettings(),
    getAuthorMetrics(PUBLICATIONS.profile.openalexAuthorId),
  ]);
  const citations = await getCitationCounts(
    publications.map((p) => doiOf(p.url)).filter((d): d is string => !!d),
  );
  const citedFor = (url: string | null) => {
    const doi = doiOf(url);
    return doi ? citations.get(doi) : undefined;
  };
  const featured = publications.filter((p) => p.featured);
  const groups = groupByYear(publications);
  const scholarUrl = settings.scholar_url || null;
  const url = absoluteUrl("/publications");
  const profile: { label: string; value: number }[] = [
    {
      label: PUBLICATIONS.profile.metrics.articles,
      value: publications.length,
    },
  ];
  if (metrics) {
    profile.push(
      {
        label: PUBLICATIONS.profile.metrics.citations,
        value: metrics.citedByCount,
      },
      { label: PUBLICATIONS.profile.metrics.hIndex, value: metrics.hIndex },
      { label: PUBLICATIONS.profile.metrics.i10Index, value: metrics.i10Index },
    );
  }

  return (
    <>
      <PublicationsJsonLd publications={publications} url={url} />
      <section id="overview" className="border-line border-b">
        <Container className="py-section">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <SectionHeading
                as="h1"
                size="lg"
                eyebrow={PUBLICATIONS.eyebrow}
                title={PUBLICATIONS.title}
                lede={PUBLICATIONS.intro}
              />
            </div>
            {publications.length ? (
              <Card
                as="aside"
                padding="md"
                aria-labelledby="profile-heading"
                className="self-start lg:col-span-4 lg:col-start-9"
              >
                <Eyebrow as="h2" id="profile-heading">
                  {PUBLICATIONS.profile.heading}
                </Eyebrow>
                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
                  {profile.map((item) => (
                    <div key={item.label}>
                      <dt className="text-ink-muted text-xs">{item.label}</dt>
                      <dd className="font-display text-display-sm text-ink mt-1 leading-none font-normal tabular-nums">
                        {item.value.toLocaleString("en")}
                      </dd>
                    </div>
                  ))}
                </dl>
                {scholarUrl ? (
                  <Button
                    href={scholarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    icon={<ArrowUpRight />}
                    className="mt-6"
                  >
                    {PUBLICATIONS.scholarLabel}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Button>
                ) : null}
                {metrics ? (
                  <p className="text-ink-muted mt-5 text-xs leading-relaxed">
                    {PUBLICATIONS.profile.note}
                  </p>
                ) : null}
              </Card>
            ) : null}
          </div>
        </Container>
      </section>

      {featured.length ? (
        <section
          id="featured"
          aria-labelledby="featured-heading"
          className="border-line border-b"
        >
          <Container className="py-section-sm">
            <Eyebrow as="h2" id="featured-heading">
              {PUBLICATIONS.featured.heading}
            </Eyebrow>
            <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((publication) => (
                <li key={publication.id}>
                  <PublicationCard
                    publication={publication}
                    citations={citedFor(publication.url)}
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <section
        id="all"
        aria-labelledby="all-heading"
        className="scroll-mt-header py-section-sm"
      >
        <Container>
          <Eyebrow as="h2" id="all-heading">
            {PUBLICATIONS.all.heading}
          </Eyebrow>
          {publications.length ? (
            <PublicationList
              groups={groups}
              citations={citations}
              className="mt-8"
            />
          ) : (
            <div className="border-line mt-8 border-t pt-8">
              <p className="font-display text-display-xs text-ink font-normal">
                {PUBLICATIONS.empty.title}
              </p>
              <p className="text-ink-muted max-w-text mt-3 text-base leading-relaxed text-pretty">
                {PUBLICATIONS.empty.body}
              </p>
              <Button
                href={PUBLICATIONS.empty.link.href}
                variant="ghost"
                icon={<ArrowRight />}
                className="mt-6"
              >
                {PUBLICATIONS.empty.link.label}
              </Button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
