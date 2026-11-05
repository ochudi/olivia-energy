/**
 * Who sees Ignition (build spec 2.9): a fine pointer, a viewport 1024 px
 * or wider, no reduced-motion preference, four or more cores, no Save-Data,
 * at least 4 GB of memory where the browser reports it, WebGL present, the
 * tab visible and the host on screen. These include every condition of the
 * host's CSS media query, so the mark is never left hidden by CSS while
 * the script says no. Read once at mount; the decision is final for the
 * page view.
 */
type Nav = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const QUERIES = [
  "(pointer: fine)",
  "(min-width: 1024px)",
  "(prefers-reduced-motion: no-preference)",
];

export function ignitionEligible(host: Element): boolean {
  if (!QUERIES.every((q) => window.matchMedia(q).matches)) return false;
  const nav = navigator as Nav;
  if ((nav.hardwareConcurrency ?? 0) < 4) return false;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  if (typeof WebGLRenderingContext === "undefined") return false;
  if (document.visibilityState !== "visible") return false;
  const box = host.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight && box.width > 0;
}
