/**
 * Twitter card image: the same render as the Open Graph image. `runtime`
 * and `dynamicParams` must be literals here (Next.js does not parse them
 * through a re-export), so they are restated rather than re-exported.
 */
export {
  default,
  alt,
  contentType,
  size,
  generateStaticParams,
} from "./opengraph-image";
export const runtime = "nodejs";
export const dynamicParams = true;
