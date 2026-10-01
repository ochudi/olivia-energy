"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ROUTE_ERROR } from "@/content/errors";

/**
 * Route error boundary for the public site. Sits inside the (site) layout,
 * so header and footer stay in place; only this section is replaced.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="border-line border-b">
      <Container className="py-section-lg">
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow={ROUTE_ERROR.eyebrow}
          title={ROUTE_ERROR.title}
          lede={ROUTE_ERROR.lede}
        />
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button onClick={reset}>{ROUTE_ERROR.actions.retry}</Button>
          <Button href="/" variant="secondary">
            {ROUTE_ERROR.actions.home}
          </Button>
        </div>
        {error.digest ? (
          <p className="text-ink-subtle mt-8 font-mono text-xs">
            {ROUTE_ERROR.reference} {error.digest}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
