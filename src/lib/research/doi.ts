/** The DOI inside a DOI link or a bare DOI, lower-cased; null otherwise. */
export function doiOf(url: string | null | undefined): string | null {
  const match = url?.match(/10\.\d{4,9}\/[^\s#?]+/i);
  return match ? match[0].toLowerCase() : null;
}
