import { describe, expect, it } from "vitest";
import { typeset } from "./text";

describe("typeset", () => {
  it.each([
    ["Nigeria's downstream", "Nigeria’s downstream"],
    ["operators' margins", "operators’ margins"],
    ['He called it "a tax on distance".', "He called it “a tax on distance”."],
    ["the 'so-called' rule", "the ‘so-called’ rule"],
    ['("quoted")', "(“quoted”)"],
    ["since the '90s", "since the ’90s"],
    ["\"Outer 'inner' words\"", "“Outer ‘inner’ words”"],
    ["no marks at all", "no marks at all"],
    ["'50 to 55 per cent', he said", "‘50 to 55 per cent’, he said"],
    ["'27.5% and rising'", "‘27.5% and rising’"],
    ["in FY'24 and 2023/'24", "in FY’24 and 2023/’24"],
    [
      "Sa'id and the marketers' association",
      "Sa’id and the marketers’ association",
    ],
    ['"We went—"', "“We went—”"],
  ])("%s", (typed, set) => {
    expect(typeset(typed)).toBe(set);
  });

  it("closes a quote that follows another text node", () => {
    expect(typeset('" he said', "d")).toBe("” he said");
    expect(typeset('"Opening', " ")).toBe("“Opening");
  });

  it("opens a quote that runs into the next text node", () => {
    expect(typeset('He said "', "", "D")).toBe("He said “");
    expect(typeset('the end."', "", "")).toBe("the end.”");
  });
});
