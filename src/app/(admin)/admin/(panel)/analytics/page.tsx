import type { Metadata } from "next";
import { BarChart } from "@/components/ui/BarChart";
import { ButtonLink } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { routes } from "@/config/site";
import { getStats } from "@/features/analytics/queries";
import { requireUser } from "@/features/auth/queries";

export const metadata: Metadata = { title: "Analytics" };

type Props = { searchParams: Promise<{ days?: string }> };

const ranges = [7, 30, 90];

export default async function AnalyticsPage({ searchParams }: Props) {
  const { days: raw } = await searchParams;
  const requested = Number(raw);
  const days = ranges.includes(requested) ? requested : 30;

  const user = await requireUser();
  const stats = await getStats(user.id, days);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black">Analytics</h1>
        <div className="flex gap-2">
          {ranges.map((d) => (
            <ButtonLink
              key={d}
              href={`${routes.analytics}?days=${d}`}
              size="sm"
              variant={d === days ? "accent" : "solid"}
            >
              {d} days
            </ButtonLink>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-3 gap-4">
        <StatCard label="Views" value={String(stats.views)} />
        <StatCard label="Clicks" value={String(stats.clicks)} />
        <StatCard label="Click rate" value={`${(stats.ctr * 100).toFixed(1)}%`} />
      </section>

      <BarChart data={stats.daily} />

      <div className="grid gap-8 sm:grid-cols-2">
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
        <section>
          <h2 className="font-display text-2xl font-black">Devices</h2>
          {stats.devices.length === 0 ? (
            <p className="mt-3 font-mono text-sm text-ink-soft">No views yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {stats.devices.map((d) => (
                <li key={d.name} className="ink-border flex justify-between rounded-md bg-surface px-4 py-2">
                  <span className="capitalize">{d.name}</span>
                  <span className="font-mono">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}