import { describe, expect, it } from "vitest";
import { photoCaption } from "./shoulder-image";

describe("photoCaption", () => {
  it("keeps a Creative Commons licence on one line", () => {
    const text = photoCaption({
      caption: "Workshop, 2023. Photo: Ngozi Osadebe, CC BY-SA 4.0",
      credit: {
        author: "Ngozi Osadebe",
        licence: "CC BY-SA 4.0",
        licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        sourceUrl: "https://commons.wikimedia.org/",
        adapted: true,
      },
    });
    expect(text).toBe("Workshop, 2023. Photo: Ngozi Osadebe, CC BY-⁠SA 4.0");
    expect(text.replace(/[ ⁠]/g, (c) => (c === " " ? " " : ""))).toBe(
      "Workshop, 2023. Photo: Ngozi Osadebe, CC BY-SA 4.0",
    );
  });

  it("joins a legacy caption and photographer, leaving other text alone", () => {
    expect(
      photoCaption({
        caption: "Tanker on the Ibadan road",
        credit: "Fahd Aminu",
      }),
    ).toBe("Tanker on the Ibadan road. Photo: Fahd Aminu");
  });
});
