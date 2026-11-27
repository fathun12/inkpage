import { redirect } from "next/navigation";
import { SeriesAdmin } from "@/components/admin/SeriesAdmin";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { getProfileById } from "@/features/profile/queries";
import { createSeriesAction, deleteSeriesAction, updateSeriesAction } from "@/features/series/actions";
import { getOwnSeries } from "@/features/series/queries";
import { savedText } from "@/lib/flash";

type Props = { searchParams: Promise<{ error?: string | string[]; saved?: string | string[] }> };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export default async function SeriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);
  const series = await getOwnSeries(user.id);
  const error = first(sp.error);
  const saved = first(sp.saved);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Series</h1>
      {error && <FlashNotice tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice tone="ok">{savedText(saved)}</FlashNotice>}
      <SeriesAdmin
        create={createSeriesAction}
        items={series.map((s) => ({
          ...s,
          update: updateSeriesAction.bind(null, s.id),
          remove: deleteSeriesAction.bind(null, s.id),
        }))}
      />
    </div>
  );
}