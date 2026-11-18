type Props = { label: string; value: string; note?: string };

export function StatCard({ label, value, note }: Props) {
  return (
    <div className="ink-border rounded-md bg-surface p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-4xl font-black leading-none">{value}</p>
      {note && <p className="mt-2 text-xs text-ink-soft">{note}</p>}
    </div>
  );
}