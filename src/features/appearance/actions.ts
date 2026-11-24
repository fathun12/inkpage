"use server";

import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import { appearanceSchema } from "./schema";

const back = routes.customize;

export async function updateAppearanceAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const parsed = appearanceSchema.safeParse({
    font_heading: field(formData, "font_heading"),
    font_body: field(formData, "font_body"),
    site_color_bg: field(formData, "site_color_bg"),
    site_color_ink: field(formData, "site_color_ink"),
    site_color_accent: field(formData, "site_color_accent"),
    site_motion: field(formData, "site_motion"),
    site_hero_seconds: field(formData, "site_hero_seconds"),
    site_gallery_seconds: field(formData, "site_gallery_seconds"),
    site_hero_overlay: field(formData, "site_hero_overlay"),
    site_index_veil: field(formData, "site_index_veil"),
    site_hero_zoom: field(formData, "site_hero_zoom"),
    site_hero_gray: formData.get("site_hero_gray") === "on",
  });
  if (!parsed.success) return redirectWithError(back, firstError(parsed.error));
  const v = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      font_heading: v.font_heading,
      font_body: v.font_body,
      site_style: {
        motion: v.site_motion,
        heroSeconds: v.site_hero_seconds,
        gallerySeconds: v.site_gallery_seconds,
        heroOverlay: v.site_hero_overlay,
        indexVeil: v.site_index_veil,
        heroZoom: v.site_hero_zoom,
        heroGray: v.site_hero_gray,
        colorBg: v.site_color_bg,
        colorInk: v.site_color_ink,
        colorAccent: v.site_color_accent,
      },
    })
    .eq("id", user.id);
  if (error) {
    const missing = error.code === "PGRST204" || error.code === "42703";
    return redirectWithError(
      back,
      missing
        ? "The database does not know these settings yet. Run the newest migration (20261124010000_site_pages.sql) in Supabase, then save again."
        : `Could not save: ${error.message}`,
    );
  }

  redirectWithSaved(back, "Saved.");
}