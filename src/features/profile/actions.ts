"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/queries";
import { filesFrom, removeImages, uploadImage } from "@/features/media/upload";
import { photoModes, type BackgroundMode } from "@/config/background";
import { routes, siteConfig } from "@/config/site";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
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

export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await requireUser();
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
  if (!parsed.success) return redirectWithError(routes.appearance, firstError(parsed.error));

  const current = await getProfileById(user.id);
  const oldAvatar = current?.avatar_url ?? null;
  const oldBg = current?.bg_image_url ?? null;

  const avatarFile = filesFrom(formData, "avatar")[0];
  const bgFile = filesFrom(formData, "bg_image")[0];
  const removeBg = formData.get("remove_bg_image") === "on" && !bgFile;

  // Removing the photo drops a photo style back to the theme color. Uploading a photo while the
  // style is still "Theme color" switches to Full page photo. Solid and Gradient are never changed.
  let mode: BackgroundMode = parsed.data.bg_mode;
  if (removeBg && photoModes.includes(mode)) mode = "color";
  const switched = Boolean(bgFile) && mode === "color";
  if (switched) mode = "full";

  const hasBg = Boolean(bgFile) || (Boolean(oldBg) && !removeBg);
  if (photoModes.includes(mode) && !hasBg) {
    return redirectWithError(
      routes.appearance,
      "Upload a photo to use this background style, or pick another style.",
    );
  }

  let avatarUrl = oldAvatar;
  let bgUrl = removeBg ? null : oldBg;
  const fresh: string[] = [];

  if (avatarFile) {
    const result = await uploadImage(user.id, avatarFile);
    if ("error" in result) return redirectWithError(routes.appearance, result.error);
    avatarUrl = result.url;
    fresh.push(result.url);
  } else if (formData.get("remove_avatar") === "on") {
    avatarUrl = null;
  }

  if (bgFile) {
    const result = await uploadImage(user.id, bgFile);
    if ("error" in result) {
      await removeImages(user.id, fresh);
      return redirectWithError(routes.appearance, result.error);
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
    return redirectWithError(
      routes.appearance,
      missing
        ? "The database does not know the new background settings yet. Run the migration 20261119060000_profile_background_modes.sql in Supabase, then save again."
        : `Could not save: ${error.message}`,
    );
  }

  await removeImages(user.id, [
    avatarUrl !== oldAvatar ? oldAvatar : null,
    bgUrl !== oldBg ? oldBg : null,
  ]);
  redirectWithSaved(
    routes.appearance,
    switched ? "Saved. Your photo is now used as the Full page background." : "Saved.",
  );
}