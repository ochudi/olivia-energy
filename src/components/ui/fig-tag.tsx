import { Chip } from "./chip";

/** FigTag — the "Fig. n" pill that opens every figure plate (brief 2.6). */
export function FigTag({ n }: { n: number }) {
  return (
    <Chip tone="outline">
      Fig.{" "}
      {n}
    </Chip>
  );
}
