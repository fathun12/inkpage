import type { Block } from "@/types/block";

export function TextBlock({ block }: { block: Block }) {
  return (
    <div className="border-l-4 border-accent pl-4">
      <p className="font-display text-lg font-bold">{block.title}</p>
      <p className="mt-1 whitespace-pre-line text-ink-soft">{block.body}</p>
    </div>
  );
}