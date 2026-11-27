import Link from "next/link";
import { Img } from "@/components/ui/Img";
import type {
  BibliaView,
  BibliaWideView,
  DesignFont,
  DesignIntroSize,
  DesignMode,
  DesignTitleAlign,
  DesignTitleSize,
  WritingSize,
} from "@/config/layout";
import type { BibliaBook, BibliaData } from "@/types/biblia";
import { BibliaCard, BibliaGrid } from "./BibliaGrid";
import { DesignHeading } from "./DesignHeading";
import { MediaSlider } from "./MediaSlider";
import { Reveal } from "./Reveal";

// Covers per row in the Grid layout.
const gridColumns: Record<WritingSize, string> = {
  small: "sm:grid-cols-3 lg:grid-cols-6",
  medium: "sm:grid-cols-3 lg:grid-cols-4",
  large: "sm:grid-cols-2 lg:grid-cols-3",
};

// Columns of the Row layout, by the number of books.
const rowColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-3 sm:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-6",
};

const two = (n: number) => String(n).padStart(2, "0");

function byline(book: BibliaBook): string {
  return `${book.authors.join(", ") || "Unknown author"}${book.year ? ` (${book.year})` : ""}`;
}

function Status({ book, className = "" }: { book: BibliaBook; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${className}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${book.available ? "bg-accent" : "border border-current"}`} />
      {book.available ? "Available" : "All out"}
    </span>
  );
}

// One book per row: a small cover, the big title, the author and year, and the status at the right.
function ListRows({ books }: { books: BibliaBook[] }) {
  return (
    <ul className="border-b border-line">
      {books.map((book, i) => (
        <li key={book.slug} className="border-t border-line">
          <Reveal delay={Math.min(i, 6) * 60}>
            <a
              href={book.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-1 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-x-8 sm:py-6"
            >
              <span className="row-span-2 block w-14 sm:row-span-1 sm:w-18">
                {book.cover ? (
                  <Img src={book.cover} alt={`Cover of ${book.title}`} className="aspect-2/3 w-full object-cover" />
                ) : (
                  <span className="block aspect-2/3 w-full bg-surface" />
                )}
              </span>
              <span className="block min-w-0">
                <span className="block font-display text-2xl leading-tight decoration-accent decoration-1 underline-offset-4 group-hover:underline sm:text-3xl">
                  {book.title}
                </span>
                <span className="mt-1 block line-clamp-1 text-sm text-ink-soft">{byline(book)}</span>
              </span>
              <span className="col-start-2 sm:col-auto sm:text-right">
                <Status book={book} className="text-ink-soft" />
              </span>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// One row of covers that slides by itself.
function Shelf({ books, seconds }: { books: BibliaBook[]; seconds: number }) {
  return (
    <MediaSlider count={books.length} seconds={seconds}>
      {books.map((book) => (
        <li key={book.slug} className="w-[44%] shrink-0 snap-start pt-1 sm:w-[30%] lg:w-[17%]">
          <Reveal variant="still">
            <BibliaCard book={book} />
          </Reveal>
        </li>
      ))}
    </MediaSlider>
  );
}

// Full width: all covers in one row, edge to edge. The title shows on hover (always on a phone).
function Row({ books }: { books: BibliaBook[] }) {
  return (
    <ul className={`grid gap-px ${rowColumns[Math.min(Math.max(books.length, 1), 6)]}`}>
      {books.map((book) => (
        <li key={book.slug} className="min-w-0">
          <Reveal variant="still">
            <a
              href={book.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden bg-surface"
            >
              {book.cover ? (
                <Img src={book.cover} alt={`Cover of ${book.title}`} className="aspect-2/3 w-full object-cover" />
              ) : (
                <span className="flex aspect-2/3 w-full items-end p-3 font-display text-xl leading-tight">
                  {book.title}
                </span>
              )}
              {book.cover && (
                <span
                  className="absolute inset-x-0 bottom-0 p-3 text-white transition-opacity duration-(--dur-base) sm:p-4 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
                  style={{ background: "linear-gradient(to top, rgb(0 0 0 / 0.7), transparent)" }}
                >
                  <span className="block font-display text-lg leading-tight">{book.title}</span>
                  <span className="mt-1 block line-clamp-1 text-xs opacity-80">{byline(book)}</span>
                </span>
              )}
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

// Full width: one book big at a time across the whole screen, its cover whole (never cropped), sliding by itself.
function Feature({ books, seconds }: { books: BibliaBook[]; seconds: number }) {
  return (
    <MediaSlider count={books.length} seconds={seconds} bleed>
      {books.map((book, i) => (
        <li key={book.slug} className="w-full shrink-0 snap-start">
          <a href={book.href} target="_blank" rel="noopener noreferrer" className="group grid md:grid-cols-2">
            <span className="flex items-center justify-center bg-surface px-5 py-10 sm:px-8 md:py-16">
              {book.cover ? (
                <Img
                  src={book.cover}
                  alt={`Cover of ${book.title}`}
                  className="h-88 w-auto max-w-full object-contain sm:h-112"
                />
              ) : (
                <span className="font-display text-4xl leading-tight">{book.title}</span>
              )}
            </span>
            <span className="flex flex-col justify-end px-5 py-8 sm:px-8 md:px-14 md:py-16">
              <span className="font-mono text-[11px] tracking-widest text-ink-soft">
                {two(i + 1)} / {two(books.length)}
              </span>
              <span className="mt-3 block font-display text-4xl leading-[1.05] decoration-accent decoration-1 underline-offset-4 group-hover:underline sm:text-5xl lg:text-6xl">
                {book.title}
              </span>
              <span className="mt-4 block text-ink-soft">{byline(book)}</span>
              <Status book={book} className="mt-4 text-ink-soft" />
              <span className="mt-6 font-mono text-xs uppercase tracking-widest">Open on Biblia &#8599;</span>
            </span>
          </a>
        </li>
      ))}
    </MediaSlider>
  );
}

type Props = {
  data: BibliaData;
  title: string;
  seeAll: string;
  // Seconds between slides (Shelf and Feature).
  seconds?: number;
  // Chosen in Customize (Sections, Biblia). Left out = the original: Centered, Grid.
  mode?: DesignMode;
  view?: BibliaView;
  wideView?: BibliaWideView;
  size?: WritingSize;
  // The text under the title (written in Pages) and the look of the title and of that text (Customize).
  intro?: string | null;
  titleAlign?: DesignTitleAlign;
  titleFont?: DesignFont;
  titleSize?: DesignTitleSize;
  introFont?: DesignFont;
  introSize?: DesignIntroSize;
};

const seeAllClass =
  "font-mono text-xs uppercase tracking-widest underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent";

// The Biblia section of Home: the newest book covers. It only appears when the library answered.
// Centered + Grid + the original title = exactly the look from before.
export function HomeBiblia({
  data,
  title,
  seeAll,
  seconds = 5,
  mode = "centered",
  view = "grid",
  wideView = "row",
  size = "small",
  intro = null,
  titleAlign = "center",
  titleFont = "default",
  titleSize = "auto",
  introFont = "default",
  introSize = "auto",
}: Props) {
  if (data.books.length === 0) return null;
  const books = data.books;
  const wide = mode === "full";
  const custom = titleAlign !== "center" || titleFont !== "default" || titleSize !== "auto" || Boolean(intro);

  const body = wide ? (
    <div className="site-pb">
      {wideView === "feature" ? <Feature books={books} seconds={seconds} /> : <Row books={books} />}
    </div>
  ) : view === "shelf" ? (
    <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8 site-pb">
      <Shelf books={books} seconds={seconds} />
    </div>
  ) : view === "list" ? (
    <div className="mx-auto max-w-5xl px-5 pt-4 sm:px-8 site-pb">
      <ListRows books={books} />
    </div>
  ) : (
    <BibliaGrid books={books} bottom="site-pb" columns={gridColumns[size]} />
  );

  if (!wide && !custom) {
    return (
      <section id="biblia" aria-label={title} className="site-pt">
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-5 pb-8 sm:px-8">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-70">{title}</h2>
          </Reveal>
          <Link href={seeAll} className={seeAllClass}>
            See all {data.titles} →
          </Link>
        </div>
        {body}
      </section>
    );
  }

  return (
    <section id="biblia" aria-label={title} className="site-pt">
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
      <div className={`-mt-4 px-5 pb-6 text-right sm:px-8 ${wide ? "" : "mx-auto max-w-5xl"}`}>
        <Link href={seeAll} className={seeAllClass}>
          See all {data.titles} →
        </Link>
      </div>
      {body}
    </section>
  );
}