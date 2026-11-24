import { randomUUID } from "node:crypto";
import { articleImages } from "@/config/article";
import { mediaConfig } from "@/config/media";
import { createClient } from "@/lib/supabase/server";
import type { ArticleImageSignInput, ArticleImageSignResult } from "@/types/article";

const extensions: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

function folderOf(userId: string, articleId: string): string {
  return `${userId}/${articleImages.folder}/${articleId}`;
}

function pathOf(url: string): string | null {
  const marker = `/object/public/${mediaConfig.bucket}/`;
  const at = url.indexOf(marker);
  if (at < 0) return null;
  return decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
}

// Gives the browser a one-time permission to upload ONE picture of this article straight to Storage.
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
  const bucket = supabase.storage.from(mediaConfig.bucket);
  if (kind === "image") {
    const { data: files } = await bucket.list(folder, { limit: 200 });
    const used = (files ?? []).filter((f) => !f.name.startsWith(".") && !f.name.startsWith("cover-")).length;
    if (used >= articleImages.maxPerArticle) {
      return { error: `An article can have at most ${articleImages.maxPerArticle} pictures.` };
    }
  }

  const path = `${folder}/${kind === "cover" ? "cover-" : ""}${randomUUID()}.${ext}`;
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) return { error: `Could not prepare the upload: ${error?.message ?? "unknown error"}` };
  return { path, token: data.token, url: bucket.getPublicUrl(path).data.publicUrl };
}

// Deletes the article's files that the text and cover no longer use. Files younger than minAgeMs are kept,
// because a picture can be uploaded a moment before the text that uses it is saved.
export async function sweepArticleImages(
  userId: string,
  articleId: string,
  keepUrls: string[],
  minAgeMs: number = articleImages.sweepAfterMs,
): Promise<void> {
  const supabase = await createClient();
  const bucket = supabase.storage.from(mediaConfig.bucket);
  const folder = folderOf(userId, articleId);
  const { data, error } = await bucket.list(folder, { limit: 200 });
  if (error || !data) {
    console.error("sweepArticleImages: could not list the folder", error?.message);
    return;
  }

  const keep = new Set(keepUrls.map(pathOf).filter((p): p is string => p !== null));
  const now = Date.now();
  const stale = data
    .filter((f) => !f.name.startsWith("."))
    .filter((f) => {
      if (minAgeMs === 0) return true;
      const created = f.created_at ? new Date(f.created_at).getTime() : Number.NaN;
      return Number.isFinite(created) && now - created > minAgeMs;
    })
    .map((f) => `${folder}/${f.name}`)
    .filter((p) => !keep.has(p));
  if (stale.length === 0) return;

  const { data: removed, error: removeError } = await bucket.remove(stale);
  if (removeError || (removed?.length ?? 0) < stale.length) {
    console.error("sweepArticleImages: some files were not deleted", {
      wanted: stale.length,
      removed: removed?.length ?? 0,
      error: removeError?.message,
    });
  }
}