import { Img } from "@/components/ui/Img";
import type { BibliaBook } from "@/types/biblia";
import { Reveal } from "./Reveal";

// One book as a cover card. It opens the book page on Biblia in a new tab.
export function BibliaCard({ book }: { book: BibliaBook }) {
  const by = `${book.authors.join(", ") || "Unknown author"}${book.year ? ` (${book.year})` : ""}`;
  return (
    <a href={book.href} target="_blank" rel="noopener noreferrer" className="group block">
      <span className="relative block overflow-hidden transition-transform duration-(--dur-base) group-hover:-translate-y-1">
        {book.cover ? (
          <Img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className="site-media-reveal aspect-[2/3] w-full object-cover"
          />
        ) : (
          <span className="flex aspect-[2/3] w-full items-end bg-surface p-3 font-display text-xl leading-tight">
            {book.title}
          </span>
        )}
        <span className="absolute right-2 top-2 inline-flex items-center gap-1.5 bg-bg px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">
          <span aria-hidden className={`size-1.5 rounded-full ${book.available ? "bg-accent" : "border border-ink"}`} />
          {book.available ? "Available" : "All out"}
        </span>
      </span>
      <span className="mt-3 block font-display text-lg leading-tight underline-offset-4 group-hover:underline">
        {book.title}
      </span>
      <span className="mt-1 block line-clamp-1 text-sm text-ink-soft">{by}</span>
    </a>
  );
}

// The book covers in a grid: 2 columns on a phone, 3 on a tablet, 6 on a wide screen.
export function BibliaGrid({
  books,
  bottom,
  columns = "sm:grid-cols-3 lg:grid-cols-6",
}: {
  books: BibliaBook[];
  bottom: string;
  columns?: string;
}) {
  return (
    <ul className={`mx-auto grid max-w-5xl grid-cols-2 gap-x-5 gap-y-10 px-5 sm:px-8 ${columns} ${bottom}`}>
      {books.map((book) => (
        <li key={book.slug}>
          <Reveal variant="still">
            <BibliaCard book={book} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}