import { routes } from "@/config/site";
import type { Block } from "@/types/block";

export function SocialsBlock({ block }: { block: Block }) {
  const items = block.data.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">{block.title}</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {items.map((item, index) => (
          <li key={item.url}>
            <a
              href={`${routes.go(block.id)}?i=${index}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ink-border press block rounded-md bg-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
