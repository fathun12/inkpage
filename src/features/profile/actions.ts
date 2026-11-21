"use server";

import { redirect } from "next/navigation";
import { routes, siteConfig } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { filesFrom, removeImages, uploadImage } from "@/features/media/upload";
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

// Profile only: name, bio, avatar. Theme and background are saved by features/appearance.
export async function updateProfileAction(formData: FormData): Promise<void> {
  const back = routes.profileEdit;
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    display_name: field(formData, "display_name"),
    bio: field(formData, "bio"),
  });
  if (!parsed.success) return redirectWithError(back, firstError(parsed.error));

  const current = await getProfileById(user.id);
  const oldAvatar = current?.avatar_url ?? null;
  const avatarFile = filesFrom(formData, "avatar")[0];

  let avatarUrl = oldAvatar;
  const fresh: string[] = [];
  if (avatarFile) {
    const result = await uploadImage(user.id, avatarFile);
    if ("error" in result) return redirectWithError(back, result.error);
    avatarUrl = result.url;
    fresh.push(result.url);
  } else if (formData.get("remove_avatar") === "on") {
    avatarUrl = null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio ?? null,
      avatar_url: avatarUrl,
    })
    .eq("id", user.id);
  if (error) {
    await removeImages(user.id, fresh);
    return redirectWithError(back, `Could not save: ${error.message}`);
  }

  await removeImages(user.id, [avatarUrl !== oldAvatar ? oldAvatar : null]);
  redirectWithSaved(back, "Saved.");
}