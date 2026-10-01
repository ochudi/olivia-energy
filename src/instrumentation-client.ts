/**
 * Development only; compiled out of production builds.
 *
 * React's development build draws server-component timings on the browser's
 * Performance panel. When a page ends in notFound() it records the component
 * with performance.measure() and passes the server's end time unclamped.
 * Chrome throws on a negative timestamp, which is what that end time becomes
 * whenever the dev server's clock reads earlier than the tab's (the margin on
 * the article 404 is about 70 ms). The page itself renders correctly; only the
 * dev overlay reports "'Page' cannot have a negative time stamp".
 *
 * Clamp the two timestamps so the entry is recorded instead of thrown. The
 * unclamped call is still in Next 16.4 canary; delete this file once React
 * clamps the end time itself.
 */
if (process.env.NODE_ENV === "development") {
  const measure = performance.measure.bind(performance);
  const clamp = (time: PerformanceMeasureOptions["start"]) =>
    typeof time === "number" && time < 0 ? 0 : time;

  performance.measure = (name, options, endMark) => {
    if (typeof options !== "object" || options === null)
      return measure(name, options, endMark);
    return measure(name, {
      ...options,
      start: clamp(options.start),
      end: clamp(options.end),
    });
  };
}
