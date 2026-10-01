import { NotFoundSection } from "@/components/sections/not-found-section";

/**
 * Public 404. Renders the same body as the root not-found.tsx (which
 * handles URLs outside every route group); this one catches unknown paths
 * inside (site), such as /insights/whatever/extra.
 */
export default function NotFound() {
  return <NotFoundSection />;
}
