import type { CSSProperties } from "react";
import Link from "next/link";
import { Img } from "@/components/ui/Img";
import {
  stackAspect,
  type ArticleView,
  type ArticleWideView,
  type DesignFont,
  type DesignIntroSize,
  type DesignMode,
  type DesignTitleAlign,
  type DesignTitleSize,
  type StackRatio,
  type WritingSize,
} from "@/config/layout";
import { routes } from "@/config/site";
import { formatArticleDate } from "@/lib/article-doc";
import { storageImage } from "@/lib/image-srcset";
import type { ArticleSummary } from "@/types/article";
import { ArticleList } from "./ArticleList";
import { DesignHeading } from "./DesignHeading";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";

type Entry = ArticleSummary & { slug: string };

// Cards per row in the Grid layout.
const gridColumns: Record<WritingSize, string> = {
  large: "sm:grid-cols-2",
  medium: "sm:grid-cols-2 lg:grid-cols-3",
  small: "sm:grid-cols-2 lg:grid-cols-4",
};

const GRID_SIZES = "(min-width: 1024px) 24rem, (min-width: 640px) 45vw, calc(100vw - 2.5rem)";
const WIDE_SIZES = "100vw";
const LEAD_SIZES = "(min-width: 768px) 50vw, 100vw";

type Props = {
  articles: ArticleSummary[];
  username: string;
  title: string;
  // The card slider sits right above, so this section sits close to it (one section to the eye).
  joined?: boolean;
  // Chosen in Customize (Sections, Articles). Left out = the original: Centered, List.
  mode?: DesignMode;
  view?: ArticleView;
  wideView?: ArticleWideView;
  size?: WritingSize;
  // Height of the Stack photo in rem. 0 = Auto (16:9, or the Ratio).
  mediaHeight?: number;
  stackRatio?: StackRatio;
  stackCrop?: number;
  // Seconds between slides (Stack slide).
  seconds?: number;
  intro?: string | null;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

function metaOf(article: Entry): string {
  return [formatArticleDate(article.published_at), `${article.reading_minutes} min read`]
    .filter(Boolean)
    .join(" \u00b7 ");
}

const two = (n: number) => String(n).padStart(2, "0");

// The frame of the Stack photo. Default = a fixed height or 16:9. Another ratio sets the shape; crop (0 top to
// 100 bottom) is which part of the photo shows (--crop is read by the photo as object-position).
function stackFrame(height: number, ratio: StackRatio, crop: number): CSSProperties {
  if (ratio === "default") return height > 0 ? { height: `${height}rem` } : { aspectRatio: "16 / 9" };
  const style: Record<string, string> = { aspectRatio: stackAspect[ratio] };
  if (ratio !== "normal") style["--crop"] = `50% ${crop}%`;
  return style as CSSProperties;
}

// Only type: a number, the big title, and the date at the right. Like the contents page of a book.
function IndexRows({ entries, username, start = 1 }: { entries: Entry[]; username: string; start?: number }) {
  return (
    <ul className="border-b border-line">
      {entries.map((article, i) => {
        const lead = article.subtitle ?? article.excerpt;
        return (
          <li key={article.id} className="border-t border-line">
            <Reveal delay={Math.min(i, 6) * 60}>
              <Link
                href={routes.article(username, article.slug)}
                className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-1 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-8"
              >
                <span className="pt-2 font-mono text-[11px] tracking-widest text-ink-soft">{two(start + i)}</span>
                <span className="block min-w-0">
                  <span className="block font-display text-2xl leading-tight decoration-accent decoration-1 underline-offset-4 group-hover:underline sm:text-4xl">
                    {article.title}
                  </span>
                  {lead && <span className="mt-2 line-clamp-2 block max-w-xl text-sm text-ink-soft">{lead}</span>}
                </span>
                <span className="col-start-2 pt-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft sm:col-auto sm:pt-2 sm:text-right">
                  {metaOf(article)}
                </span>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

// Cards side by side: cover on top, title and text below. An article without a cover gets a tinted box.
function GridCards({ entries, username, size }: { entries: Entry[]; username: string; size: WritingSize }) {
  return (
    <ul className={`mx-auto grid max-w-5xl gap-x-8 gap-y-12 px-5 sm:px-8 ${gridColumns[size]}`}>
      {entries.map((article, i) => {
        const cover = article.cover_url;
        const lead = article.subtitle ?? article.excerpt;
        return (
          <li key={article.id}>
            <Reveal delay={Math.min(i, 4) * 80}>
              <Link href={routes.article(username, article.slug)} className="group block hover:opacity-80">
                {cover ? (
                  <Img
                    src={cover}
                    {...storageImage(cover, GRID_SIZES)}
                    className="aspect-16/10 w-full bg-surface object-cover"
                  />
                ) : (
                  <span className="flex aspect-16/10 w-full items-end bg-surface p-4 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                    {metaOf(article)}
                  </span>
                )}
                {cover && (
                  <span className="mt-4 block font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                    {metaOf(article)}
                  </span>
                )}
                <span className={`${cover ? "mt-1" : "mt-4"} block font-display text-2xl leading-tight`}>
                  {article.title}
                </span>
                {lead && <span className="mt-2 line-clamp-3 block text-sm text-ink-soft">{lead}</span>}
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

// One article per row: ONE cover across the whole screen, then the title at the left and the date and text at the
// right. An article without a cover shows its title big on a tinted box (and the title is not repeated under it).
// With "slide" (Stack slide): the same, one article per screen, sliding by itself.
function Stack({
  entries,
  username,
  height,
  ratio,
  crop,
  slide,
}: {
  entries: Entry[];
  username: string;
  height: number;
  ratio: StackRatio;
  crop: number;
  slide?: { seconds: number };
}) {
  const rows = entries.map((article, i) => {
    const cover = article.cover_url;
    const lead = article.subtitle ?? article.excerpt;
    return (
      <li key={article.id} className={slide ? "w-full shrink-0" : undefined}>
        <Link href={routes.article(username, article.slug)} className="group block">
          <Reveal variant="still">
            <div className="relative w-full overflow-hidden bg-surface" style={stackFrame(height, ratio, crop)}>
              {cover ? (
                <Img
                  src={cover}
                  {...storageImage(cover, WIDE_SIZES)}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 size-full object-cover object-(--crop,50%_50%)"
                />
              ) : (
                <span className="absolute inset-0 flex items-end px-5 pb-6 font-display text-4xl leading-tight sm:px-8 sm:pb-10 sm:text-6xl">
                  {article.title}
                </span>
              )}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-6 grid gap-5 px-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-12">
              {cover ? (
                <span className="block font-display text-3xl leading-tight decoration-accent decoration-1 underline-offset-4 group-hover:underline sm:text-5xl">
                  {article.title}
                </span>
              ) : (
                <span />
              )}
              <span className="block">
                <span className="block font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  {metaOf(article)}
                </span>
                {lead && <span className="mt-3 block max-w-xl text-ink-soft">{lead}</span>}
              </span>
            </div>
          </Reveal>
        </Link>
      </li>
    );
  });
  if (slide) {
    return (
      <MediaSlider count={entries.length} seconds={slide.seconds} bleed>
        {rows}
      </MediaSlider>
    );
  }
  return <ul className="flex flex-col gap-16 sm:gap-28">{rows}</ul>;
}

// Like the front page of a magazine: the newest article big, its cover touching the left edge of the screen, and
// the others as a numbered list below it.
function Lead({ entries, username }: { entries: Entry[]; username: string }) {
  const [first, ...rest] = entries;
  if (!first) return null;
  const cover = first.cover_url;
  const lead = first.subtitle ?? first.excerpt;
  return (
    <div>
      <Reveal variant="still">
        <Link href={routes.article(username, first.slug)} className="group grid md:grid-cols-2 md:items-stretch">
          <span className="relative block aspect-4/3 w-full bg-surface md:aspect-auto md:min-h-120">
            {cover && (
              <Img
                src={cover}
                {...storageImage(cover, LEAD_SIZES)}
                loading="eager"
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </span>
          <span className="flex flex-col justify-end px-5 py-8 sm:px-8 md:py-12">
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{metaOf(first)}</span>
            <span className="mt-3 block font-display text-4xl leading-[1.05] decoration-accent decoration-1 underline-offset-4 group-hover:underline sm:text-5xl lg:text-6xl">
              {first.title}
            </span>
            {lead && <span className="mt-4 block max-w-md text-ink-soft">{lead}</span>}
            <span className="mt-6 font-mono text-xs uppercase tracking-widest">Read &rarr;</span>
          </span>
        </Link>
      </Reveal>
      {rest.length > 0 && (
        <div className="mt-10 px-5 sm:px-8">
          <IndexRows entries={rest} username={username} start={2} />
        </div>
      )}
    </div>
  );
}

// The newest articles written inside the site, with a link to all of them (the Articles page).
// Centered + List = the original. The other layouts draw the title with DesignHeading, like Showcase.
export function HomeArticles({
  articles,
  username,
  title,
  joined = false,
  mode = "centered",
  view = "list",
  wideView = "stack",
  size = "medium",
  mediaHeight = 0,
  stackRatio = "default",
  stackCrop = 50,
  seconds = 6,
  intro = null,
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  const wide = mode === "full";
  const original = !wide && view === "list";
  const all = articles.filter((article): article is Entry => Boolean(article.slug));
  const shown = all.slice(0, original ? 3 : 6);
  if (shown.length === 0) return null;

  const custom = titleAlign !== "center" || titleFont !== "default" || titleSize !== "auto" || Boolean(intro);
  const top = joined ? undefined : "site-pt";

  // The original: the small label at the left and the link at the right, then the list.
  if (original && !custom) {
    return (
      <section id="articles" aria-label={title} className={top}>
        <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-5 pb-4 sm:px-8">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
          </Reveal>
          <Link
            href={routes.section(username, "articles")}
            className="font-mono text-xs uppercase tracking-widest hover:opacity-70"
          >
            More articles &rarr;
          </Link>
        </div>
        <ArticleList articles={shown} username={username} covers />
      </section>
    );
  }

  const heading = (
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
  );
  const more = (
    <div className={`-mt-4 px-5 pb-6 text-right sm:px-8 ${wide ? "" : "mx-auto max-w-5xl"}`}>
      <Link
        href={routes.section(username, "articles")}
        className="font-mono text-xs uppercase tracking-widest hover:opacity-70"
      >
        More articles &rarr;
      </Link>
    </div>
  );

  if (original) {
    return (
      <section id="articles" aria-label={title} className={top}>
        {heading}
        {more}
        <ArticleList articles={shown} username={username} covers />
      </section>
    );
  }

  return (
    <section id="articles" aria-label={title} className={`${top ? `${top} ` : ""}site-pb-m`}>
      {heading}
      {more}
      {wide && wideView === "lead" && <Lead entries={shown} username={username} />}
      {wide && wideView === "stackslide" && (
        <Stack
          entries={shown}
          username={username}
          height={mediaHeight}
          ratio={stackRatio}
          crop={stackCrop}
          slide={{ seconds }}
        />
      )}
      {wide && wideView === "stack" && (
        <Stack entries={shown} username={username} height={mediaHeight} ratio={stackRatio} crop={stackCrop} />
      )}
      {!wide && view === "index" && (
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <IndexRows entries={shown} username={username} />
        </div>
      )}
      {!wide && view === "grid" && <GridCards entries={shown} username={username} size={size} />}
    </section>
  );
}