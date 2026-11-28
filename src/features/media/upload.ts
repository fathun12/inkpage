import { randomUUID } from "node:crypto";
import { mediaConfig } from "@/config/media";
import { videoConfig, videoTypes } from "@/config/video";
import {
  r2Configured,
  r2List,
  r2PathFromUrl,
  r2PublicUrl,
  r2Remove,
  r2SignPut,
  r2Size,
} from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";
import type { CardMedia } from "@/types/block";
import type { VideoSignInput, VideoSignResult } from "@/types/media";

// Public media lives in two places: new uploads go to Cloudflare R2 (when it is set up), older files stay in
// Supabase Storage. Every function below understands both, so old addresses keep working.

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type UploadResult = { url: string } | { error: string };

export type StoredFile = { name: string; path: string; size: number; created: number | null; origin: "r2" | "supabase" };

// Real files only: an empty file input arrives as a 0-byte File and is skipped.
export function filesFrom(formData: FormData, key: string): File[] {
  return formData.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
}

function supabasePathFromUrl(url: string): string | null {
  const marker = `/object/public/${mediaConfig.bucket}/`;
  const at = url.indexOf(marker);
  if (at < 0) return null;
  const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
  return path && !path.includes("..") ? path : null;
}

// The storage path of a public address, from either place.
export function publicPathOf(url: string): string | null {
  return r2PathFromUrl(url) ?? supabasePathFromUrl(url);
}

// A one-time upload permission for the browser. With R2 the token is "r2:" plus a signed link,
// otherwise it is a Supabase upload token. lib/direct-upload.ts understands both.
export async function createPublicUpload(
  path: string,
  type: string,
): Promise<{ path: string; token: string; url: string } | { error: string }> {
  if (r2Configured()) {
    try {
      const link = await r2SignPut(path, type, mediaConfig.cacheHeader);
      return { path, token: `r2:${link}`, url: r2PublicUrl(path) };
    } catch (e) {
      return { error: `Could not prepare the upload: ${e instanceof Error ? e.message : "unknown error"}` };
    }
  }
  const supabase = await createClient();
  const bucket = supabase.storage.from(mediaConfig.bucket);
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) return { error: `Could not prepare the upload: ${error?.message ?? "unknown error"}` };
  return { path, token: data.token, url: bucket.getPublicUrl(path).data.publicUrl };
}

// Files directly inside one folder, from both places. null = a place could not be read.
export async function listPublicFolder(folder: string): Promise<StoredFile[] | null> {
  const out: StoredFile[] = [];
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(mediaConfig.bucket).list(folder, { limit: 1000 });
  if (error || !data) return null;
  for (const f of data) {
    if (f.id === null) continue;
    out.push({
      name: f.name,
      path: `${folder}/${f.name}`,
      size: Number(f.metadata?.size ?? 0),
      created: f.created_at ? new Date(f.created_at).getTime() : null,
      origin: "supabase",
    });
  }
  if (r2Configured()) {
    try {
      for (const r of await r2List(folder)) {
        out.push({ name: r.name, path: r.path, size: r.size, created: r.created, origin: "r2" });
      }
    } catch (e) {
      console.error("listPublicFolder: could not read R2", e instanceof Error ? e.message : e);
      return null;
    }
  }
  return out;
}

async function removeStored(label: string, files: Pick<StoredFile, "path" | "origin">[]): Promise<void> {
  const r2 = files.filter((f) => f.origin === "r2").map((f) => f.path);
  const sb = files.filter((f) => f.origin === "supabase").map((f) => f.path);
  if (r2.length > 0) {
    try {
      const removed = await r2Remove(r2);
      if (removed < r2.length) console.error(`${label}: some R2 files were not deleted`, { wanted: r2.length, removed });
    } catch (e) {
      console.error(`${label}: R2 delete failed`, e instanceof Error ? e.message : e);
    }
  }
  if (sb.length > 0) {
    const supabase = await createClient();
    const { data, error } = await supabase.storage.from(mediaConfig.bucket).remove(sb);
    if (error || (data?.length ?? 0) < sb.length) {
      console.error(`${label}: some files were not deleted`, {
        wanted: sb.length,
        removed: data?.length ?? 0,
        error: error?.message,
      });
    }
  }
}

// Deletes every file of a folder except the ones in keepUrls. minAgeMs keeps very new files (0 = no limit).
export async function sweepPublicFolder(
  label: string,
  folder: string,
  keepUrls: string[],
  minAgeMs = 0,
): Promise<void> {
  const files = await listPublicFolder(folder);
  if (!files) {
    console.error(`${label}: could not list the folder`);
    return;
  }
  const keep = new Set(keepUrls.map(publicPathOf).filter((p): p is string => p !== null));
  const now = Date.now();
  const stale = files
    .filter((f) => !f.name.startsWith("."))
    .filter((f) => minAgeMs === 0 || (f.created !== null && now - f.created > minAgeMs))
    .filter((f) => !keep.has(f.path));
  if (stale.length > 0) await removeStored(label, stale);
}

// Finds one file by folder and name, in R2 first and then in Supabase.
async function locateFile(
  folder: string,
  name: string,
): Promise<{ url: string; size: number; path: string; origin: "r2" | "supabase" } | null> {
  const path = `${folder}/${name}`;
  if (r2Configured()) {
    const size = await r2Size(path);
    if (size !== null) return { url: r2PublicUrl(path), size, path, origin: "r2" };
  }
  const supabase = await createClient();
  const bucket = supabase.storage.from(mediaConfig.bucket);
  const { data, error } = await bucket.list(folder, { limit: 100, search: name });
  const file = error ? undefined : data?.find((f) => f.name === name);
  if (!file) return null;
  return {
    url: bucket.getPublicUrl(path).data.publicUrl,
    size: Number(file.metadata?.size ?? 0),
    path,
    origin: "supabase",
  };
}

