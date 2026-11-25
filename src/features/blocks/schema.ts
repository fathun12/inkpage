import { z } from "zod";
import { cardRanges, mediaDefaults } from "@/config/card";
import { countdownConfig } from "@/config/countdown";
import { blockPages } from "@/config/site-content";
import { mediaConfig } from "@/config/media";
import { parseEmbed } from "@/lib/embed";
import { field } from "@/lib/form";
import { splitLines } from "@/lib/social";
import { isHttpUrl } from "@/lib/validation";
import {
  blockTypes,
  itemShapes,
  mediaFits,
  mediaHeights,
  mediaPlacements,
  mediaPositions,
} from "@/types/block";

export const blockSchema = z
  .object({
    type: z.enum(blockTypes, { error: "Pick a block type." }),
    page: z.enum(blockPages, { error: "Pick a page." }),
    home: z.boolean(),
    items: z.boolean(),
    shape: z.enum(itemShapes, { error: "Pick a shape." }),
    nexus: z.string().trim().max(500, "The Nexus link is too long.").optional(),
    github: z.string().trim().max(500, "The GitHub link is too long.").optional(),
    title: z
      .string({ error: "Title is required." })
      .trim()
      .min(1, "Title is required.")
      .max(80, "Title can be at most 80 characters."),
    url: z.string().trim().max(500, "Link is too long.").optional(),
    body: z.string().trim().max(500, "Text can be at most 500 characters.").optional(),
    links: z.string().max(1500, "That is too much text for the links box.").optional(),
    target: z.string().optional(),
    publish_at: z.string().optional(),
    expire_at: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "link" && (!v.url || !isHttpUrl(v.url))) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "A link block needs a valid URL starting with http:// or https://",
      });
    }
    if (v.type === "project" && v.url && !isHttpUrl(v.url)) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "The project link must start with http:// or https://",
      });
    }
    if (v.type === "embed" && (!v.url || !parseEmbed(v.url))) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Paste a valid YouTube or Spotify link.",
      });
    }
    if (v.type === "text" && !v.body) {
      ctx.addIssue({ code: "custom", path: ["body"], message: "A text block needs some text." });
    }
    if (v.type === "socials") {
      const lines = splitLines(v.links);
      if (lines.length === 0) {
        ctx.addIssue({ code: "custom", path: ["links"], message: "Add at least one social link." });
      } else if (lines.length > mediaConfig.maxSocials) {
        ctx.addIssue({
          code: "custom",
          path: ["links"],
          message: `You can add up to ${mediaConfig.maxSocials} social links.`,
        });
      } else if (!lines.every(isHttpUrl)) {
        ctx.addIssue({
          code: "custom",
          path: ["links"],
          message: "Every line must be a link starting with http:// or https://",
        });
      }
    }
    if (v.type === "countdown" && !v.target) {
      ctx.addIssue({
        code: "custom",
        path: ["target"],
        message: "Pick the date and time to count down to.",
      });
    }
    if (v.type === "countdown" && v.body && v.body.length > countdownConfig.descriptionMax) {
      ctx.addIssue({
        code: "custom",
        path: ["body"],
        message: `The description can be at most ${countdownConfig.descriptionMax} characters.`,
      });
    }
    if (v.nexus && !isHttpUrl(v.nexus)) {
      ctx.addIssue({
        code: "custom",
        path: ["nexus"],
        message: "The Nexus link must start with http:// or https://",
      });
    }
    if (v.github && !isHttpUrl(v.github)) {
      ctx.addIssue({
        code: "custom",
        path: ["github"],
        message: "The GitHub link must start with http:// or https://",
      });
    }
    if (v.publish_at && v.expire_at && v.expire_at <= v.publish_at) {
      ctx.addIssue({
        code: "custom",
        path: ["expire_at"],
        message: "The hide date must be after the show date.",
      });
    }
  });

export type BlockInput = z.infer<typeof blockSchema>;

export function parseBlockForm(formData: FormData) {
  return blockSchema.safeParse({
    type: field(formData, "type"),
    page: field(formData, "page") ?? "home",
    home: formData.get("home") === "on",
    items: formData.get("item_fields") === "1",
    shape: field(formData, "shape") ?? "card",
    nexus: field(formData, "nexus"),
    github: field(formData, "github"),
    title: field(formData, "title"),
    url: field(formData, "url"),
    body: field(formData, "body"),
    links: field(formData, "links"),
    target: field(formData, "target"),
    publish_at: field(formData, "publish_at"),
    expire_at: field(formData, "expire_at"),
  });
}

// Settings of the image or GIF inside a link or project card (blocks.data.media, without url and kind).
export const mediaSettingsSchema = z.object({
  opacity: z.coerce
    .number({ error: "Media opacity must be a number." })
    .int("Media opacity must be a whole number.")
    .min(cardRanges.opacity.min, "Media opacity is out of range.")
    .max(cardRanges.opacity.max, "Media opacity is out of range."),
  fit: z.enum(mediaFits, { error: "Pick how the media fits." }),
  position: z.enum(mediaPositions, { error: "Pick where the media sits." }),
  placement: z.enum(mediaPlacements, { error: "Pick where the media goes." }),
  height: z.enum(mediaHeights, { error: "Pick a media height." }),
});

export function parseMediaSettings(formData: FormData) {
  return mediaSettingsSchema.safeParse({
    opacity: field(formData, "media_opacity") ?? mediaDefaults.opacity,
    fit: field(formData, "media_fit") ?? mediaDefaults.fit,
    position: field(formData, "media_position") ?? mediaDefaults.position,
    placement: field(formData, "media_placement") ?? mediaDefaults.placement,
    height: field(formData, "media_height") ?? mediaDefaults.height,
  });
}
