import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QrCard } from "@/components/admin/QrCard";
import { ButtonLink } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { routes } from "@/config/site";
import { getStats } from "@/features/analytics/queries";
import { requireUser } from "@/features/auth/queries";
import { getOwnBlocks } from "@/features/blocks/queries";
import { getProfileById } from "@/features/profile/queries";
import { qrSvg } from "@/features/qr/generate";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  const [stats, blocks] = await Promise.all([getStats(user.id, 30), getOwnBlocks(user.id)]);
  const liveCount = blocks.filter((b) => b.status === "live").length;
  const pageUrl = `${await getSiteUrl()}${routes.profile(profile.username)}`;
  const qr = await qrSvg(pageUrl);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black">Overview</h1>
          <p className="mt-2 text-ink-soft">
            Your page is live at{" "}
            <a href={routes.profile(profile.username)} target="_blank" rel="noopener noreferrer" className="font-mono underline underline-offset-4">
              /{profile.username}
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={routes.pages} variant="studio">Pages</ButtonLink>
          <ButtonLink href={routes.customize} variant="studio">Customize</ButtonLink>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Views" value={String(stats.views)} note="Last 30 days" />
        <StatCard label="Clicks" value={String(stats.clicks)} note="Last 30 days" />
        <StatCard label="Click rate" value={`${(stats.ctr * 100).toFixed(1)}%`} />
        <StatCard label="Live blocks" value={String(liveCount)} note={`${blocks.length} in total`} />
      </section>

      <section>
        <h2 className="font-display text-2xl font-black">Top links</h2>
        {stats.topBlocks.length === 0 ? (
          <p className="mt-3 font-mono text-sm text-ink-soft">No clicks yet.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-2">
            {stats.topBlocks.map((b) => (
              <li key={b.id} className="ink-border flex justify-between rounded-md bg-surface px-4 py-2">
                <span className="truncate">{b.title}</span>
                <span className="font-mono">{b.clicks}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="flex flex-wrap gap-4">
        <ButtonLink href={routes.links} variant="accent">Edit links</ButtonLink>
      </div>

      <QrCard svg={qr} url={pageUrl} />
    </div>
  );
}