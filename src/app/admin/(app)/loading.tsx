import { LOADING } from "@/content/errors";

/**
 * Route loading skeleton for the admin shell: a PageHeader-shaped title
 * block, then six placeholder rows standing in for a table or list. Pulses
 * subtly; prefers-reduced-motion collapses the animation globally
 * (src/app/globals.css).
 */
export default function Loading() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <span className="sr-only">{LOADING.label}</span>

      <div className="border-line mb-6 border-b pb-5">
        <div className="bg-surface-muted h-7 w-[40%] rounded-xs" />
        <div className="bg-surface-muted mt-3 h-4 w-[25%] rounded-xs" />
      </div>

      <div className="border-line border-t">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="border-line flex items-center gap-4 border-b py-4"
          >
            <div className="bg-surface-muted h-4 w-full max-w-[60ch] rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}
