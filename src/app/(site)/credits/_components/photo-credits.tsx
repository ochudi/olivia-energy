import Image from "next/image";
import { CREDITS_PAGE, PHOTO_CREDITS } from "@/content/credits";
import { PHOTOS, type PhotoKey } from "@/content/images";
import { MICROCOPY } from "@/content/site";
import { cn } from "@/lib/utils/cn";
import { LINK } from "./credit-row";

const cols = CREDITS_PAGE.photographs.columns;

/* Phones: each row becomes a block and each cell carries its column name
   (data-label) before the value; from 1024 px it is a plain table. */
const CELL =
  "max-lg:grid max-lg:grid-cols-[6.5rem_1fr] max-lg:gap-x-4 max-lg:py-1 max-lg:before:label max-lg:before:text-ink-muted max-lg:before:pt-[0.2em] max-lg:before:content-[attr(data-label)] lg:px-4 lg:py-4 lg:align-top lg:first:pl-0 lg:last:pr-0";

/**
 * Photographs (creative brief 4.9): every photograph with a thumbnail, what
 * it shows, the place, the author, the licence (linked), the source page
 * and, where true, "Cropped and colour-graded".
 */
export function PhotoCredits() {
  return (
    <table className="text-ink w-full border-collapse text-sm max-lg:block">
      <caption className="sr-only">{CREDITS_PAGE.photographs.title}</caption>
      <thead className="max-lg:sr-only">
        <tr className="label text-ink-muted border-line border-b text-left">
          {Object.values(cols).map((label) => (
            <th
              key={label}
              scope="col"
              className="px-4 pb-3 font-semibold first:pl-0 last:pr-0"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="max-lg:block">
        {PHOTO_CREDITS.map((row) => {
          const photo = PHOTOS[row.key as PhotoKey];
          return (
            <tr
              key={row.key}
              className="border-line border-b max-lg:block max-lg:py-5"
            >
              <th
                scope="row"
                className={cn(
                  "text-left font-normal",
                  "max-lg:mb-2 max-lg:flex max-lg:items-center max-lg:gap-4 lg:px-4 lg:py-4 lg:pl-0 lg:align-top",
                )}
              >
                <span className="flex items-center gap-4">
                  {photo ? (
                    <Image
                      src={photo.src}
                      alt=""
                      width={96}
                      height={72}
                      sizes="96px"
                      quality={60}
                      className="h-[54px] w-[72px] shrink-0 rounded-xs object-cover lg:h-[60px] lg:w-[80px]"
                    />
                  ) : null}
                  <span className="font-display text-ink text-base leading-snug">
                    {row.image}
                  </span>
                </span>
              </th>
              <td data-label={cols.place} className={CELL}>
                {row.place}
              </td>
              <td data-label={cols.author} className={CELL}>
                {row.author}
              </td>
              <td data-label={cols.licence} className={CELL}>
                {row.licenceUrl ? (
                  <a
                    href={row.licenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK}
                  >
                    {row.licence}
                    <span className="sr-only">{MICROCOPY.newTab}</span>
                  </a>
                ) : (
                  row.licence
                )}
              </td>
              <td data-label={cols.source} className={CELL}>
                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  {CREDITS_PAGE.photographs.sourceLinkLabel}
                  <span className="sr-only">
                    {`, ${row.image}${MICROCOPY.newTab}`}
                  </span>
                </a>
              </td>
              <td
                data-label={cols.changes}
                className={cn(CELL, !row.graded && "max-lg:hidden")}
              >
                {row.graded ? CREDITS_PAGE.photographs.changed : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
