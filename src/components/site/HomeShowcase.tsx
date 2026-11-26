import type {
  DesignFont,
  DesignIntroSize,
  DesignMode,
  DesignTitleAlign,
  DesignTitleSize,
  ShowcaseSize,
  ShowcaseView,
  ShowcaseWideView,
} from "@/config/layout";
import type { Block } from "@/types/block";
import { DesignHeading } from "./DesignHeading";
import { MediaSlider } from "./MediaSlider";
import { ShowcaseCard } from "./ShowcaseCard";
import { ShowcaseWide } from "./ShowcaseWide";

// Cards per row in the Grid layout. Large is two per row on a wide screen.
const gridColumns: Record<ShowcaseSize, string> = {
  large: "sm:grid-cols-2",
  medium: "sm:grid-cols-2 lg:grid-cols-3",
  small: "sm:grid-cols-2 lg:grid-cols-4",
};

type Props = {
  items: Block[];
  title: string;
  // Chosen in Customize (Sections, Showcase). Left out = the original: Centered, List, Large, Auto.
  mode?: DesignMode;
  view?: ShowcaseView;
  wideView?: ShowcaseWideView;
  size?: ShowcaseSize;
  // Height of the main media in rem. 0 = the shape of each file.
  mediaHeight?: number;
  // The slider layouts slide by themselves with these.
  slide?: { seconds: number; autoplay: boolean };
  // The text under the title (written in Pages) and the look of the title and of that text (Customize).
  intro?: string | null;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

// The detailed section of Home: projects ticked "Show as Showcase". It only appears when there is one.
// Centered = inside the page margins (List, Grid, Slider). Full width = edge to edge (ShowcaseWide).
export function HomeShowcase({
  items,
  title,
  mode = "centered",
  view = "list",
  wideView = "stack",
  size = "large",
  mediaHeight = 0,
  slide,
  intro = null,
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  if (items.length === 0) return null;
  const run = slide ?? { seconds: 5, autoplay: true };
  const wide = mode === "full";
  return (
    <section id="showcase" aria-label={title} className="site-pt">
      <DesignHeading
        title={title}
        href={null}
        intro={intro}
        align={titleAlign}
        font={titleFont}
        size={titleSize}
        introFont={introFont}
        introSize={introSize}
      />

      {wide && (
        <div className="site-pb">
          <ShowcaseWide view={wideView} blocks={items} height={mediaHeight} slide={run} />
        </div>
      )}

      {!wide && view === "list" && (
        <ul className="mx-auto flex max-w-5xl flex-col gap-24 px-5 pt-4 sm:gap-32 sm:px-8 site-pb">
          {items.map((block, index) => (
            <li key={block.id}>
              <ShowcaseCard block={block} first={index === 0} size={size} mediaHeight={mediaHeight} />
            </li>
          ))}
        </ul>
      )}

      {!wide && view === "grid" && (
        <ul className={`mx-auto grid max-w-5xl gap-x-8 gap-y-16 px-5 pt-4 sm:px-8 site-pb ${gridColumns[size]}`}>
          {items.map((block, index) => (
            <li key={block.id}>
              <ShowcaseCard
                block={block}
                first={index === 0}
                layout="stacked"
                size={size}
                mediaHeight={mediaHeight}
              />
            </li>
          ))}
        </ul>
      )}

      {!wide && view === "slider" && (
        <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8 site-pb">
          <MediaSlider count={items.length} seconds={run.seconds} autoplay={run.autoplay}>
            {items.map((block, index) => (
              <li key={block.id} className="w-full shrink-0 snap-start">
                <ShowcaseCard block={block} first={index === 0} size={size} mediaHeight={mediaHeight} />
              </li>
            ))}
          </MediaSlider>
        </div>
      )}
    </section>
  );
}