import { randomUUID } from "node:crypto";
import { mediaConfig } from "@/config/media";
import { videoConfig, videoTypes } from "@/config/video";
import { createClient } from "@/lib/supabase/server";
import type { CardMedia } from "@/types/block";
import type { VideoSignInput, VideoSignResult } from "@/types/media";

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

const cardExtensions: Record<string, string> = { ...extensions, "image/gif": "gif" };

// Image or GIF inside a card. Small files only (the browser already shrank still images), so this goes
// through the normal server action, not a signed upload.
export async function uploadCardMedia(
  userId: string,
  file: File,
): Promise<{ url: string; kind: CardMedia["kind"] } | { error: string }> {
  const ext = cardExtensions[file.type];
  if (!ext) return { error: "Card media must be a JPG, PNG, WebP or GIF file." };

  const gif = file.type === "image/gif";
  const limit = gif ? mediaConfig.cardMedia.maxGifMb : mediaConfig.cardMedia.maxImageMb;
  if (file.size > limit * 1024 * 1024) {
    return { error: `${gif ? "A GIF" : "An image"} in a card must be ${limit} MB or smaller.` };
  }

  const supabase = await createClient();
  const path = `${userId}/cards/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(mediaConfig.bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `Could not upload the card media: ${error.message}` };

  return {
    url: supabase.storage.from(mediaConfig.bucket).getPublicUrl(path).data.publicUrl,
    kind: gif ? "gif" : "image",
  };
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
  const { data, error } = await supabase.storage.from(mediaConfig.bucket).remove(paths);
  if (error || (data?.length ?? 0) < paths.length) {
    console.error("removeImages: some files were not deleted", {
      wanted: paths.length,
      removed: data?.length ?? 0,
      error: error?.message,
    });
  }
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

// Background video: the browser uploads the file straight to Storage (Vercel refuses request
// bodies over 4.5 MB). The server only checks the claim and makes a one-time upload token.
export async function signVideoUpload(userId: string, input: VideoSignInput): Promise<VideoSignResult> {
  const type = typeof input?.type === "string" ? input.type : "";
  const size = typeof input?.size === "number" ? input.size : 0;
  const kind = videoTypes.find((t) => t.mime === type);
  if (!kind) return { error: "Use an MP4, WebM or GIF file." };

  const maxMb = kind.ext === "gif" ? videoConfig.gifMaxMb : videoConfig.videoMaxMb;
  if (!Number.isFinite(size) || size <= 0 || size > maxMb * 1024 * 1024) {
    return { error: `This file is too large. The limit is ${maxMb} MB.` };
  }

  const supabase = await createClient();
  const path = `${userId}/${videoConfig.folder}/${randomUUID()}.${kind.ext}`;
  const { data, error } = await supabase.storage.from(mediaConfig.bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return { error: `Could not prepare the upload: ${error?.message ?? "unknown error"}` };
  }
  return { path, token: data.token };
}

// Checks that a video uploaded by the browser really exists, belongs to this user and is small enough.
export async function findPendingVideo(
  userId: string,
  path: string,
): Promise<{ url: string } | { error: string }> {
  const prefix = `${userId}/${videoConfig.folder}/`;
  const name = path.startsWith(prefix) ? path.slice(prefix.length) : "";
  if (!/^[0-9a-f-]{36}\.(mp4|webm|gif)$/.test(name)) {
    return { error: "The uploaded video is not valid. Pick it again." };
  }

  const supabase = await createClient();
  const bucket = supabase.storage.from(mediaConfig.bucket);
  const { data, error } = await bucket.list(prefix.slice(0, -1), { limit: 100 });
  const file = error ? undefined : data?.find((f) => f.name === name);
  if (!file) {
    return { error: "The uploaded video was not found. Pick it again and wait until it says Uploaded." };
  }

  const maxMb = name.endsWith(".gif") ? videoConfig.gifMaxMb : videoConfig.videoMaxMb;
  if (Number(file.metadata?.size ?? 0) > maxMb * 1024 * 1024) {
    await bucket.remove([path]);
    return { error: `The uploaded file is larger than ${maxMb} MB.` };
  }
  return { url: bucket.getPublicUrl(path).data.publicUrl };
}

// Keeps ONE background video: deletes every file in the user's video folder except the one in use.
// Also cleans up videos that were uploaded but never saved.
export async function sweepBackgroundVideos(userId: string, keepUrl: string | null): Promise<void> {
  const supabase = await createClient();
  const bucket = supabase.storage.from(mediaConfig.bucket);
  const folder = `${userId}/${videoConfig.folder}`;
  const { data, error } = await bucket.list(folder, { limit: 100 });
  if (error || !data) {
    console.error("sweepBackgroundVideos: could not list the folder", error?.message);
    return;
  }

  const keep = keepUrl ? pathFromUrl(keepUrl, userId) : null;
  const stale = data
    .filter((f) => !f.name.startsWith("."))
    .map((f) => `${folder}/${f.name}`)
    .filter((p) => p !== keep);
  if (stale.length === 0) return;

  const { data: removed, error: removeError } = await bucket.remove(stale);
  if (removeError || (removed?.length ?? 0) < stale.length) {
    console.error("sweepBackgroundVideos: some files were not deleted", {
      wanted: stale.length,
      removed: removed?.length ?? 0,
      error: removeError?.message,
    });
  }
}

// Background photo: the browser uploads the ORIGINAL file straight to Storage (no crop, no shrinking),
// in its own folder. Same flow as the background video: the server only checks the claim and makes a token.
const photoRules = mediaConfig.backgroundPhoto;

export async function signPhotoUpload(userId: string, input: VideoSignInput): Promise<VideoSignResult> {
  const type = typeof input?.type === "string" ? input.type : "";
  const size = typeof input?.size === "number" ? input.size : 0;
  const kind = photoRules.types.find((t) => t.mime === type);
  if (!kind) return { error: "Background photos must be JPG, PNG or WebP." };
  if (!Number.isFinite(size) || size <= 0 || size > photoRules.maxMb * 1024 * 1024) {
    return { error: `This photo is too large. The limit is ${photoRules.maxMb} MB.` };
  }

  const supabase = await createClient();
  const path = `${userId}/${photoRules.folder}/${randomUUID()}.${kind.ext}`;
  const { data, error } = await supabase.storage.from(mediaConfig.bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return { error: `Could not prepare the upload: ${error?.message ?? "unknown error"}` };
  }
  return { path, token: data.token };
}

// Checks that a photo uploaded by the browser really exists, belongs to this user and is small enough.
export async function findPendingPhoto(
  userId: string,
  path: string,
): Promise<{ url: string } | { error: string }> {
  const prefix = `${userId}/${photoRules.folder}/`;
  const name = path.startsWith(prefix) ? path.slice(prefix.length) : "";
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(name)) {
    return { error: "The uploaded photo is not valid. Pick it again." };
  }

  const supabase = await createClient();
  const bucket = supabase.storage.from(mediaConfig.bucket);
  const { data, error } = await bucket.list(prefix.slice(0, -1), { limit: 100 });
  const file = error ? undefined : data?.find((f) => f.name === name);
  if (!file) {
    return { error: "The uploaded photo was not found. Pick it again and wait until it says Uploaded." };
  }

  if (Number(file.metadata?.size ?? 0) > photoRules.maxMb * 1024 * 1024) {
    await bucket.remove([path]);
    return { error: `The uploaded photo is larger than ${photoRules.maxMb} MB.` };
  }
  return { url: bucket.getPublicUrl(path).data.publicUrl };
}

// Keeps ONE background photo in the photo folder: deletes every file there except the one in use.
// Also cleans up photos that were uploaded but never saved.
export async function sweepBackgroundPhotos(userId: string, keepUrl: string | null): Promise<void> {
  const supabase = await createClient();
  const bucket = supabase.storage.from(mediaConfig.bucket);
  const folder = `${userId}/${photoRules.folder}`;
  const { data, error } = await bucket.list(folder, { limit: 100 });
  if (error || !data) {
    console.error("sweepBackgroundPhotos: could not list the folder", error?.message);
    return;
  }

  const keep = keepUrl ? pathFromUrl(keepUrl, userId) : null;
  const stale = data
    .filter((f) => !f.name.startsWith("."))
    .map((f) => `${folder}/${f.name}`)
    .filter((p) => p !== keep);
  if (stale.length === 0) return;

  const { data: removed, error: removeError } = await bucket.remove(stale);
  if (removeError || (removed?.length ?? 0) < stale.length) {
    console.error("sweepBackgroundPhotos: some files were not deleted", {
      wanted: stale.length,
      removed: removed?.length ?? 0,
      error: removeError?.message,
    });
  }
}