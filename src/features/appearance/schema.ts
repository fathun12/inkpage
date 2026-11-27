import { z } from "zod";
import { hexColor } from "@/config/background";
import { fontIds } from "@/config/font-choices";
import {
  countdownViews,
  densityModes,
  designIntroSizes,
  designModes,
  designSizes,
  designTextFonts,
  designTitleAligns,
  designTitleSizes,
  designViews,
  designWideViews,
  showcaseSizes,
  showcaseViews,
  showcaseWideViews,
  stackRatios,
  writingSizes,
  writingViews,
  writingWideViews,
  articleViews,
  articleWideViews,
  projectWideViews,
  bibliaViews,
  bibliaWideViews,
  githubViews,
  githubWideViews,
  linksViews,
  linksWideViews,
  visitViews,
  visitWideViews,
  visitSizes,
  shopViews,
  shopWideViews,
  projectSizes,
  projectViews,
  sectionSpace,
  sectionSurfaces,
} from "@/config/layout";
import { motionModes, styleRanges } from "@/config/site-style";

const color = z
  .string({ error: "Pick a color." })
  .trim()
  .regex(hexColor, "Pick a valid color.")
  .transform((v) => v.toLowerCase());

function whole(label: string, range: { min: number; max: number }) {
  return z.coerce
    .number({ error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(range.min, `${label} is out of range.`)
    .max(range.max, `${label} is out of range.`);
}

const sectionSpaceNumber = z
  .number({ error: "Section space must be a number." })
  .min(sectionSpace.min, "Section space is out of range.")
  .max(sectionSpace.max, "Section space is out of range.")
  .multipleOf(sectionSpace.step, "Section space must move in steps of 0.5.");

// The studio sends all section settings as one JSON text.
const sectionsJson = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "The section settings are not valid." });
      return z.NEVER;
    }
  })
  .pipe(
    z.record(
      z.string(),
      z.object({
        hidden: z.boolean(),
        top: sectionSpaceNumber,
        bottom: sectionSpaceNumber,
        surface: z.enum(sectionSurfaces, { error: "Pick a section background." }),
        line: z.boolean(),
      }),
    ),
  );

// The studio sends the order of the sections as one JSON text, a list of ids.
const orderJson = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "The section order is not valid." });
      return z.NEVER;
    }
  })
  .pipe(z.array(z.string()).max(30, "The section order is not valid."));

// The studio sends the entrance settings of the hero as one JSON text. readHeroMotion cleans it before saving.
const heroMotionJson = z
  .string()
  .max(4000, "The entrance settings are not valid.")
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "The entrance settings are not valid." });
      return z.NEVER;
    }
  });

