import Link from "next/link";

type Props = { base: string; page: number; pages: number; label: string };

const cell =
  "border border-line px-3 py-1 font-mono text-sm transition-colors duration-(--dur-base) hover:border-ink";

function at(base: string, page: number): string {
  return page <= 1 ? base : `${base}?page=${page}`;
}

// The numbers shown: first, last, the current one and its two neighbours. A gap between them shows as "...".
function shown(page: number, pages: number): Array<number | "gap"> {
  const wanted = [1, page - 1, page, page + 1, pages].filter((n) => n >= 1 && n <= pages);
  const list = [...new Set(wanted)].sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  list.forEach((n, i) => {
    if (i > 0 && n - list[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

// Page links under a list. Plain links (no JavaScript), so search engines can follow them. Page 1 is the newest.
export function Pager({ base, page, pages, label }: Props) {
  if (pages <= 1) return null;
  return (
    <nav aria-label={label} className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 pb-24 sm:px-8">
      {page > 1 && (
        <Link href={at(base, page - 1)} rel="prev" className={cell}>
          {"\u2190"} Newer
        </Link>
      )}
      {shown(page, pages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 font-mono text-sm text-ink-soft">
            {"\u2026"}
          </span>
        ) : n === page ? (
          <span key={n} aria-current="page" className="border border-ink px-3 py-1 font-mono text-sm font-semibold">
            {n}
          </span>
        ) : (
          <Link key={n} href={at(base, n)} className={cell}>
            {n}
          </Link>
        ),
      )}
      {page < pages && (
        <Link href={at(base, page + 1)} rel="next" className={cell}>
          Older {"\u2192"}
        </Link>
      )}
    </nav>
  );
}