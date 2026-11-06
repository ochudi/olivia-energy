"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Display } from "@/components/ui/display";
import { RingMark } from "@/components/ui/ring";
import { Section } from "@/components/ui/section";
import { ROUTE_ERROR } from "@/content/errors";

/**
 * Route error boundary for the public site. Sits inside the (site) layout,
 * so header and footer stay in place; only this section is replaced. Paper,
 * in the 404's layout: the open ring, then the message and two actions.
 * Next 16 passes `retry` (re-fetch and re-render); `reset` is the fallback.
 */
export default function Error({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section
      surface="paper"
      hero="light"
      aria-labelledby="error-title"
      className="flex min-h-[70svh] items-center"
    >
      <Container className="w-full">
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-center lg:gap-x-6">
          <div className="text-primary lg:col-span-3">
            <RingMark size={160} gap={0.25} />
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <Display as="h1" size="lg" id="error-title">
              {ROUTE_ERROR.title}
            </Display>
            <p className="text-ink-muted mt-8 max-w-[42ch] text-xl text-pretty">
              {ROUTE_ERROR.lede}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button onClick={() => (retry ?? reset)?.()}>
                {ROUTE_ERROR.actions.retry}
              </Button>
              <Button href="/" variant="secondary">
                {ROUTE_ERROR.actions.home}
              </Button>
            </div>
            {error.digest ? (
              <p className="source-line text-ink-muted mt-8">
                {ROUTE_ERROR.reference}{" "}
                <span className="font-mono">{error.digest}</span>
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
