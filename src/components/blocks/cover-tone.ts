import type { CoverTone, OpEd, OpEdTopic } from "@/types/contracts";

/**
 * Cover colour by topic (build spec 2.8). Topics are listed in order of
 * relevance, so the first topic that maps decides. Climate and ESG is not in
 * the spec's table; it reads as transition, so it takes green.
 */
const TOPIC_TONE: Record<OpEdTopic, CoverTone> = {
  "Dangote Refinery": "red",
  "Energy security": "night",
  "Energy transition": "green",
  Downstream: "paper",
  "Oil and gas": "paper",
  Power: "lime",
  "Climate and ESG": "green",
  Policy: "paper-deep",
  Economy: "paper-deep",
};

/** The art motif follows the same topic, so colour and shape agree. */
export type CoverMotif = "mark" | "flame" | "ring" | "arc" | "tongue";

const TOPIC_MOTIF: Record<OpEdTopic, CoverMotif> = {
  "Dangote Refinery": "flame",
  Downstream: "flame",
  "Oil and gas": "flame",
  "Energy security": "ring",
  "Energy transition": "arc",
  Power: "arc",
  "Climate and ESG": "arc",
  Policy: "tongue",
  Economy: "tongue",
};

/**
 * The cover colour for an op-ed at a position in a wall: the lead (index
 * 0) is always lime; every other cover takes its first topic's colour.
 */
export function coverToneFor(o: OpEd, index: number): CoverTone {
  if (index === 0) return "lime";
  return TOPIC_TONE[o.topics[0]] ?? "paper-deep";
}

/** The art motif for a cover; the lead carries the whole mark. */
export function coverMotifFor(o: OpEd, lead: boolean): CoverMotif {
  if (lead) return "mark";
  return TOPIC_MOTIF[o.topics[0]] ?? "tongue";
}

/* When every topic's colour collides with a neighbour, a neutral ground
   stands in before any flood colour does. */
const FALLBACK: readonly CoverTone[] = [
  "paper-deep",
  "paper",
  "green",
  "night",
  "red",
];

/**
 * Colours for a whole wall. Each cover walks its topics in order and takes
 * the first colour that differs from the cover before it and the cover
 * above it (`aboveOf` maps an index to the index visually above, if any),
 * so two covers of one colour never touch. The lead stays lime.
 */
export function wallTones(
  opeds: readonly OpEd[],
  aboveOf: (index: number) => number | undefined = () => undefined,
): CoverTone[] {
  const tones: CoverTone[] = [];
  opeds.forEach((oped, index) => {
    if (index === 0) {
      tones.push("lime");
      return;
    }
    const avoid = new Set<CoverTone>();
    avoid.add(tones[index - 1]);
    const above = aboveOf(index);
    if (above !== undefined && tones[above]) avoid.add(tones[above]);
    const candidates = oped.topics.map((topic) => TOPIC_TONE[topic]);
    const pick =
      candidates.find((tone) => !avoid.has(tone)) ??
      FALLBACK.find((tone) => !avoid.has(tone)) ??
      coverToneFor(oped, index);
    tones.push(pick);
  });
  return tones;
}
