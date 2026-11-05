import type { ReactNode } from "react";
import type { CoverTone } from "@/types/contracts";
import {
  CloseBand,
  CoverWall,
  OpEdCover,
  QuotePanel,
  WhoWeServe,
} from "@/components/blocks";
import { SurfaceFrame } from "./frame";
import { COVER_COPY } from "@/content/brand";
import { HOME_COMMENTARY } from "@/content/home";
import { getOpEds } from "@/lib/supabase/queries";

const TONES: readonly CoverTone[] = [
  "lime",
  "red",
  "green",
  "night",
  "paper",
  "paper-deep",
];

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="label text-ink-muted border-line mb-6 border-b pb-3">
      {children}
    </p>
  );
}

/** The shared blocks on their surfaces with real data (was /blocks-preview). */
export async function BlocksSheet() {
  const opeds = await getOpEds();
  const quoted =
    opeds.find((o) => o.slug === HOME_COMMENTARY.quoteSlug && o.pullQuote) ??
    opeds.find((o) => o.pullQuote);

  return (
    <div className="flex flex-col gap-8">
      <SurfaceFrame surface="paper" id="cover-wall-home" className="p-5 md:p-8">
        <Label>CoverWall layout=home, QuotePanel</Label>
        <CoverWall opeds={opeds} layout="home" headingLevel={4} />
        {quoted?.pullQuote ? (
          <div className="mt-6 md:mt-10">
            <QuotePanel
              quote={quoted.pullQuote}
              attribution={COVER_COPY.attribution(quoted)}
            />
          </div>
        ) : null}
      </SurfaceFrame>

      <SurfaceFrame
        surface="paper-deep"
        id="cover-tones"
        className="p-5 md:p-8"
      >
        <Label>OpEdCover size=standard, every tone</Label>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {TONES.map((tone, i) => (
            <li key={tone}>
              <OpEdCover
                oped={opeds[(i + 2) % opeds.length]}
                size="standard"
                tone={tone}
                headingLevel={4}
              />
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Label>OpEdCover size=compact</Label>
          <ul className="grid max-w-md grid-cols-1 gap-4">
            {opeds.slice(1, 4).map((oped, i) => (
              <li key={oped.slug}>
                <OpEdCover
                  oped={oped}
                  size="compact"
                  tone={TONES[(i + 1) % TONES.length]}
                  headingLevel={4}
                />
              </li>
            ))}
          </ul>
        </div>
      </SurfaceFrame>

      <SurfaceFrame surface="paper-deep" className="p-0">
        <WhoWeServe variant="compact" id="who-compact" />
      </SurfaceFrame>
      <SurfaceFrame surface="red" id="close-home" className="p-0">
        <CloseBand variant="home" />
      </SurfaceFrame>
    </div>
  );
}
