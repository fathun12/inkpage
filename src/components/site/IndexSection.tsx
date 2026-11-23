import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import type { Block } from "@/types/block";
import { Reveal } from "./Reveal";

type Props = { blocks: Block[]; mediaUrl: string | null };

function hostOf(url: string | null): string {
  try {
    return new URL(url ?? "").host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const rowClass = "group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 py-6";

// Media edge to edge, with the list of links on top of it. No panels: thin lines only.
export function IndexSection({ blocks, mediaUrl }: Props) {
  const items = blocks.reduce<{ block: Block; number: number | null }[]>((list, block) => {
    const counted = list.filter((item) => item.number !== null).length;
    list.push({ block, number: block.type === "header" ? null : counted + 1 });
    return list;
  }, []);

  return (
    <section id="work" className="site-index relative scroll-mt-[3.75rem] overflow-hidden">
      {mediaUrl && (
        <>
          <Reveal variant="still" className="absolute inset-0">
            <Img src={mediaUrl} className="site-media-reveal size-full object-cover" />
          </Reveal>
          <div aria-hidden className="site-index-veil absolute inset-0" />
        </>
      )}
      <ul className="relative mx-auto flex max-w-5xl flex-col px-5 py-20 sm:px-8 sm:py-28">
        {items.map(({ block, number }, index) => {
          if (number === null) {
            return (
              <li key={block.id} className="pb-3 pt-12 first:pt-0">
                <Reveal>
                  <p className="font-mono text-xs opacity-70">{block.title}</p>
                </Reveal>
              </li>
            );
          }

          const content = (
            <>
              <span className="font-mono text-xs text-accent">{String(number).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block font-display text-3xl leading-tight transition-transform duration-(--dur-base) group-hover:translate-x-2 sm:text-5xl">
                  {block.title}
                </span>
                {block.body && <span className="mt-2 block max-w-xl text-sm opacity-70">{block.body}</span>}
              </span>
              <span className="flex items-baseline gap-4">
                <span className="hidden font-mono text-xs opacity-60 sm:block">{hostOf(block.url)}</span>
                <span
                  aria-hidden
                  className="font-display text-2xl transition-transform duration-(--dur-base) group-hover:-translate-y-1 group-hover:translate-x-1"
                >
                  ↗
                </span>
              </span>
            </>
          );

          return (
            <li key={block.id}>
              <Reveal delay={Math.min(index, 8) * 70} className="relative">
                <span aria-hidden className="site-line" />
                {block.url ? (
                  <a href={routes.go(block.id)} className={rowClass}>
                    {content}
                  </a>
                ) : (
                  <div className={rowClass}>{content}</div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}