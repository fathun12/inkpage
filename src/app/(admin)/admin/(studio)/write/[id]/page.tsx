import { notFound, redirect } from "next/navigation";
import { ArticleEditor } from "@/components/admin/write/ArticleEditor";
import { routes } from "@/config/site";
import {
  deleteArticleAction,
  publishArticleAction,
  saveArticleAction,
  signArticleImageAction,
  unpublishArticleAction,
} from "@/features/articles/actions";
import { getOwnArticle } from "@/features/articles/queries";
import { requireUser } from "@/features/auth/queries";
import { getProfileById } from "@/features/profile/queries";
import { savedText } from "@/lib/flash";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }>;
};

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export default async function WriteEditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);
  const article = await getOwnArticle(user.id, id);
  if (!article) notFound();

  const error = first(sp.error);
  const saved = first(sp.saved);
  const notice = error
    ? ({ tone: "error", text: error } as const)
    : saved
      ? ({ tone: "ok", text: savedText(saved) } as const)
      : null;

  return (
    <ArticleEditor
      initial={{
        title: article.title,
        subtitle: article.subtitle ?? "",
        doc: article.content,
        status: article.status,
        state: article.state,
        slug: article.slug,
        cover: article.cover_url,
      }}
      username={profile.username}
      backHref={routes.write}
      viewHref={article.state === "live" && article.slug ? routes.article(profile.username, article.slug) : null}
      previewHref={routes.articlePreview(profile.username, article.id)}
      save={saveArticleAction.bind(null, article.id)}
      signImage={signArticleImageAction.bind(null, article.id)}
      publish={publishArticleAction.bind(null, article.id)}
      unpublish={unpublishArticleAction.bind(null, article.id)}
      remove={deleteArticleAction.bind(null, article.id)}
      notice={notice}
    />
  );
}