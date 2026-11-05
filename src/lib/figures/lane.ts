/**
 * Two-row lane layout for marks on a time line (Research Fig. 1's op-eds).
 *
 * Marks keep their true position until they would touch. Marks that would
 * touch form a cluster: the cluster sits at the mean of its marks' true
 * positions and its marks zigzag between two rows, half a pitch apart, in
 * date order. A lane is therefore never more than two marks deep, and no
 * mark moves further from its date than its cluster needs.
 *
 * The layout is computed once, in pixels, at the narrowest width the plate
 * renders at (`refWidth`). Each mark is then drawn at
 * `calc(<centre>% + <offset>px)`: centres scale with the plate while the
 * offsets stay fixed, so clusters only move further apart on wider plates
 * and a layout that is clear at `refWidth` is clear at every width above it.
 */
export type LaneOptions = {
  /** Narrowest plate width the lane must stay clear at, in px. */
  refWidth: number;
  /** Width of one mark, in px. */
  mark: number;
  /** Minimum clear space between marks in the same row, in px. */
  gap: number;
};

export type LaneMark = {
  /** Cluster centre, as a fraction of the lane width (0 to 1). */
  centre: number;
  /** Offset of this mark from the cluster centre, in px. */
  offset: number;
  /** 0 is the row nearest the axis, 1 the row under it. */
  row: 0 | 1;
};

type Cluster = { members: number[]; centre: number };

/**
 * Lays out marks given as sorted fractions of the lane width (0 to 1).
 * Returns one entry per input, in the same order.
 */
export function laneLayout(
  xs: readonly number[],
  { refWidth, mark, gap }: LaneOptions,
): LaneMark[] {
  const pitch = mark + gap; // centre to centre, same row
  const zig = pitch / 2; // centre to centre, consecutive marks
  const half = (n: number) => ((n - 1) / 2) * zig + mark / 2;
  const clamp = (c: Cluster) => {
    const h = half(c.members.length);
    c.centre = Math.min(Math.max(c.centre, h), refWidth - h);
  };

  const clusters: Cluster[] = [];
  xs.forEach((x, i) => {
    const next: Cluster = { members: [i], centre: x * refWidth };
    clamp(next);
    clusters.push(next);
    // Merge backwards while the newest cluster touches the one before it.
    while (clusters.length > 1) {
      const b = clusters[clusters.length - 1]!;
      const a = clusters[clusters.length - 2]!;
      const clear =
        b.centre - half(b.members.length) - (a.centre + half(a.members.length));
      if (clear >= gap) break;
      const members = [...a.members, ...b.members];
      const merged: Cluster = {
        members,
        centre:
          members.reduce((s, m) => s + xs[m]! * refWidth, 0) / members.length,
      };
      clamp(merged);
      clusters.splice(-2, 2, merged);
    }
  });

  const out: LaneMark[] = new Array(xs.length);
  for (const c of clusters) {
    const n = c.members.length;
    c.members.forEach((m, k) => {
      out[m] = {
        centre: c.centre / refWidth,
        offset: n === 1 ? 0 : (k - (n - 1) / 2) * zig,
        row: n === 1 ? 0 : ((k % 2) as 0 | 1),
      };
    });
  }
  return out;
}
