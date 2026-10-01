/**
 * SkipLink — first focusable element on every page. Parked above the
 * viewport and slid into view on focus (transform only, so it never
 * shifts layout). Targets <main id="content" tabIndex={-1}>.
 */
export function SkipLink() {
  return (
    <a
      href="#content"
      className="bg-primary text-primary-fg duration-fast ease-standard focus:ring-focus focus:ring-offset-canvas fixed top-3 left-3 z-[60] inline-flex h-11 -translate-y-[calc(100%+1rem)] items-center rounded-xs px-4 text-sm font-medium transition-transform focus:translate-y-0 focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >
      Skip to content
    </a>
  );
}
