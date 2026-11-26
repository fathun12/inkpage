import { showcaseLayout } from "@/config/item-data";
import { routes } from "@/config/site";
import { pickShowcase, readProjectItem } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { Downloads, TextLinks } from "./Downloads";
import { ItemMedia } from "./ProjectCard";
import { Reveal } from "./Reveal";

// Static class names, so Tailwind can see them.
const photoColumns = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3"] as const;

// One Showcase item. Main media (GIF, video or first file) on the left, text and buttons on the right.
// Below: up to 3 documentation photos side by side. On a phone: main, text, then the photos.
export function ShowcaseCard({ block, first = false }: { block: Block; first?: boolean }) {
  const item = readProjectItem(block);
  const { main, photos } = pickShowcase(item.files);

  const title = (
    <h3 className="font-display text-3xl leading-tight sm:text-5xl">
      <span className="site-sweep">{item.title}</span>
    </h3>
  );

  return (
    <div className="flex flex-col gap-10">
      <div className={main ? `grid gap-8 ${showcaseLayout.grid}` : "grid"}>
        {main && (
          <Reveal variant="still" className="self-start">
            <ItemMedia file={main} eager={first} />
          </Reveal>
        )}
        <Reveal delay={100} className="flex flex-col justify-center">
          {item.url ? (
            <a href={routes.go(block.id)} className="block">
              {title}
            </a>
          ) : (
            title
          )}
          {item.body && <p className="mt-5 max-w-xl whitespace-pre-line text-ink-soft">{item.body}</p>}
          <Downloads links={item.downloads} className="mt-7" />
          <TextLinks links={item.links} className="mt-4" />
        </Reveal>
      </div>
      {photos.length > 0 && (
        <Reveal variant="still">
          <ul className={`grid items-start gap-3 ${photoColumns[photos.length]}`}>
            {photos.map((file, i) => (
              <li key={file.url}>
                <ItemMedia file={file} eager={false} index={i} />
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  );
}