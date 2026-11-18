import { randomUUID } from "node:crypto";
import { mediaConfig } from "@/config/media";
import { createClient } from "@/lib/supabase/server";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type UploadResult = { url: string } | { error: string };

// Real files only: an empty file input arrives as a 0-byte File and is skipped.
export function filesFrom(formData: FormData, key: string): File[] {
  return formData.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
}

export async function uploadImage(userId: string, file: File): Promise<UploadResult> {
  const ext = extensions[file.type];
  if (!ext) return { error: "Images must be JPG, PNG or WebP." };
  if (file.size > mediaConfig.maxBytes) {
    return { error: `Each image must be ${mediaConfig.maxMb} MB or smaller.` };
  }

  const supabase = await createClient();
  const path = `${userId}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(mediaConfig.bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `Could not upload the image: ${error.message}` };

  return { url: supabase.storage.from(mediaConfig.bucket).getPublicUrl(path).data.publicUrl };
}

function pathFromUrl(url: string, userId: string): string | null {
  const marker = `/object/public/${mediaConfig.bucket}/`;
  const at = url.indexOf(marker);
  if (at < 0) return null;
  const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
  return path.startsWith(`${userId}/`) && !path.includes("..") ? path : null;
}

export async function removeImages(
  userId: string,
  urls: (string | null | undefined)[],
): Promise<void> {
  const paths = urls
    .filter((u): u is string => Boolean(u))
    .map((u) => pathFromUrl(u, userId))
    .filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  const supabase = await createClient();
  await supabase.storage.from(mediaConfig.bucket).remove(paths);
}

// All or nothing: if one upload fails, the ones already uploaded are removed again.
export async function uploadImages(
  userId: string,
  files: File[],
): Promise<{ urls: string[] } | { error: string }> {
  const urls: string[] = [];
  for (const file of files) {
    const result = await uploadImage(userId, file);
    if ("error" in result) {
      await removeImages(userId, urls);
      return { error: result.error };
    }
    urls.push(result.url);
  }
  return { urls };
}
