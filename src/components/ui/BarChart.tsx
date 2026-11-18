import type { DailyPoint } from "@/types/analytics";

export function BarChart({ data }: { data: DailyPoint[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.views, d.clicks]));
  return (
    <div className="ink-border rounded-md bg-surface p-4">
      <div className="flex h-40 items-end gap-0.5" role="img" aria-label="Daily views and clicks">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex h-full flex-1 items-end gap-px"
            title={`${d.label}: ${d.views} views, ${d.clicks} clicks`}
          >
            <div className="w-1/2 bg-ink" style={{ height: `${(d.views / max) * 100}%` }} />
            <div className="w-1/2 bg-accent" style={{ height: `${(d.clicks / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 font-mono text-xs text-ink-soft">
        <span className="flex items-center gap-1.5"><i className="size-3 bg-ink" /> Views</span>
        <span className="flex items-center gap-1.5"><i className="size-3 bg-accent" /> Clicks</span>
      </div>
    </div>
  );
}