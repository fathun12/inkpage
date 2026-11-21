"use server";

import { photoModes, type BackgroundMode } from "@/config/background";
import { mediaConfig } from "@/config/media";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import {
  findPendingPhoto,
  findPendingVideo,
  removeImages,
  signPhotoUpload,
  signVideoUpload,
  sweepBackgroundPhotos,
  sweepBackgroundVideos,
} from "@/features/media/upload";
import { getProfileById } from "@/features/profile/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import type { VideoSignInput, VideoSignResult } from "@/types/media";
import { appearanceSchema } from "./schema";

const back = routes.customize;
const photoMimes: readonly string[] = mediaConfig.backgroundPhoto.types.map((t) => t.mime);

// Reads a JSON text field (the card style). Missing or broken JSON becomes undefined,
// and the schema then answers with "Card style is invalid."
function readJson(formData: FormData, name: string): unknown {
  const raw = formData.get(name);
  if (typeof raw !== "string" || raw === "") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// Called by the browser before it uploads a background photo, video or GIF straight to Storage.
// Photos (JPG, PNG, WebP) go to the photo folder, everything else to the video folder.
export async function createVideoUploadAction(input: VideoSignInput): Promise<VideoSignResult> {
  const user = await requireUser();
  if (photoMimes.includes(input?.type)) return signPhotoUpload(user.id, input);
  return signVideoUpload(user.id, input);
}

export async function updateAppearanceAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const current = await getProfileById(user.id);
  const oldBg = current?.bg_image_url ?? null;
  const oldVideo = current?.bg_video_url ?? null;
  const pendingPhoto = field(formData, "bg_photo_path");
  const pendingVideo = field(formData, "bg_video_path");

  // A photo or video that was uploaded but not saved is lost after a redirect, so it is deleted on every failure.
  const abort = async (message: string): Promise<void> => {
    if (pendingPhoto) await sweepBackgroundPhotos(user.id, oldBg);
    if (pendingVideo) await sweepBackgroundVideos(user.id, oldVideo);
    return redirectWithError(back, message);
  };

  const parsed = appearanceSchema.safeParse({
    theme: field(formData, "theme"),
    font_heading: field(formData, "font_heading"),
    font_body: field(formData, "font_body"),
    card: readJson(formData, "card"),
    bg_mode: field(formData, "bg_mode"),
    bg_fade: field(formData, "bg_fade"),
    bg_color: field(formData, "bg_color"),
    bg_color2: field(formData, "bg_color2"),
    bg_angle: field(formData, "bg_angle"),
    bg_tint: field(formData, "bg_tint"),
    bg_gray: formData.get("bg_gray") === "on",
    bg_fade_color: field(formData, "bg_fade_color"),
    bg_fade_custom: formData.get("bg_fade_custom") === "on",
    bg_fade_reach: field(formData, "bg_fade_reach"),
    theme_bg: field(formData, "theme_bg"),
    theme_accent: field(formData, "theme_accent"),
  });
  if (!parsed.success) return abort(firstError(parsed.error));

  const removeBg = formData.get("remove_bg_image") === "on" && !pendingPhoto;
  const removeVideo = formData.get("remove_bg_video") === "on" && !pendingVideo;

  // Removing a photo or video drops its style back to the theme color. Uploading a photo or video
  // while the style is still "Theme color" switches to it. Solid and Gradient are never changed.
  let mode: BackgroundMode = parsed.data.bg_mode;
  if (removeBg && photoModes.includes(mode)) mode = "color";
  if (removeVideo && mode === "video") mode = "color";
  const switchedPhoto = Boolean(pendingPhoto) && mode === "color";
  if (switchedPhoto) mode = "full";
  const switchedVideo = Boolean(pendingVideo) && mode === "color";
  if (switchedVideo) mode = "video";

  let bgUrl = removeBg ? null : oldBg;
  if (pendingPhoto) {
    const found = await findPendingPhoto(user.id, pendingPhoto);
    if ("error" in found) return abort(found.error);
    bgUrl = found.url;
  }

  let videoUrl = removeVideo ? null : oldVideo;
  if (pendingVideo) {
    const found = await findPendingVideo(user.id, pendingVideo);
    if ("error" in found) return abort(found.error);
    videoUrl = found.url;
  }

  if (photoModes.includes(mode) && !bgUrl) {
    return abort("Upload a photo to use this background style, or pick another style.");
  }
  if (mode === "video" && !videoUrl) {
    return abort("Upload a video or GIF to use this background style, or pick another style.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      theme: parsed.data.theme,
      font_heading: parsed.data.font_heading,
      font_body: parsed.data.font_body,
      card: parsed.data.card,
      bg_mode: mode,
      bg_fade: parsed.data.bg_fade,
      bg_image_url: bgUrl,
      bg_video_url: videoUrl,
      bg_color: parsed.data.bg_color,
      bg_color2: parsed.data.bg_color2,
      bg_angle: parsed.data.bg_angle,
      bg_tint: parsed.data.bg_tint,
      bg_gray: parsed.data.bg_gray,
      bg_fade_color: parsed.data.bg_fade_custom ? parsed.data.bg_fade_color : null,
      bg_fade_reach: parsed.data.bg_fade_reach,
      theme_bg: parsed.data.theme_bg,
      theme_accent: parsed.data.theme_accent,
    })
    .eq("id", user.id);
  if (error) {
    const missing = error.code === "PGRST204" || error.code === "42703" || error.code === "23514";
    return abort(
      missing
        ? "The database does not know these settings yet. Run the newest migration (20261122010000_profile_custom_theme.sql) in Supabase, then save again."
        : `Could not save: ${error.message}`,
    );
  }

  // The replaced or removed photo and any unsaved leftovers are deleted from Storage.
  await removeImages(user.id, [bgUrl !== oldBg ? oldBg : null]);
  await sweepBackgroundPhotos(user.id, bgUrl);
  await sweepBackgroundVideos(user.id, videoUrl);

  const text = switchedPhoto
    ? "Saved. Your photo is now used as the Full page background."
    : switchedVideo
      ? "Saved. Your video is now the page background."
      : "Saved.";
  redirectWithSaved(back, text);
}