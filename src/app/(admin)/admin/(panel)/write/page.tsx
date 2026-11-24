import { redirect } from "next/navigation";
import { ArticlesAdmin } from "@/components/admin/ArticlesAdmin";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { createArticleAction } from "@/features/articles/actions";
import { getOwnArticles } from "@/features/articles/queries";
import { getProfileById } from "@/features/profile/queries";
import { savedText } from "@/lib/flash";

type Props = { searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }> };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export default async function WriteListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);
  const articles = await getOwnArticles(user.id);
  const error = first(sp.error);
  const saved = first(sp.saved);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Write</h1>
      {error && <FlashNotice tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice tone="ok">{savedText(saved)}</FlashNotice>}
      <ArticlesAdmin articles={articles} username={profile.username} create={createArticleAction} />
    </div>
  );
}