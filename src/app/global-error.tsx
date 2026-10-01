"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { GLOBAL_ERROR } from "@/content/errors";
import {
  displayFont,
  displayItalicFont,
  sansFont,
  sansItalicFont,
} from "./fonts";
import "./globals.css";

/**
 * Replaces the root layout when the root itself throws, so it must render
 * <html>/<body> and pull in the fonts and global stylesheet on its own —
 * nothing above it in the tree still does. Kept dependency-light: the ui
 * components it imports (Button, Container, SectionHeading) have no
 * server-only imports, and the home link is a plain <a> as a last resort.
 */
export default function GlobalError({
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${displayItalicFont.variable} ${sansFont.variable} ${sansItalicFont.variable}`}
    >
      <body className="bg-canvas text-ink flex min-h-dvh flex-col font-sans antialiased">
        <main className="px-gutter py-section-lg flex flex-1 items-center justify-center">
          <Container size="narrow">
            <SectionHeading
              as="h1"
              align="center"
              eyebrow={GLOBAL_ERROR.eyebrow}
              title={GLOBAL_ERROR.title}
              lede={GLOBAL_ERROR.lede}
            />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Button onClick={reset}>{GLOBAL_ERROR.actions.retry}</Button>
              {/* A plain anchor on purpose: this boundary replaces the root
                  layout, so the home link must not depend on the Next.js
                  client router still being healthy. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="text-ink hover:text-primary duration-fast ease-standard text-sm font-medium underline underline-offset-4 transition-colors"
              >
                {GLOBAL_ERROR.actions.home}
              </a>
            </div>
            {error.digest ? (
              <p className="text-ink-subtle mt-8 text-center font-mono text-xs">
                {GLOBAL_ERROR.reference} {error.digest}
              </p>
            ) : null}
          </Container>
        </main>
      </body>
    </html>
  );
}
