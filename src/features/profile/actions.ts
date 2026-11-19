"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/queries";
import {
  filesFrom,
  findPendingVideo,
  removeImages,
  signVideoUpload,
  sweepBackgroundVideos,
  uploadImage,
} from "@/features/media/upload";
import { photoModes, type BackgroundMode } from "@/config/background";
import { routes, siteConfig } from "@/config/site";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import type { VideoSignInput, VideoSignResult } from "@/types/media";
import { getProfileById } from "./queries";
import { profileSchema, setupSchema } from "./schema";

export async function createProfileAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = setupSchema.safeParse({
    username: field(formData, "username"),
    display_name: field(formData, "display_name"),
  });
  if (!parsed.success) return redirectWithError(routes.setup, firstError(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .insert({ id: user.id, ...parsed.data, theme: siteConfig.defaultTheme });
  if (error) {
    return redirectWithError(
      routes.setup,
      error.code === "23505" ? "That username is taken." : "Could not create your page. Try again.",
    );
  }
  redirect(routes.admin);
}

// Called by the browser before it uploads a background video or GIF straight to Storage.
export async function createVideoUploadAction(input: VideoSignInput): Promise<VideoSignResult> {
  const user = await requireUser();
  return signVideoUpload(user.id, input);
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const current = await getProfileById(user.id);
  const oldAvatar = current?.avatar_url ?? null;
  const oldBg = current?.bg_image_url ?? null;
  const oldVideo = current?.bg_video_url ?? null;
  const pendingVideo = field(formData, "bg_video_path");

  // A video that was uploaded but not saved is lost after a redirect, so it is deleted on every failure.
  const abort = async (message: string): Promise<void> => {
    if (pendingVideo) await sweepBackgroundVideos(user.id, oldVideo);
    return redirectWithError(routes.appearance, message);
  };

  const parsed = profileSchema.safeParse({
    display_name: field(formData, "display_name"),
    bio: field(formData, "bio"),
    theme: field(formData, "theme"),
    bg_mode: field(formData, "bg_mode"),
    bg_fade: field(formData, "bg_fade"),
    bg_color: field(formData, "bg_color"),
    bg_color2: field(formData, "bg_color2"),
    bg_angle: field(formData, "bg_angle"),
    bg_tint: field(formData, "bg_tint"),
    bg_gray: formData.get("bg_gray") === "on",
  });
  if (!parsed.success) return abort(firstError(parsed.error));

  const avatarFile = filesFrom(formData, "avatar")[0];
  const bgFile = filesFrom(formData, "bg_image")[0];
  const removeBg = formData.get("remove_bg_image") === "on" && !bgFile;
  const removeVideo = formData.get("remove_bg_video") === "on" && !pendingVideo;

  // Removing a photo or video drops its style back to the theme color. Uploading a photo or video
  // while the style is still "Theme color" switches to it. Solid and Gradient are never changed.
  let mode: BackgroundMode = parsed.data.bg_mode;
  if (removeBg && photoModes.includes(mode)) mode = "color";
  if (removeVideo && mode === "video") mode = "color";
  const switchedPhoto = Boolean(bgFile) && mode === "color";
  if (switchedPhoto) mode = "full";
  const switchedVideo = Boolean(pendingVideo) && mode === "color";
  if (switchedVideo) mode = "video";

  let videoUrl = removeVideo ? null : oldVideo;
  if (pendingVideo) {
    const found = await findPendingVideo(user.id, pendingVideo);
    if ("error" in found) return abort(found.error);
    videoUrl = found.url;
  }

  const hasBg = Boolean(bgFile) || (Boolean(oldBg) && !removeBg);
  if (photoModes.includes(mode) && !hasBg) {
    return abort("Upload a photo to use this background style, or pick another style.");
  }
  if (mode === "video" && !videoUrl) {
    return abort("Upload a video or GIF to use this background style, or pick another style.");
  }

  let avatarUrl = oldAvatar;
  let bgUrl = removeBg ? null : oldBg;
  const fresh: string[] = [];

  if (avatarFile) {
    const result = await uploadImage(user.id, avatarFile);
    if ("error" in result) return abort(result.error);
    avatarUrl = result.url;
    fresh.push(result.url);
  } else if (formData.get("remove_avatar") === "on") {
    avatarUrl = null;
  }

  if (bgFile) {
    const result = await uploadImage(user.id, bgFile);
    if ("error" in result) {
      await removeImages(user.id, fresh);
      return abort(result.error);
    }
    bgUrl = result.url;
    fresh.push(result.url);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio ?? null,
      avatar_url: avatarUrl,
      theme: parsed.data.theme,
      bg_mode: mode,
      bg_fade: parsed.data.bg_fade,
      bg_image_url: bgUrl,
      bg_video_url: videoUrl,
      bg_color: parsed.data.bg_color,
      bg_color2: parsed.data.bg_color2,
      bg_angle: parsed.data.bg_angle,
      bg_tint: parsed.data.bg_tint,
      bg_gray: parsed.data.bg_gray,
    })
    .eq("id", user.id);
  if (error) {
    await removeImages(user.id, fresh);
    const missing = error.code === "PGRST204" || error.code === "42703" || error.code === "23514";
    return abort(
      missing
        ? "The database does not know the background settings yet. Run the migration 20261119060000_profile_background_modes.sql in Supabase, then save again."
        : `Could not save: ${error.message}`,
    );
  }

  await removeImages(user.id, [
    avatarUrl !== oldAvatar ? oldAvatar : null,
    bgUrl !== oldBg ? oldBg : null,
  ]);
  await sweepBackgroundVideos(user.id, videoUrl);

  const text = switchedPhoto
    ? "Saved. Your photo is now used as the Full page background."
    : switchedVideo
      ? "Saved. Your video is now the page background."
      : "Saved.";
  redirectWithSaved(routes.appearance, text);
}