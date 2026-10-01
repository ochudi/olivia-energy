/**
 * Client-side image preparation before upload: scale so the longest side
 * is at most `maxSide` pixels and re-encode (WebP where the browser can,
 * PNG kept for transparency). SVG and GIF pass through untouched.
 */
export type PreparedImage = {
  blob: Blob;
  type: string;
  width?: number;
  height?: number;
};

const PASS_THROUGH = new Set(["image/svg+xml", "image/gif"]);

export async function prepareImage(
  file: File,
  maxSide = 1920,
): Promise<PreparedImage> {
  if (PASS_THROUGH.has(file.type)) return { blob: file, type: file.type };

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const wantPng = file.type === "image/png";
    const preferred = wantPng ? "image/png" : "image/webp";
    let blob = await encode(canvas, preferred, 0.85);
    if (!blob || blob.type !== preferred) {
      // Browsers without WebP encoding fall back to JPEG.
      blob = await encode(canvas, wantPng ? "image/png" : "image/jpeg", 0.85);
    }
    if (!blob) throw new Error("Could not encode the image.");
    return { blob, type: blob.type, width, height };
  } finally {
    bitmap.close();
  }
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
}

export function extensionFor(type: string): string {
  switch (type) {
    case "image/webp":
      return "webp";
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}
