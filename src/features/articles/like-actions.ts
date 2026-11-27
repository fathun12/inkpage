"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { detectDevice } from "@/features/analytics/device";
import { isUuid } from "@/lib/article-doc";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashVisitor, isVisitorId, visitorCookie } from "./visitor";

export type LikeResult = { ok: true; liked: boolean; count: number } | { ok: false; error: string };

// Like or unlike one article. One visitor (one cookie) counts at most once; the database enforces it.
export async function toggleLikeAction(articleId: string): Promise<LikeResult> {
  if (!isUuid(articleId)) return { ok: false, error: "Could not like this article." };

  // Bots are not counted, like in the view counter.
  const agent = (await headers()).get("user-agent");
  if (!detectDevice(agent)) return { ok: false, error: "Could not like this article." };

  const jar = await cookies();
  let visitor = jar.get(visitorCookie)?.value;
  if (!isVisitorId(visitor)) {
    visitor = randomUUID();
    jar.set(visitorCookie, visitor, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const { data, error } = await createAdminClient().rpc("article_like_toggle", {
    p_article: articleId,
    p_visitor: hashVisitor(visitor),
  });
  if (error) {
    return {
      ok: false,
      error: error.message.includes("not_available")
        ? "This article is not available."
        : `Could not save the like: ${error.message}`,
    };
  }
  const result = data as { liked?: boolean; count?: number } | null;
  if (!result || typeof result.liked !== "boolean" || typeof result.count !== "number") {
    return { ok: false, error: "Could not save the like: unexpected answer from the database." };
  }
  return { ok: true, liked: result.liked, count: result.count };
}