"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/queries";
import { filesFrom, removeImages, uploadImage } from "@/features/media/upload";
import { routes, siteConfig } from "@/config/site";
import { redirectWithError } from "@/lib/flash";
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
  });
  if (!parsed.success) return redirectWithError(routes.appearance, firstError(parsed.error));

  const current = await getProfileById(user.id);
  const oldAvatar = current?.avatar_url ?? null;
  let avatarUrl = oldAvatar;

  const file = filesFrom(formData, "avatar")[0];
  if (file) {
    const result = await uploadImage(user.id, file);
    if ("error" in result) return redirectWithError(routes.appearance, result.error);
    avatarUrl = result.url;
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
      theme: parsed.data.theme,
    })
    .eq("id", user.id);
  if (error) {
    if (file) await removeImages(user.id, [avatarUrl]);
    return redirectWithError(routes.appearance, "Could not save. Try again.");
  }

  if (avatarUrl !== oldAvatar) await removeImages(user.id, [oldAvatar]);
  redirect(`${routes.appearance}?saved=1`);
}
