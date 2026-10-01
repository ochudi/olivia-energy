import { createBrowserSupabase } from "@/lib/supabase/client";
import { extensionFor, prepareImage } from "./images";
import { slugify } from "./slug";

export type UploadedImage = {
  /** Object path inside the media bucket (what posts.cover_path stores). */
  path: string;
  /** Public URL (what the editor embeds). */
  url: string;
  width?: number;
  height?: number;
};

const MAX_BYTES = 10 * 1024 * 1024;

/** Resizes (≤1920px) and uploads an image to the media bucket as the signed-in admin. */
export async function uploadImage(
  file: File,
  folder: string,
): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file (JPEG, PNG, WebP, GIF or SVG).");
  }
  const prepared = await prepareImage(file);
  if (prepared.blob.size > MAX_BYTES) {
    throw new Error("The image is larger than 10 MB after resizing.");
  }
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `${folder}/${Date.now()}-${base}.${extensionFor(prepared.type)}`;
  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage
    .from("media")
    .upload(path, await prepared.blob.arrayBuffer(), {
      contentType: prepared.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw new Error(error.message);
  return {
    path,
    url: mediaUrl(path),
    width: prepared.width,
    height: prepared.height,
  };
}

/** Public URL for a media path (or an absolute / site-relative URL as is). */
export function mediaUrl(path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  return createBrowserSupabase().storage.from("media").getPublicUrl(path).data
    .publicUrl;
}
