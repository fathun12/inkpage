"use server";

import { redirect } from "next/navigation";
import { articleLimits } from "@/config/article";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import {
  collectImageUrls,
  docText,
  emptyDoc,
  excerptOf,
  isArticleImageSrc,
  isUuid,
  readingMinutes,
  sanitizeDoc,
  slugify,
  wordCount,
} from "@/lib/article-doc";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { createClient } from "@/lib/supabase/server";
import { cleanTags } from "@/lib/tags";
import { firstError } from "@/lib/validation";
import type {
  ArticleDraftInput,
  ArticleImageSignInput,
  ArticleImageSignResult,
  ArticleSaveResult,
  DocNode,
} from "@/types/article";
import { draftSchema, parseWhen, publishSchema } from "./schema";
import { signArticleImage, sweepArticleImages } from "./upload";

type DbError = { code?: string; message: string };

function dbMessage(error: DbError): string {
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "The database does not know articles yet. Run the migration 20261125020000_articles.sql in Supabase, then try again.";
  }
  return `Database error: ${error.message}`;
}

type Prepared = { doc: DocNode; text: string; words: number; minutes: number };

// The browser's document is never trusted: it is size checked, then rebuilt from the allowed parts only.
function prepareContent(raw: unknown, userId: string): Prepared | { error: string } {
  let size = 0;
  try {
    size = JSON.stringify(raw ?? null).length;
  } catch {
    return { error: "The article text could not be read." };
  }
  if (size > articleLimits.contentChars) {
    return { error: `The article is too long (limit ${articleLimits.contentChars.toLocaleString("en-US")} characters of data).` };
  }
  const doc = sanitizeDoc(raw, userId);
  const text = docText(doc);
  const words = wordCount(text);
  return { doc, text, words, minutes: readingMinutes(words) };
}

// Called by "Write a new article": makes an empty draft and opens the editor.
export async function createArticleAction(): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .insert({ user_id: user.id, content: emptyDoc })
    .select("id")
    .single();
  if (error || !data) return redirectWithError(routes.write, error ? dbMessage(error) : "Could not create the article.");
  redirect(routes.writeEdit(data.id as string));
}