export const appearanceSchema = z.object({
  font_heading: z.enum(fontIds, { error: "Pick a heading font." }),
  font_body: z.enum(fontIds, { error: "Pick a body font." }),
  site_color_bg: color,
  site_color_ink: color,
  site_color_accent: color,
  site_color_band: color,
  site_color_tertiary: color,
  site_motion: z.enum(motionModes, { error: "Pick a motion style." }),
  site_hero_seconds: whole("Hero slide time", styleRanges.seconds),
  site_gallery_seconds: whole("Gallery fade time", styleRanges.seconds),
  site_hero_overlay: whole("Hero overlay", styleRanges.heroOverlay),
  site_index_veil: whole("List overlay", styleRanges.indexVeil),
  site_hero_zoom: whole("Scroll zoom", styleRanges.heroZoom),
  site_index_zoom: whole("Link list zoom", styleRanges.indexZoom),
  site_hero_gray: z.boolean(),
  site_hero_motion: heroMotionJson,
  site_density: z.enum(densityModes, { error: "Pick a spacing." }),
  site_project_size: z.enum(projectSizes, { error: "Pick a project size." }),
  site_project_view: z.enum(projectViews, { error: "Pick a projects layout." }),
  site_project_media: whole("Projects photo height", styleRanges.projectMedia),
  site_countdown_view: z.enum(countdownViews, { error: "Pick a countdown style." }),
  site_design_size: z.enum(designSizes, { error: "Pick a design projects size." }),
  site_design_view: z.enum(designViews, { error: "Pick a design projects layout." }),
  site_design_mode: z.enum(designModes, { error: "Pick a design projects mode." }),
  site_design_wide_view: z.enum(designWideViews, { error: "Pick a full width layout." }),
  site_design_title_align: z.enum(designTitleAligns, { error: "Pick a title place." }),
  site_design_title_font: z.enum(designTextFonts, { error: "Pick a title font." }),
  site_design_title_size: z.enum(designTitleSizes, { error: "Pick a title size." }),
  site_design_intro_font: z.enum(designTextFonts, { error: "Pick a text font." }),
  site_design_intro_size: z.enum(designIntroSizes, { error: "Pick a text size." }),
  site_showcase_size: z.enum(showcaseSizes, { error: "Pick a Showcase size." }),
  site_showcase_view: z.enum(showcaseViews, { error: "Pick a Showcase layout." }),
  site_showcase_mode: z.enum(designModes, { error: "Pick a Showcase mode." }),
  site_showcase_wide_view: z.enum(showcaseWideViews, { error: "Pick a Showcase full width layout." }),
  site_showcase_media: whole("Showcase photo height", styleRanges.showcaseMedia),
  site_showcase_title_align: z.enum(designTitleAligns, { error: "Pick a Showcase title place." }),
  site_showcase_title_font: z.enum(designTextFonts, { error: "Pick a Showcase title font." }),
  site_showcase_title_size: z.enum(designTitleSizes, { error: "Pick a Showcase title size." }),
  site_showcase_intro_font: z.enum(designTextFonts, { error: "Pick a Showcase text font." }),
  site_showcase_intro_size: z.enum(designIntroSizes, { error: "Pick a Showcase text size." }),
  site_showcase_stack_ratio: z.enum(stackRatios, { error: "Pick a Showcase photo ratio." }),
  site_showcase_stack_crop: whole("Showcase crop position", styleRanges.stackCrop),
  site_design_stack_ratio: z.enum(stackRatios, { error: "Pick a design projects photo ratio." }),
  site_design_stack_crop: whole("Design projects crop position", styleRanges.stackCrop),
  site_design_media: whole("Design cover height", styleRanges.designMedia),
  site_design_count: whole("Design projects shown", styleRanges.designCount),
  site_writing_mode: z.enum(designModes, { error: "Pick a Writing mode." }),
  site_writing_view: z.enum(writingViews, { error: "Pick a Writing layout." }),
  site_writing_wide_view: z.enum(writingWideViews, { error: "Pick a Writing full width layout." }),
  site_writing_size: z.enum(writingSizes, { error: "Pick a Writing size." }),
  site_writing_media: whole("Writing photo height", styleRanges.writingMedia),
  site_writing_title_align: z.enum(designTitleAligns, { error: "Pick a Writing title place." }),
  site_writing_title_font: z.enum(designTextFonts, { error: "Pick a Writing title font." }),
  site_writing_title_size: z.enum(designTitleSizes, { error: "Pick a Writing title size." }),
  site_writing_intro_font: z.enum(designTextFonts, { error: "Pick a Writing text font." }),
  site_writing_intro_size: z.enum(designIntroSizes, { error: "Pick a Writing text size." }),
  site_writing_stack_ratio: z.enum(stackRatios, { error: "Pick a Writing photo ratio." }),
  site_writing_stack_crop: whole("Writing crop position", styleRanges.stackCrop),
  site_articles_mode: z.enum(designModes, { error: "Pick an Articles mode." }),
  site_articles_view: z.enum(articleViews, { error: "Pick an Articles layout." }),
  site_articles_wide_view: z.enum(articleWideViews, { error: "Pick an Articles full width layout." }),
  site_articles_size: z.enum(writingSizes, { error: "Pick an Articles size." }),
  site_articles_media: whole("Articles photo height", styleRanges.articlesMedia),
  site_articles_title_align: z.enum(designTitleAligns, { error: "Pick an Articles title place." }),
  site_articles_title_font: z.enum(designTextFonts, { error: "Pick an Articles title font." }),
  site_articles_title_size: z.enum(designTitleSizes, { error: "Pick an Articles title size." }),
  site_articles_intro_font: z.enum(designTextFonts, { error: "Pick an Articles text font." }),
  site_articles_intro_size: z.enum(designIntroSizes, { error: "Pick an Articles text size." }),
  site_articles_stack_ratio: z.enum(stackRatios, { error: "Pick an Articles photo ratio." }),
  site_articles_stack_crop: whole("Articles crop position", styleRanges.stackCrop),
  site_project_mode: z.enum(designModes, { error: "Pick a Projects mode." }),
  site_project_wide_view: z.enum(projectWideViews, { error: "Pick a Projects full width layout." }),
  site_project_title_align: z.enum(designTitleAligns, { error: "Pick a Projects title place." }),
  site_project_title_font: z.enum(designTextFonts, { error: "Pick a Projects title font." }),
  site_project_title_size: z.enum(designTitleSizes, { error: "Pick a Projects title size." }),
  site_project_intro_font: z.enum(designTextFonts, { error: "Pick a Projects text font." }),
  site_project_intro_size: z.enum(designIntroSizes, { error: "Pick a Projects text size." }),
  site_project_stack_ratio: z.enum(stackRatios, { error: "Pick a Projects photo ratio." }),
  site_project_stack_crop: whole("Projects crop position", styleRanges.stackCrop),
  site_biblia_mode: z.enum(designModes, { error: "Pick a Biblia mode." }),
  site_biblia_view: z.enum(bibliaViews, { error: "Pick a Biblia layout." }),
  site_biblia_wide_view: z.enum(bibliaWideViews, { error: "Pick a Biblia full width layout." }),
  site_biblia_size: z.enum(writingSizes, { error: "Pick a Biblia size." }),
  site_biblia_title_align: z.enum(designTitleAligns, { error: "Pick a Biblia title place." }),
  site_biblia_title_font: z.enum(designTextFonts, { error: "Pick a Biblia title font." }),
  site_biblia_title_size: z.enum(designTitleSizes, { error: "Pick a Biblia title size." }),
  site_biblia_intro_font: z.enum(designTextFonts, { error: "Pick a Biblia text font." }),
  site_biblia_intro_size: z.enum(designIntroSizes, { error: "Pick a Biblia text size." }),
  site_github_mode: z.enum(designModes, { error: "Pick a GitHub mode." }),
  site_github_view: z.enum(githubViews, { error: "Pick a GitHub layout." }),
  site_github_wide_view: z.enum(githubWideViews, { error: "Pick a GitHub full width layout." }),
  site_github_title_align: z.enum(designTitleAligns, { error: "Pick a GitHub title place." }),
  site_github_title_font: z.enum(designTextFonts, { error: "Pick a GitHub title font." }),
  site_github_title_size: z.enum(designTitleSizes, { error: "Pick a GitHub title size." }),
  site_github_intro_font: z.enum(designTextFonts, { error: "Pick a GitHub text font." }),
  site_github_intro_size: z.enum(designIntroSizes, { error: "Pick a GitHub text size." }),
  site_links_mode: z.enum(designModes, { error: "Pick a Links mode." }),
  site_links_view: z.enum(linksViews, { error: "Pick a Links layout." }),
  site_links_wide_view: z.enum(linksWideViews, { error: "Pick a Links full width layout." }),
  site_links_title_align: z.enum(designTitleAligns, { error: "Pick a Links title place." }),
  site_links_title_font: z.enum(designTextFonts, { error: "Pick a Links title font." }),
  site_links_title_size: z.enum(designTitleSizes, { error: "Pick a Links title size." }),
  site_links_intro_font: z.enum(designTextFonts, { error: "Pick a Links text font." }),
  site_links_intro_size: z.enum(designIntroSizes, { error: "Pick a Links text size." }),
  site_visit_mode: z.enum(designModes, { error: "Pick a Visit website mode." }),
  site_visit_view: z.enum(visitViews, { error: "Pick a Visit website layout." }),
  site_visit_wide_view: z.enum(visitWideViews, { error: "Pick a Visit website full width layout." }),
  site_visit_size: z.enum(visitSizes, { error: "Pick a Visit website size." }),
  site_visit_title_align: z.enum(designTitleAligns, { error: "Pick a Visit website title place." }),
  site_visit_title_font: z.enum(designTextFonts, { error: "Pick a Visit website title font." }),
  site_visit_title_size: z.enum(designTitleSizes, { error: "Pick a Visit website title size." }),
  site_visit_intro_font: z.enum(designTextFonts, { error: "Pick a Visit website text font." }),
  site_visit_intro_size: z.enum(designIntroSizes, { error: "Pick a Visit website text size." }),
  site_shop_mode: z.enum(designModes, { error: "Pick a Shop mode." }),
  site_shop_view: z.enum(shopViews, { error: "Pick a Shop layout." }),
  site_shop_wide_view: z.enum(shopWideViews, { error: "Pick a Shop full width layout." }),
  site_shop_size: z.enum(writingSizes, { error: "Pick a Shop size." }),
  site_shop_media: whole("Shop photo height", styleRanges.shopMedia),
  site_shop_title_align: z.enum(designTitleAligns, { error: "Pick a Shop title place." }),
  site_shop_title_font: z.enum(designTextFonts, { error: "Pick a Shop title font." }),
  site_shop_title_size: z.enum(designTitleSizes, { error: "Pick a Shop title size." }),
  site_shop_intro_font: z.enum(designTextFonts, { error: "Pick a Shop text font." }),
  site_shop_intro_size: z.enum(designIntroSizes, { error: "Pick a Shop text size." }),
  site_shop_stack_ratio: z.enum(stackRatios, { error: "Pick a Shop photo ratio." }),
  site_shop_stack_crop: whole("Shop crop position", styleRanges.stackCrop),
  site_sections: sectionsJson,
  site_order: orderJson,
});