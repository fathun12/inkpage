import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/ArticleView";
import { routes } from "@/config/site";
import { getOwnArticle } from "@/features/articles/queries";
import { requireUser } from "@/features/auth/queries";
import { getProfileByUsername } from "@/features/profile/queries";

type Props = { params: Promise<{ slug: string; id: string }> };

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

// The owner's view of an article exactly as readers see it. Works for drafts, scheduled and live articles.
export default async function PreviewPage({ params }: Props) {
  const { slug, id } = await params;
  const user = await requireUser();
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile || profile.id !== user.id) notFound();
  const article = await getOwnArticle(user.id, id);
  if (!article) notFound();

  const note =
    article.state === "draft"
      ? "Preview · Draft. Only you can see this."
      : article.state === "scheduled"
        ? "Preview · Scheduled. Only you can see this until the date."
        : "Preview · The saved version of a live article.";

  return (
    <>
      <p className="bg-tertiary px-5 py-2 text-center font-mono text-[11px] uppercase tracking-widest text-tertiary-ink">
        {note}
      </p>
      <ArticleView
        title={article.title || "Untitled"}
        subtitle={article.subtitle}
        publishedAt={article.published_at}
        minutes={article.reading_minutes}
        cover={article.cover_url}
        doc={article.content}
        back={routes.writeEdit(article.id)}
        backLabel="Editor"
      />
    </>
  );
}