// Autosave and the Update button. Called from the editor in the browser, so it answers with a result
// (the editor shows "Saved" or "Failed: ...") instead of redirecting.
export async function saveArticleAction(id: string, input: ArticleDraftInput): Promise<ArticleSaveResult> {
  const user = await requireUser();
  if (!isUuid(id)) return { ok: false, error: "This article address is not valid." };

  const parsed = draftSchema.safeParse({ title: String(input?.title ?? ""), subtitle: String(input?.subtitle ?? "") });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const prepared = prepareContent(input?.content, user.id);
  if ("error" in prepared) return { ok: false, error: prepared.error };

  const savedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .update({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      content: prepared.doc,
      excerpt: excerptOf(prepared.text) || null,
      reading_minutes: prepared.minutes,
      updated_at: savedAt,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, cover_url");
  if (error) return { ok: false, error: dbMessage(error) };
  if (!data || data.length === 0) return { ok: false, error: "This article no longer exists." };
  const cover = (data[0] as unknown as { cover_url: string | null }).cover_url;
  await sweepArticleImages(user.id, id, [...collectImageUrls(prepared.doc), ...(cover ? [cover] : [])]);
  return { ok: true, savedAt, words: prepared.words, minutes: prepared.minutes };
}

// The drawer form: saves the latest text AND publishes (or schedules, or updates) in one step.
export async function publishArticleAction(id: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) return redirectWithError(routes.write, "This article address is not valid.");
  const back = routes.writeEdit(id);

  const rawTitle = String(formData.get("title") ?? "");
  const slug =
    slugify(String(formData.get("slug") ?? "")) || slugify(rawTitle) || `article-${id.slice(0, 8)}`;
  const parsed = publishSchema.safeParse({
    title: rawTitle,
    subtitle: String(formData.get("subtitle") ?? ""),
    slug,
  });
  if (!parsed.success) return redirectWithError(back, firstError(parsed.error));

  let raw: unknown = null;
  try {
    raw = JSON.parse(String(formData.get("content") ?? "null"));
  } catch {
    return redirectWithError(back, "The article text could not be read. Reload the editor and try again.");
  }
  const prepared = prepareContent(raw, user.id);
  if ("error" in prepared) return redirectWithError(back, prepared.error);
  if (prepared.words === 0) return redirectWithError(back, "Write something in the article before publishing.");

  const coverField = String(formData.get("cover_url") ?? "").trim();
  if (coverField !== "" && !(isArticleImageSrc(coverField, user.id) && coverField.includes(`/articles/${id}/`))) {
    return redirectWithError(back, "The cover picture is not valid. Pick it again.");
  }

  const tagged = cleanTags(String(formData.get("tags") ?? ""));
  if ("error" in tagged) return redirectWithError(back, tagged.error);

  const seriesField = String(formData.get("series_id") ?? "").trim();
  const partField = String(formData.get("series_position") ?? "").trim();
  if (seriesField !== "" && !isUuid(seriesField)) return redirectWithError(back, "The series is not valid. Pick it again.");
  const part = partField === "" ? null : Number(partField);
  if (part !== null && (!Number.isInteger(part) || part < 1 || part > articleLimits.seriesPart)) {
    return redirectWithError(back, `The part number must be a whole number from 1 to ${articleLimits.seriesPart}.`);
  }

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("articles")
    .select("status, published_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) return redirectWithError(back, dbMessage(readError));
  if (!current) return redirectWithError(routes.write, "This article no longer exists.");

  // The series must be the owner's. No part number = the end of the series.
  let seriesId: string | null = null;
  let seriesPosition: number | null = null;
  if (seriesField !== "") {
    const { data: owned, error: seriesError } = await supabase
      .from("series")
      .select("id")
      .eq("id", seriesField)
      .eq("user_id", user.id)
      .maybeSingle();
    if (seriesError) return redirectWithError(back, dbMessage(seriesError));
    if (!owned) return redirectWithError(back, "That series no longer exists. Pick another one.");
    seriesId = seriesField;
    if (part !== null) {
      seriesPosition = part;
    } else {
      const { data: last } = await supabase
        .from("articles")
        .select("series_position")
        .eq("user_id", user.id)
        .eq("series_id", seriesId)
        .neq("id", id)
        .not("series_position", "is", null)
        .order("series_position", { ascending: false })
        .limit(1);
      const top = (last?.[0] as { series_position: number } | undefined)?.series_position ?? 0;
      seriesPosition = Math.min(top + 1, articleLimits.seriesPart);
    }
  }

  const now = new Date();
  const mode = String(formData.get("mode") ?? "now");
  let publishedAt = now;
  if (mode === "schedule") {
    const when = parseWhen(String(formData.get("when") ?? ""));
    if (!when) return redirectWithError(back, "Pick a date and time for the schedule.");
    if (when.getTime() <= now.getTime()) return redirectWithError(back, "The scheduled time must be in the future (WIB).");
    publishedAt = when;
  } else if (mode === "keep" && current.status === "published" && current.published_at) {
    publishedAt = new Date(current.published_at as string);
  }

  const { error } = await supabase
    .from("articles")
    .update({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      content: prepared.doc,
      excerpt: excerptOf(prepared.text) || null,
      reading_minutes: prepared.minutes,
      slug: parsed.data.slug,
      cover_url: coverField || null,
      tags: tagged.tags,
      series_id: seriesId,
      series_position: seriesPosition,
      status: "published",
      published_at: publishedAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return redirectWithError(
      back,
      error.code === "23505"
        ? `The address "/${parsed.data.slug}" is already used by another article. Pick another one.`
        : dbMessage(error),
    );
  }

  await sweepArticleImages(user.id, id, [...collectImageUrls(prepared.doc), ...(coverField ? [coverField] : [])]);
  const message =
    publishedAt.getTime() > now.getTime() ? "Scheduled." : current.status === "published" ? "Updated." : "Published.";
  return redirectWithSaved(back, message);
}

export async function unpublishArticleAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) return redirectWithError(routes.write, "This article address is not valid.");
  const back = routes.writeEdit(id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .update({ status: "draft", published_at: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error) return redirectWithError(back, dbMessage(error));
  if (!data || data.length === 0) return redirectWithError(routes.write, "This article no longer exists.");
  return redirectWithSaved(back, "Back to draft. The article is no longer public.");
}

export async function deleteArticleAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) return redirectWithError(routes.write, "This article address is not valid.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").delete().eq("id", id).eq("user_id", user.id).select("id");
  if (error) return redirectWithError(routes.writeEdit(id), dbMessage(error));
  if (!data || data.length === 0) return redirectWithError(routes.write, "This article no longer exists.");
  await sweepArticleImages(user.id, id, [], 0);
  return redirectWithSaved(routes.write, "Article deleted.");
}

// Gives the browser permission to upload ONE picture of this article straight to Storage.
export async function signArticleImageAction(id: string, input: ArticleImageSignInput): Promise<ArticleImageSignResult> {
  const user = await requireUser();
  if (!isUuid(id)) return { error: "This article address is not valid." };
  return signArticleImage(user.id, id, input);
}