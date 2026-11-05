import { CONTACT_PAGE } from "@/content/contact";
import type { SiteSettings } from "@/lib/supabase/types";

/**
 * Safety net for Admin → Settings: drops an address line that is a
 * stand-in rather than an address, so it never reaches the page.
 */
const STAND_IN_LINE = /\bto follow\b|\bTBC\b|placeholder/i;

const copy = CONTACT_PAGE.details;

/**
 * "Where we are" from settings: each office as one line, its address lines
 * then its country ("Fort Worth, Texas, United States"). When no office has
 * any lines, the city-level lines in content stand in.
 */
export function placesFrom(settings: SiteSettings): readonly string[] {
  const places = settings.addresses
    .map((address) => {
      const lines = address.lines
        .map((line) => line.trim())
        .filter((line) => line && !STAND_IN_LINE.test(line));
      return lines.length ? [...lines, address.country].join(", ") : null;
    })
    .filter((place): place is string => place !== null);
  return places.length ? places : copy.whereLines;
}

const heading = "label text-ink-muted";

/**
 * The details column beside the form (creative brief 4.7): Email (from
 * settings), Where we are (settings addresses), Company (name and RC
 * number). Each block sits under a 1px rule.
 */
export function ContactDetails({ settings }: { settings: SiteSettings }) {
  const places = placesFrom(settings);
  return (
    <dl className="flex flex-col">
      <div className="border-line border-t pt-5 pb-8">
        <dt className={heading}>{copy.email}</dt>
        <dd className="mt-3 wrap-anywhere">
          <a
            href={`mailto:${settings.contact_email}`}
            className="font-display text-display-xs text-ink decoration-primary hover:text-primary focus-visible:ring-focus focus-visible:ring-offset-canvas underline decoration-1 underline-offset-[0.2em] transition-colors duration-200 focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {settings.contact_email}
          </a>
        </dd>
      </div>
      <div className="border-line border-t pt-5 pb-8">
        <dt className={heading}>{copy.where}</dt>
        <dd className="mt-3">
          <ul className="text-ink space-y-1 text-base">
            {places.map((place) => (
              <li key={place}>{place}</li>
            ))}
          </ul>
        </dd>
      </div>
      <div className="border-line border-t pt-5">
        <dt className={heading}>{copy.company}</dt>
        <dd className="text-ink mt-3 text-base">
          {copy.companyLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </dd>
      </div>
    </dl>
  );
}
