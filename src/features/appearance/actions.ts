"use server";

import { readHeroMotion } from "@/config/intro";
import {
  aboutDefaults,
  aboutLayouts,
  aboutPhotoShapes,
  readAboutOrder,
  readAboutSections,
  steamBackgrounds,
  steamLayouts,
  steamModes,
} from "@/config/about-style";
import { readChoice, readOrder, readSections } from "@/config/layout";
import { styleRanges } from "@/config/site-style";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import { appearanceSchema } from "./schema";

const back = routes.customize;

// The About settings arrive as text (JSON). Dirty text gives null, and the readers turn null into the defaults.
function parseJson(text: unknown): unknown {
  if (typeof text !== "string" || text === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// A number from the form, kept inside its range and step. Dirty text gives the default.
function rangeValue(text: unknown, range: { min: number; max: number; step: number }, fallback: number): number {
  const n = typeof text === "string" && text !== "" ? Number(text) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(range.max, Math.max(range.min, n)) / range.step) * range.step;
}

export async function updateAppearanceAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const parsed = appearanceSchema.safeParse({
    font_heading: field(formData, "font_heading"),
    font_body: field(formData, "font_body"),
    site_color_bg: field(formData, "site_color_bg"),
    site_color_ink: field(formData, "site_color_ink"),
    site_color_accent: field(formData, "site_color_accent"),
    site_color_band: field(formData, "site_color_band"),
    site_color_tertiary: field(formData, "site_color_tertiary"),
    site_motion: field(formData, "site_motion"),
    site_hero_seconds: field(formData, "site_hero_seconds"),
    site_gallery_seconds: field(formData, "site_gallery_seconds"),
    site_hero_overlay: field(formData, "site_hero_overlay"),
    site_index_veil: field(formData, "site_index_veil"),
    site_hero_zoom: field(formData, "site_hero_zoom"),
    site_index_zoom: field(formData, "site_index_zoom"),
    site_hero_gray: formData.get("site_hero_gray") === "on",
    site_hero_motion: field(formData, "site_hero_motion"),
    site_density: field(formData, "site_density"),
    site_project_size: field(formData, "site_project_size"),
    site_project_view: field(formData, "site_project_view"),
    site_project_media: field(formData, "site_project_media"),
    site_countdown_view: field(formData, "site_countdown_view"),
    site_design_size: field(formData, "site_design_size"),
    site_design_view: field(formData, "site_design_view"),
    site_design_mode: field(formData, "site_design_mode"),
    site_design_wide_view: field(formData, "site_design_wide_view"),
    site_design_title_align: field(formData, "site_design_title_align"),
    site_design_title_font: field(formData, "site_design_title_font"),
    site_design_title_size: field(formData, "site_design_title_size"),
    site_design_intro_font: field(formData, "site_design_intro_font"),
    site_design_intro_size: field(formData, "site_design_intro_size"),
    site_showcase_size: field(formData, "site_showcase_size"),
    site_showcase_view: field(formData, "site_showcase_view"),
    site_showcase_mode: field(formData, "site_showcase_mode"),
    site_showcase_wide_view: field(formData, "site_showcase_wide_view"),
    site_showcase_media: field(formData, "site_showcase_media"),
    site_showcase_title_align: field(formData, "site_showcase_title_align"),
    site_showcase_title_font: field(formData, "site_showcase_title_font"),
    site_showcase_title_size: field(formData, "site_showcase_title_size"),
    site_showcase_intro_font: field(formData, "site_showcase_intro_font"),
    site_showcase_intro_size: field(formData, "site_showcase_intro_size"),
    site_showcase_stack_ratio: field(formData, "site_showcase_stack_ratio"),
    site_showcase_stack_crop: field(formData, "site_showcase_stack_crop"),
    site_design_stack_ratio: field(formData, "site_design_stack_ratio"),
    site_design_stack_crop: field(formData, "site_design_stack_crop"),
    site_design_media: field(formData, "site_design_media"),
    site_design_count: field(formData, "site_design_count"),
    site_writing_mode: field(formData, "site_writing_mode"),
    site_writing_view: field(formData, "site_writing_view"),
    site_writing_wide_view: field(formData, "site_writing_wide_view"),
    site_writing_size: field(formData, "site_writing_size"),
    site_writing_media: field(formData, "site_writing_media"),
    site_writing_title_align: field(formData, "site_writing_title_align"),
    site_writing_title_font: field(formData, "site_writing_title_font"),
    site_writing_title_size: field(formData, "site_writing_title_size"),
    site_writing_intro_font: field(formData, "site_writing_intro_font"),
    site_writing_intro_size: field(formData, "site_writing_intro_size"),
    site_writing_stack_ratio: field(formData, "site_writing_stack_ratio"),
    site_writing_stack_crop: field(formData, "site_writing_stack_crop"),
    site_articles_mode: field(formData, "site_articles_mode"),
    site_articles_view: field(formData, "site_articles_view"),
    site_articles_wide_view: field(formData, "site_articles_wide_view"),
    site_articles_size: field(formData, "site_articles_size"),
    site_articles_media: field(formData, "site_articles_media"),
    site_articles_title_align: field(formData, "site_articles_title_align"),
    site_articles_title_font: field(formData, "site_articles_title_font"),
    site_articles_title_size: field(formData, "site_articles_title_size"),
    site_articles_intro_font: field(formData, "site_articles_intro_font"),
    site_articles_intro_size: field(formData, "site_articles_intro_size"),
    site_articles_stack_ratio: field(formData, "site_articles_stack_ratio"),
    site_articles_stack_crop: field(formData, "site_articles_stack_crop"),
    site_project_mode: field(formData, "site_project_mode"),
    site_project_wide_view: field(formData, "site_project_wide_view"),
    site_project_title_align: field(formData, "site_project_title_align"),
    site_project_title_font: field(formData, "site_project_title_font"),
    site_project_title_size: field(formData, "site_project_title_size"),
    site_project_intro_font: field(formData, "site_project_intro_font"),
    site_project_intro_size: field(formData, "site_project_intro_size"),
    site_project_stack_ratio: field(formData, "site_project_stack_ratio"),
    site_project_stack_crop: field(formData, "site_project_stack_crop"),
    site_biblia_mode: field(formData, "site_biblia_mode"),
    site_biblia_view: field(formData, "site_biblia_view"),
    site_biblia_wide_view: field(formData, "site_biblia_wide_view"),
    site_biblia_size: field(formData, "site_biblia_size"),
    site_biblia_title_align: field(formData, "site_biblia_title_align"),
    site_biblia_title_font: field(formData, "site_biblia_title_font"),
    site_biblia_title_size: field(formData, "site_biblia_title_size"),
    site_biblia_intro_font: field(formData, "site_biblia_intro_font"),
    site_biblia_intro_size: field(formData, "site_biblia_intro_size"),
    site_github_mode: field(formData, "site_github_mode"),
    site_github_view: field(formData, "site_github_view"),
    site_github_wide_view: field(formData, "site_github_wide_view"),
    site_github_title_align: field(formData, "site_github_title_align"),
    site_github_title_font: field(formData, "site_github_title_font"),
    site_github_title_size: field(formData, "site_github_title_size"),
    site_github_intro_font: field(formData, "site_github_intro_font"),
    site_github_intro_size: field(formData, "site_github_intro_size"),
    site_sections: field(formData, "site_sections"),
    site_order: field(formData, "site_order"),
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
        indexZoom: v.site_index_zoom,
        heroGray: v.site_hero_gray,
        heroMotion: readHeroMotion(v.site_hero_motion),
        density: v.site_density,
        projectSize: v.site_project_size,
        projectView: v.site_project_view,
        projectMedia: v.site_project_media,
        countdownView: v.site_countdown_view,
        designSize: v.site_design_size,
        designView: v.site_design_view,
        designMode: v.site_design_mode,
        designWideView: v.site_design_wide_view,
        designTitleAlign: v.site_design_title_align,
        designTitleFont: v.site_design_title_font,
        designTitleSize: v.site_design_title_size,
        designIntroFont: v.site_design_intro_font,
        designIntroSize: v.site_design_intro_size,
        showcaseSize: v.site_showcase_size,
        showcaseView: v.site_showcase_view,
        showcaseMode: v.site_showcase_mode,
        showcaseWideView: v.site_showcase_wide_view,
        showcaseMedia: v.site_showcase_media,
        showcaseTitleAlign: v.site_showcase_title_align,
        showcaseTitleFont: v.site_showcase_title_font,
        showcaseTitleSize: v.site_showcase_title_size,
        showcaseIntroFont: v.site_showcase_intro_font,
        showcaseIntroSize: v.site_showcase_intro_size,
        showcaseStackRatio: v.site_showcase_stack_ratio,
        showcaseStackCrop: v.site_showcase_stack_crop,
        designStackRatio: v.site_design_stack_ratio,
        designStackCrop: v.site_design_stack_crop,
        designMedia: v.site_design_media,
        designCount: v.site_design_count,
        writingMode: v.site_writing_mode,
        writingView: v.site_writing_view,
        writingWideView: v.site_writing_wide_view,
        writingSize: v.site_writing_size,
        writingMedia: v.site_writing_media,
        writingTitleAlign: v.site_writing_title_align,
        writingTitleFont: v.site_writing_title_font,
        writingTitleSize: v.site_writing_title_size,
        writingIntroFont: v.site_writing_intro_font,
        writingIntroSize: v.site_writing_intro_size,
        writingStackRatio: v.site_writing_stack_ratio,
        writingStackCrop: v.site_writing_stack_crop,
        articlesMode: v.site_articles_mode,
        articlesView: v.site_articles_view,
        articlesWideView: v.site_articles_wide_view,
        articlesSize: v.site_articles_size,
        articlesMedia: v.site_articles_media,
        articlesTitleAlign: v.site_articles_title_align,
        articlesTitleFont: v.site_articles_title_font,
        articlesTitleSize: v.site_articles_title_size,
        articlesIntroFont: v.site_articles_intro_font,
        articlesIntroSize: v.site_articles_intro_size,
        articlesStackRatio: v.site_articles_stack_ratio,
        articlesStackCrop: v.site_articles_stack_crop,
        projectMode: v.site_project_mode,
        projectWideView: v.site_project_wide_view,
        projectTitleAlign: v.site_project_title_align,
        projectTitleFont: v.site_project_title_font,
        projectTitleSize: v.site_project_title_size,
        projectIntroFont: v.site_project_intro_font,
        projectIntroSize: v.site_project_intro_size,
        projectStackRatio: v.site_project_stack_ratio,
        projectStackCrop: v.site_project_stack_crop,
        bibliaMode: v.site_biblia_mode,
        bibliaView: v.site_biblia_view,
        bibliaWideView: v.site_biblia_wide_view,
        bibliaSize: v.site_biblia_size,
        bibliaTitleAlign: v.site_biblia_title_align,
        bibliaTitleFont: v.site_biblia_title_font,
        bibliaTitleSize: v.site_biblia_title_size,
        bibliaIntroFont: v.site_biblia_intro_font,
        bibliaIntroSize: v.site_biblia_intro_size,
        githubMode: v.site_github_mode,
        githubView: v.site_github_view,
        githubWideView: v.site_github_wide_view,
        githubTitleAlign: v.site_github_title_align,
        githubTitleFont: v.site_github_title_font,
        githubTitleSize: v.site_github_title_size,
        githubIntroFont: v.site_github_intro_font,
        githubIntroSize: v.site_github_intro_size,
        sections: readSections(v.site_sections),
        order: readOrder(v.site_order),
        aboutLayout: readChoice(field(formData, "site_about_layout"), aboutLayouts, aboutDefaults.aboutLayout),
        aboutPhoto: readChoice(field(formData, "site_about_photo"), aboutPhotoShapes, aboutDefaults.aboutPhoto),
        steamLayout: readChoice(field(formData, "site_steam_layout"), steamLayouts, aboutDefaults.steamLayout),
        steamMode: readChoice(field(formData, "site_steam_mode"), steamModes, aboutDefaults.steamMode),
        steamBackground: readChoice(
          field(formData, "site_steam_background"),
          steamBackgrounds,
          aboutDefaults.steamBackground,
        ),
        steamOpacity: rangeValue(field(formData, "site_steam_opacity"), styleRanges.steamOpacity, aboutDefaults.steamOpacity),
        steamPosition: rangeValue(
          field(formData, "site_steam_position"),
          styleRanges.steamPosition,
          aboutDefaults.steamPosition,
        ),
        aboutSections: readAboutSections(parseJson(field(formData, "site_about_sections"))),
        aboutOrder: readAboutOrder(parseJson(field(formData, "site_about_order"))),
        colorBg: v.site_color_bg,
        colorInk: v.site_color_ink,
        colorAccent: v.site_color_accent,
        colorBand: v.site_color_band,
        colorTertiary: v.site_color_tertiary,
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