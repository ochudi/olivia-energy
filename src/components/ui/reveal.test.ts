import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Reveal, type RevealProps } from "./reveal";

describe("<Reveal> server markup", () => {
  it("renders the final state (static) with the variant class", () => {
    const html = renderToStaticMarkup(
      createElement(
        Reveal,
        { variant: "fade", as: "p" } as RevealProps,
        "Energy is changing.",
      ),
    );
    expect(html).toContain('data-reveal="static"');
    expect(html).toContain('data-reveal-variant="fade"');
    expect(html).toContain('class="reveal-fade');
    expect(html).toMatch(/^<p /);
    expect(html).not.toContain("opacity:0");
  });

  it("puts the mask clip on an inner wrapper, not on the observed element", () => {
    const html = renderToStaticMarkup(
      createElement(
        Reveal,
        { variant: "mask", as: "h2" } as RevealProps,
        "Driven by evidence.",
      ),
    );
    expect(html).toContain('class="reveal-mask');
    expect(html).toMatch(
      /<span class="mask-clip block">Driven by evidence\.<\/span>/,
    );
  });

  it("puts the wipe clip on an inner wrapper that fills the box", () => {
    const html = renderToStaticMarkup(
      createElement(
        Reveal,
        { variant: "wipe" } as RevealProps,
        createElement("img", { alt: "" }),
      ),
    );
    expect(html).toContain('class="reveal-wipe');
    expect(html).toContain(
      '<span class="wipe-clip relative block h-full w-full">',
    );
  });

  it("writes the stagger delay as a custom property", () => {
    const html = renderToStaticMarkup(
      createElement(Reveal, { delay: 180 } as RevealProps, "x"),
    );
    expect(html).toContain("--reveal-delay:180ms");
  });
});
