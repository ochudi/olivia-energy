import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { VISION_MISSION } from "@/content/about";
import { cn } from "@/lib/utils/cn";

/** Vision and mission side by side, split by a hairline. */
export function VisionMission() {
  const items = [VISION_MISSION.vision, VISION_MISSION.mission];
  return (
    <section id="vision-mission" className="border-line border-y">
      <Container>
        <div className="grid md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "py-12 md:py-16",
                index === 0
                  ? "border-line border-b md:border-b-0 md:pr-12"
                  : "border-line md:border-l md:pl-12",
              )}
            >
              <Eyebrow>{item.label}</Eyebrow>
              <p className="font-display text-display-sm mt-6 max-w-[28ch] font-normal tracking-tight text-balance">
                {item.statement}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