// Small files that pass through the server (avatar, card media) still go to Supabase.
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
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: String(mediaConfig.cacheSeconds),
    });
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
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: String(mediaConfig.cacheSeconds),
    });
  if (error) return { error: `Could not upload the card media: ${error.message}` };

  return {
    url: supabase.storage.from(mediaConfig.bucket).getPublicUrl(path).data.publicUrl,
    kind: gif ? "gif" : "image",
  };
}

export async function removeImages(
  userId: string,
  urls: (string | null | undefined)[],
): Promise<void> {
  const files: Pick<StoredFile, "path" | "origin">[] = [];
  for (const url of urls) {
    if (!url) continue;
    const r2 = r2PathFromUrl(url);
    const path = r2 ?? supabasePathFromUrl(url);
    if (!path || !path.startsWith(`${userId}/`)) continue;
    files.push({ path, origin: r2 ? "r2" : "supabase" });
  }
  if (files.length > 0) await removeStored("removeImages", files);
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

// Background video: the browser uploads the file straight to storage (Vercel refuses request
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

  const made = await createPublicUpload(`${userId}/${videoConfig.folder}/${randomUUID()}.${kind.ext}`, type);
  if ("error" in made) return made;
  return { path: made.path, token: made.token };
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

  const file = await locateFile(prefix.slice(0, -1), name);
  if (!file) {
    return { error: "The uploaded video was not found. Pick it again and wait until it says Uploaded." };
  }

  const maxMb = name.endsWith(".gif") ? videoConfig.gifMaxMb : videoConfig.videoMaxMb;
  if (file.size > maxMb * 1024 * 1024) {
    await removeStored("findPendingVideo", [file]);
    return { error: `The uploaded file is larger than ${maxMb} MB.` };
  }
  return { url: file.url };
}

// Keeps ONE background video: deletes every file in the user's video folder except the one in use.
// Also cleans up videos that were uploaded but never saved.
export async function sweepBackgroundVideos(userId: string, keepUrl: string | null): Promise<void> {
  await sweepPublicFolder("sweepBackgroundVideos", `${userId}/${videoConfig.folder}`, keepUrl ? [keepUrl] : []);
}

// Background photo: the browser uploads the ORIGINAL file straight to storage (no crop, no shrinking),
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

  const made = await createPublicUpload(`${userId}/${photoRules.folder}/${randomUUID()}.${kind.ext}`, type);
  if ("error" in made) return made;
  return { path: made.path, token: made.token };
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

  const file = await locateFile(prefix.slice(0, -1), name);
  if (!file) {
    return { error: "The uploaded photo was not found. Pick it again and wait until it says Uploaded." };
  }

  if (file.size > photoRules.maxMb * 1024 * 1024) {
    await removeStored("findPendingPhoto", [file]);
    return { error: `The uploaded photo is larger than ${photoRules.maxMb} MB.` };
  }
  return { url: file.url };
}

// Keeps ONE background photo in the photo folder: deletes every file there except the one in use.
// Also cleans up photos that were uploaded but never saved.
export async function sweepBackgroundPhotos(userId: string, keepUrl: string | null): Promise<void> {
  await sweepPublicFolder("sweepBackgroundPhotos", `${userId}/${photoRules.folder}`, keepUrl ? [keepUrl] : []);
}

// Website media (hero, list background, gallery, About photo): the browser uploads the ORIGINAL file
// straight to storage. Same flow as the background photo: the server only checks the claim and makes a token.
const siteRules = mediaConfig.siteMedia;

export async function signSiteUpload(userId: string, input: VideoSignInput): Promise<VideoSignResult> {
  const type = typeof input?.type === "string" ? input.type : "";
  const size = typeof input?.size === "number" ? input.size : 0;
  const kind = siteRules.types.find((t) => t.mime === type);
  if (!kind) return { error: "Use a JPG, PNG, WebP, GIF, MP4 or WebM file." };
  if (!Number.isFinite(size) || size <= 0 || size > siteRules.maxMb * 1024 * 1024) {
    return { error: `This file is too large. The limit is ${siteRules.maxMb} MB.` };
  }

  const made = await createPublicUpload(`${userId}/${siteRules.folder}/${randomUUID()}.${kind.ext}`, type);
  if ("error" in made) return made;
  return { path: made.path, token: made.token };
}

// Checks that files uploaded by the browser really exist, belong to this user and are small enough.
// Returns their public addresses in the same order.
export async function findSitePaths(
  userId: string,
  paths: string[],
): Promise<{ urls: string[] } | { error: string }> {
  if (paths.length === 0) return { urls: [] };
  const prefix = `${userId}/${siteRules.folder}/`;

  const urls: string[] = [];
  for (const path of paths) {
    const name = path.startsWith(prefix) ? path.slice(prefix.length) : "";
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm)$/.test(name)) {
      return { error: "An uploaded file is not valid. Pick it again." };
    }
    const file = await locateFile(prefix.slice(0, -1), name);
    if (!file) {
      return { error: "An uploaded file was not found. Pick it again and wait until it says Uploaded." };
    }
    if (file.size > siteRules.maxMb * 1024 * 1024) {
      await removeStored("findSitePaths", [file]);
      return { error: `An uploaded file is larger than ${siteRules.maxMb} MB.` };
    }
    urls.push(file.url);
  }
  return { urls };
}

// Deletes every file in the user's site folder except the ones the settings use. Also cleans up
// files that were uploaded but never saved, and files that were replaced or removed.
export async function sweepSiteMedia(userId: string, keepUrls: string[]): Promise<void> {
  await sweepPublicFolder("sweepSiteMedia", `${userId}/${siteRules.folder}`, keepUrls);
}