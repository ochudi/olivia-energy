import type { CSSProperties } from "react";
import { Chip } from "@/components/ui/chip";
import { FOUNDER_PAGE } from "@/content/about";
import styles from "./founder.module.css";

/**
 * "Credentials": the dated degrees on a 1 px line with ring nodes (in the
 * order of the ORCID record), then the undated credentials as wrapping
 * chips (the longest runs to two lines on a phone). The line draws and the
 * nodes pop in order as the timeline scrolls into view (founder.module.css).
 */
export function FounderTimeline() {
  const { timeline } = FOUNDER_PAGE;
  const n = timeline.dated.length;
  return (
    <div>
      <h3 className="font-display text-display-xs text-ink">
        {timeline.heading}
      </h3>
      <div
        className={`${styles.dated} draw-scope mt-8`}
        style={{ "--n": n } as CSSProperties}
      >
        <span aria-hidden="true" className={styles.line} />
        <ol className={styles.list}>
          {timeline.dated.map((item, i) => (
            <li
              key={item.year}
              className={styles.item}
              style={{ "--pos": i / n } as CSSProperties}
            >
              <span aria-hidden="true" className={styles.node} />
              <span className="font-display text-display-xs numerals text-ink block">
                {item.year}
              </span>
              <span className="text-ink-muted mt-2 block font-sans text-sm text-pretty">
                {item.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <ul className="mt-8 flex flex-wrap gap-2">
        {timeline.undated.map((label) => (
          <Chip key={label} as="li" wrap>
            {label}
          </Chip>
        ))}
      </ul>
    </div>
  );
}
