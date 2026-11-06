import type { CSSProperties } from "react";
import type { Surface } from "@/types/contracts";
import { Display } from "@/components/ui/display";
import { Section } from "@/components/ui/section";
import { MISSION, VISION } from "@/content/brand";
import { cn } from "@/lib/utils/cn";

type Panel = {
  id: string;
  surface: Extract<Surface, "green" | "lime">;
  heading: string;
  text: string;
  /** Inner padding that lines the text up with the page grid. */
  pad: string;
};

/* The left panel's text starts on the page container's first column; the
   right panel mirrors it on its right edge. */
const EDGE =
  "max(var(--spacing-gutter), calc((100vw - var(--container-page)) / 2 + var(--spacing-gutter)))";

const PANELS: readonly Panel[] = [
  {
    id: "vision",
    surface: "green",
    heading: VISION.heading,
    text: VISION.text,
    pad: "lg:pr-[clamp(3rem,1rem+4vw,6rem)] lg:pl-[var(--edge)]",
  },
  {
    id: "mission",
    surface: "lime",
    heading: MISSION.heading,
    text: MISSION.text,
    pad: "lg:pr-[var(--edge)] lg:pl-[clamp(3rem,1rem+4vw,6rem)]",
  },
];

/**
 * About section 4, vision and mission (creative brief 4.3): two flood
 * panels side by side, each half the viewport and at least 560 px tall,
 * each with the large shoulder on its top-right corner (a flood panel is
 * one of the firm's own objects, DESIGN.md Shapes); the heading in
 * Newsreader at display-xs, the statement in display-md, at most 520 px
 * wide. Stacked on phones. Static.
 */
export function VisionMission() {
  return (
    // At desktop each panel is half the viewport, too narrow for the header
    // to read on its own: over the split it takes the vision panel's green
    // (the logo's side). Stacked on phones, each panel is read directly.
    <Section
      surface="paper"
      headerSurface="green"
      spacing="none"
      id="vision-mission"
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ "--edge": EDGE } as CSSProperties}
      >
        {PANELS.map((panel) => (
          <div
            key={panel.id}
            id={panel.id}
            data-surface={panel.surface}
            className={cn(
              "bg-canvas text-ink shoulder-lg px-gutter py-section-sm flex min-h-104 flex-col justify-between gap-16 lg:min-h-140",
              panel.pad,
            )}
          >
            <h2 className="font-display text-display-xs text-ink">
              {panel.heading}
            </h2>
            <Display as="p" size="md" className="max-w-[min(22ch,32.5rem)]">
              {panel.text}
            </Display>
          </div>
        ))}
      </div>
    </Section>
  );
}
