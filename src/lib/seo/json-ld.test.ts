import { describe, expect, it, vi } from "vitest";

vi.mock("./urls", () => ({
  siteUrl: () => "https://example.com",
  absoluteUrl: (path: string) => `https://example.com${path}`,
}));

import { FOUNDER, REGISTRATIONS } from "@/content/about";
import { SEO } from "@/content/seo";
import { SITE } from "@/content/site";
import { parseSettings } from "@/lib/supabase/types";
import { authorNode, schemaIds, siteGraph } from "./json-ld";

const graph = siteGraph(parseSettings([]));
const nodes = graph["@graph"] as unknown as Record<string, unknown>[];
const byType = (type: string) => nodes.find((node) => node["@type"] === type)!;

describe("siteGraph", () => {
  const ids = schemaIds();

  it("carries the organisation from the content files", () => {
    const org = byType("Organization");
    expect(org["@id"]).toBe(ids.organization);
    expect(org.name).toBe(SITE.name);
    expect(org.legalName).toBe(REGISTRATIONS[0].label);
    expect(org.slogan).toBe(SEO.tagline);
    expect(org.description).toBe(SEO.home.description);
    expect(org.knowsAbout).toEqual([...SEO.knowsAbout]);
    expect(org.founder).toEqual({ "@id": ids.founder });
  });

  it("carries the founder from the content files", () => {
    const person = byType("Person");
    expect(person["@id"]).toBe(ids.founder);
    expect(person.name).toBe(FOUNDER.name);
    expect(person.jobTitle).toBe(FOUNDER.role);
    expect(person.worksFor).toEqual({ "@id": ids.organization });
    expect(person.sameAs).toEqual(
      expect.arrayContaining([...FOUNDER.profiles]),
    );
  });

  it("names the founder as the author of his own articles, and anyone else by name", () => {
    expect(authorNode(FOUNDER.name)).toMatchObject({ name: FOUNDER.name });
    expect(authorNode("Someone Else")).toEqual({
      "@type": "Person",
      name: "Someone Else",
    });
  });
});
