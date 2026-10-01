import { describe, expect, it } from "vitest";
import { doiOf } from "./doi";

describe("doiOf", () => {
  it("extracts a DOI from a doi.org link and lower-cases it", () => {
    expect(doiOf("https://doi.org/10.32479/IJEEP.17131")).toBe(
      "10.32479/ijeep.17131",
    );
  });
  it("accepts a bare DOI and ignores fragments", () => {
    expect(doiOf("10.1016/j.sciaf.2022.e01207#section")).toBe(
      "10.1016/j.sciaf.2022.e01207",
    );
  });
  it("returns null for links without a DOI", () => {
    expect(
      doiOf("https://econjournals.com/index.php/ijeep/article/view/13109"),
    ).toBe(null);
    expect(doiOf(null)).toBe(null);
  });
});
