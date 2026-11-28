import { randomUUID } from "node:crypto";
import { articleImages } from "@/config/article";
import { createClient } from "@/lib/supabase/server";
import { createPublicUpload, listPublicFolder, sweepPublicFolder } from "@/features/media/upload";
import type { ArticleImageSignInput, ArticleImageSignResult } from "@/types/article";

const extensions: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

function folderOf(userId: string, articleId: string): string {
  return `${userId}/${articleImages.folder}/${articleId}`;
}

// Gives the browser a one-time permission to upload ONE picture of this article straight to storage.
export async function signArticleImage(
  userId: string,
  articleId: string,
  input: ArticleImageSignInput,
): Promise<ArticleImageSignResult> {
  const type = typeof input?.type === "string" ? input.type : "";
  const size = typeof input?.size === "number" ? input.size : 0;
  const kind = input?.kind === "cover" ? "cover" : "image";
  const ext = extensions[type];
  if (!ext) return { error: "Pictures must be JPG, PNG or WebP." };
  if (!Number.isFinite(size) || size <= 0 || size > articleImages.maxMb * 1024 * 1024) {
    return { error: `This picture is too large. The limit is ${articleImages.maxMb} MB.` };
  }

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!article) return { error: "This article no longer exists." };

  const folder = folderOf(userId, articleId);
  if (kind === "image") {
    const files = (await listPublicFolder(folder)) ?? [];
    const used = files.filter((f) => !f.name.startsWith(".") && !f.name.startsWith("cover-")).length;
    if (used >= articleImages.maxPerArticle) {
      return { error: `An article can have at most ${articleImages.maxPerArticle} pictures.` };
    }
  }

  const path = `${folder}/${kind === "cover" ? "cover-" : ""}${randomUUID()}.${ext}`;
  return createPublicUpload(path, type);
}

// Deletes the article's files that the text and cover no longer use. Files younger than minAgeMs are kept,
// because a picture can be uploaded a moment before the text that uses it is saved.
export async function sweepArticleImages(
  userId: string,
  articleId: string,
  keepUrls: string[],
  minAgeMs: number = articleImages.sweepAfterMs,
): Promise<void> {
  await sweepPublicFolder("sweepArticleImages", folderOf(userId, articleId), keepUrls, minAgeMs);
}