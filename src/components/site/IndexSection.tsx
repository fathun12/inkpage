import { Img } from "@/components/ui/Img";
import { routes } from "@/config/site";
import { mediaKind } from "@/lib/site-view";
import type { Block } from "@/types/block";
import { Credit } from "./Credit";
import { Reveal } from "./Reveal";

type Props = { blocks: Block[]; mediaUrl: string | null; tone?: "dark" | "light"; credit?: string | null };

function hostOf(url: string | null): string {
  try {
    return new URL(url ?? "").host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Nexus Mods, GitHub releases and plain files count as downloads.
function isDownload(url: string | null): boolean {
  try {
    const u = new URL(url ?? "");
    return (
      /(^|\.)nexusmods\.com$/i.test(u.hostname) ||
      (u.hostname === "github.com" && u.pathname.includes("/releases")) ||
      /\.(zip|rar|7z|exe|apk)$/i.test(u.pathname)
    );
  } catch {
    return false;
  }
}

const rowClass = "group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 py-6";

// The list of links: thin lines and big titles, no panels. Dark = over a media. Light = on its own page.
export function IndexSection({ blocks, mediaUrl, tone = "dark", credit }: Props) {
  const dark = tone === "dark";
  const items = blocks.reduce<{ block: Block; number: number | null }[]>((list, block) => {
    const counted = list.filter((item) => item.number !== null).length;
    list.push({ block, number: block.type === "header" ? null : counted + 1 });
    return list;
  }, []);

  return (
    <section id="work" className={`${dark ? "site-index" : "site-index-light"} relative overflow-hidden`}>
      {dark && mediaUrl && (
        <>
          <Reveal variant="still" className="absolute inset-0">
            {mediaKind(mediaUrl) === "video" ? (
              <video
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
                className="site-media-reveal site-index-media size-full object-cover"
              />
            ) : (
              <Img src={mediaUrl} className="site-media-reveal site-index-media size-full object-cover" />
            )}
          </Reveal>
          <div aria-hidden className="site-index-veil absolute inset-0" />
          <Credit text={credit} />
        </>
      )}
      <ul
        className={`relative mx-auto flex max-w-5xl flex-col px-5 sm:px-8 ${dark ? "py-20 sm:py-28" : "pb-24 pt-4"}`}
      >
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

          const download = isDownload(block.url);
          const content = (
            <>
              <span className="text-sm font-medium text-accent">{number}</span>
              <span className="min-w-0">
                {!dark && block.image_url && (
                  <Img src={block.image_url} className="mb-4 aspect-video w-full max-w-lg object-cover" />
                )}
                <span className="block font-display text-3xl leading-tight transition-transform duration-(--dur-base) group-hover:translate-x-2 sm:text-5xl">
                  {block.title}
                </span>
                {block.body && <span className="mt-2 block max-w-xl text-sm opacity-70">{block.body}</span>}
              </span>
              <span className="flex items-baseline gap-4">
                <span className="hidden font-mono text-xs opacity-60 sm:block">
                  {download ? `Download · ${hostOf(block.url)}` : hostOf(block.url)}
                </span>
                <span
                  aria-hidden
                  className="font-display text-2xl transition-transform duration-(--dur-base) group-hover:translate-x-1 group-hover:-translate-y-1"
                >
                  {download ? "↓" : "↗"}
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