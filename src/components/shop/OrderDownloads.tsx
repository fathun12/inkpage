type Item = { id: string; name: string; sizeBytes: number | null; left: number; href: string };

const button =
  "inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg";

function size(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// The files of a paid order, one row each with a Download button.
export function OrderDownloads({ items }: { items: Item[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-4">
          <div className="flex flex-col gap-1">
            <p className="font-display text-xl leading-tight">{item.name}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
              {[size(item.sizeBytes), `${item.left} left`].filter(Boolean).join(" · ")}
            </p>
          </div>
          {item.left > 0 ? (
            <a href={item.href} className={button}>
              <span>Download</span>
              <span aria-hidden>↓</span>
            </a>
          ) : (
            <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">No downloads left</span>
          )}
        </li>
      ))}
    </ul>
  );
}