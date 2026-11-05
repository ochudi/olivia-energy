import { describe, expect, it } from "vitest";
import { OPEDS, isEnergyOpEd } from "@/content/commentary";
import { coverMotifFor, coverToneFor, wallTones } from "./cover-tone";

describe("coverToneFor", () => {
  it("makes the lead lime whatever its topic", () => {
    expect(coverToneFor(OPEDS[0], 0)).toBe("lime");
  });

  it("colours other covers by their first topic", () => {
    const dangote = OPEDS.find((o) => o.topics[0] === "Dangote Refinery");
    const security = OPEDS.find((o) => o.topics[0] === "Energy security");
    const policy = OPEDS.find((o) => o.topics[0] === "Policy");
    expect(dangote && coverToneFor(dangote, 1)).toBe("red");
    expect(security && coverToneFor(security, 1)).toBe("night");
    expect(policy && coverToneFor(policy, 1)).toBe("paper-deep");
  });

  it("gives the lead the whole mark as art", () => {
    expect(coverMotifFor(OPEDS[0], true)).toBe("mark");
  });
});

describe("wallTones", () => {
  it("never puts one colour beside or above itself on the archive wall", () => {
    const above = (i: number) =>
      i >= 5 ? i - 3 : i === 4 ? 1 : i >= 2 ? 0 : undefined;
    const tones = wallTones(OPEDS, above);
    expect(tones[0]).toBe("lime");
    tones.forEach((tone, i) => {
      if (i === 0) return;
      expect(tone).not.toBe(tones[i - 1]);
      const a = above(i);
      if (a !== undefined) expect(tone).not.toBe(tones[a]);
    });
  });

  it("keeps the home wall's 2 x 2 free of touching repeats", () => {
    const wall = [OPEDS[0], ...OPEDS.slice(1).filter(isEnergyOpEd).slice(0, 4)];
    const tones = wallTones(wall, (i) => (i >= 3 ? i - 2 : undefined));
    expect(tones[1]).not.toBe(tones[2]);
    expect(tones[3]).not.toBe(tones[4]);
    expect(tones[3]).not.toBe(tones[1]);
    expect(tones[4]).not.toBe(tones[2]);
  });
});
