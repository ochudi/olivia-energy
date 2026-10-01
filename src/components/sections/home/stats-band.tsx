import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Stat } from "@/components/ui/stat";
import { getSettings } from "@/lib/supabase/queries";

/**
 * Stats band — counting figures on the inverse surface, from the settings
 * table (Admin → Settings → Homepage stats). Renders nothing unless an
 * admin switches it on (settings.stats_visible); the defaults, with their
 * sources, are in content/home.ts.
 */
export async function StatsBand() {
  const { stats, stats_visible } = await getSettings();
  if (!stats_visible || stats.length === 0) return null;
  return (
    <section
      id="stats"
      data-tone="inverse"
      className="bg-inverse text-ink py-section"
    >
      <Container>
        <Reveal>
          <Eyebrow>By the numbers</Eyebrow>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((stat) => (
            <Stat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
              size="lg"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
