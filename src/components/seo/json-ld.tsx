import type { Graph, Thing, WithContext } from "schema-dts";

/** Renders a JSON-LD block; `<` is escaped so content can never close the tag. */
export function JsonLd({ data }: { data: Graph | WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
