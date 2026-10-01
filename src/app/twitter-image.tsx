/**
 * Twitter card image: the same render as the Open Graph image. The runtime
 * must be a literal here (Next.js does not follow re-exports for it).
 */
export { default, alt, contentType, size } from "./opengraph-image";
export const runtime = "nodejs";
