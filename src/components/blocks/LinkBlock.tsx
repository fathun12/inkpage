import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/block";

function hostOf(url: string | null): string {
  try {
    return new URL(url ?? "").host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function LinkBlock({ block }: { block: Block }) {
  const pinned = block.is_pinned;
  return (
    <a
      href={routes.go(block.id)}
      className={cn(
        "ink-border press group flex items-center gap-4 rounded-md px-5 py-4",
        pinned ? "bg-accent text-accent-ink" : "bg-surface text-ink",
      )}
    >
      {block.image_url && (
        <Img src={block.image_url} className="ink-border size-16 shrink-0 rounded-sm object-cover" />
      )}
      <span className="min-w-0 flex-1">
        {pinned && (
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest opacity-80">
            Pinned
          </span>
        )}
        <span className="block truncate font-display text-xl font-bold">{block.title}</span>
        {block.body && <span className="mt-0.5 block text-sm opacity-80">{block.body}</span>}
        <span className="mt-1 block truncate font-mono text-xs opacity-70">{hostOf(block.url)}</span>
      </span>
      <span
        aria-hidden
        className="font-display text-2xl transition-transform duration-(--dur-base) group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  );
}
