export type ArticleStatus = "draft" | "published";
// draft = not public, scheduled = published with a future date, live = public now.
export type ArticleState = "draft" | "scheduled" | "live";

export type DocMark = { type: string; attrs?: Record<string, unknown> };
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  text?: string;
  marks?: DocMark[];
};

export type Article = {
  id: string;
  user_id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  content: DocNode;
  excerpt: string | null;
  reading_minutes: number;
  cover_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleSummary = Pick<
  Article,
  "id" | "slug" | "title" | "subtitle" | "excerpt" | "reading_minutes" | "cover_url" | "status" | "published_at" | "updated_at"
>;
export type OwnArticleSummary = ArticleSummary & { state: ArticleState };
export type OwnArticle = Article & { state: ArticleState };

export type ArticleDraftInput = { title: string; subtitle: string; content: unknown };
export type ArticleSaveResult =
  | { ok: true; savedAt: string; words: number; minutes: number }
  | { ok: false; error: string };
export type SaveArticleAction = (input: ArticleDraftInput) => Promise<ArticleSaveResult>;