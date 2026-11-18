import type { Block } from "@/types/block";
import { CountdownBlock } from "./CountdownBlock";
import { EmbedBlock } from "./EmbedBlock";
import { GalleryBlock } from "./GalleryBlock";
import { HeaderBlock } from "./HeaderBlock";
import { LinkBlock } from "./LinkBlock";
import { ProjectBlock } from "./ProjectBlock";
import { SocialsBlock } from "./SocialsBlock";
import { TextBlock } from "./TextBlock";

function renderBlock(block: Block) {
  switch (block.type) {
    case "link":
      return <LinkBlock block={block} />;
    case "header":
      return <HeaderBlock block={block} />;
    case "text":
      return <TextBlock block={block} />;
    case "project":
      return <ProjectBlock block={block} />;
    case "embed":
      return <EmbedBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "socials":
      return <SocialsBlock block={block} />;
    case "countdown":
      return block.data.target ? <CountdownBlock title={block.title} target={block.data.target} /> : null;
    default:
      return null;
  }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return <p className="text-center font-mono text-sm text-ink-soft">Nothing here yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-4">
      {blocks.map((block, index) => (
        <li key={block.id} className="animate-rise" style={{ animationDelay: `${index * 60}ms` }}>
          {renderBlock(block)}
        </li>
      ))}
    </ul>
  );
}
