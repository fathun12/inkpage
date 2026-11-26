import { showcaseLayout } from "@/config/item-data";
import type { ShowcaseSize } from "@/config/layout";
import { routes } from "@/config/site";
import { pickShowcase, readProjectItem } from "@/lib/item-data";
import type { Block } from "@/types/block";
import { Downloads, TextLinks } from "./Downloads";
import { ItemMedia } from "./ProjectCard";
import { Reveal } from "./Reveal";

// Static class names, so Tailwind can see them.
const photoColumns = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3"] as const;

// Row layout (List and Slider): main media on the left, text on the right. Size sets the columns and the title.
const rowGrid: Record<ShowcaseSize, string> = {
  large: showcaseLayout.grid,
  medium: "md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]",
  small: "md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]",
};
const rowTitle: Record<ShowcaseSize, string> = {
  large: "text-3xl sm:text-5xl",
  medium: "text-2xl sm:text-4xl",
  small: "text-xl sm:text-3xl",
};
const stackedTitle: Record<ShowcaseSize, string> = {
  large: "text-2xl sm:text-4xl",
  medium: "text-xl sm:text-3xl",
  small: "text-lg sm:text-2xl",
};

// One Showcase item. "row" (the original): main media (GIF, video or first file) on the left, text and buttons on
// the right, then up to 3 documentation photos side by side. On a phone: main, text, then the photos.
// "stacked" (the Grid): main media on top, text below, no documentation photos. mediaHeight in rem (0 = the
// shape of the file).
export function ShowcaseCard({
  block,
  first = false,
  layout = "row",
  size = "large",
  mediaHeight = 0,
}: {
  block: Block;
  first?: boolean;
  layout?: "row" | "stacked";
  size?: ShowcaseSize;
  mediaHeight?: number;
}) {
  const item = readProjectItem(block);
  const { main, photos } = pickShowcase(item.files);
  const row = layout === "row";
  const height = mediaHeight > 0 ? mediaHeight : undefined;

  const title = (
    <h3 className={`font-display leading-tight ${row ? rowTitle[size] : stackedTitle[size]}`}>
      <span className="site-sweep">{item.title}</span>
    </h3>
  );
  const heading = item.url ? (
    <a href={routes.go(block.id)} className="block">
      {title}
    </a>
  ) : (
    title
  );

  if (!row) {
    return (
      <div className="flex flex-col gap-6">
        {main && (
          <Reveal variant="still">
            <ItemMedia file={main} eager={first} height={height} />
          </Reveal>
        )}
        <Reveal delay={100} className="flex flex-col">
          {heading}
          {item.body && <p className="mt-4 whitespace-pre-line text-ink-soft">{item.body}</p>}
          <Downloads links={item.downloads} className="mt-6" />
          <TextLinks links={item.links} className="mt-4" />
        </Reveal>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className={main ? `grid gap-8 ${rowGrid[size]}` : "grid"}>
        {main && (
          <Reveal variant="still" className="self-start">
            <ItemMedia file={main} eager={first} height={height} />
          </Reveal>
        )}
        <Reveal delay={100} className="flex flex-col justify-center">
          {heading}
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