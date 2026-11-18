import type { Block } from "@/types/block";

export function HeaderBlock({ block }: { block: Block }) {
  return (
    <h2 className="border-b-2 border-line pb-1 pt-4 font-mono text-sm uppercase tracking-widest">
      {block.title}
    </h2>
  );
}