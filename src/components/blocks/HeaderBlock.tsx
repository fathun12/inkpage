import type { Block } from "@/types/block";

export function HeaderBlock({ block }: { block: Block }) {
  return (
    <h2 className="border-b border-line pb-1 pt-4 font-body text-sm font-medium text-ink-soft">
      {block.title}
    </h2>
  );
}