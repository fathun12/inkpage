import { z } from "zod";
import { mediaConfig } from "@/config/media";
import { parseEmbed } from "@/lib/embed";
import { field } from "@/lib/form";
import { splitLines } from "@/lib/social";
import { isHttpUrl } from "@/lib/validation";
import { blockTypes } from "@/types/block";

export const blockSchema = z
  .object({
    type: z.enum(blockTypes, { error: "Pick a block type." }),
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
    title: field(formData, "title"),
    url: field(formData, "url"),
    body: field(formData, "body"),
    links: field(formData, "links"),
    target: field(formData, "target"),
    publish_at: field(formData, "publish_at"),
    expire_at: field(formData, "expire_at"),
  });
}
