import Link from "next/link";

type Props = { query: string; count: number; clearHref: string };

// The line above the results: what was searched, how many results, and a way back.
export function SearchStatus({ query, count, clearHref }: Props) {
  return (
    <p className="mx-auto max-w-5xl px-5 pb-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft sm:px-8">
      Results for{" "}
      <span className="normal-case tracking-normal">
        {"\u201c"}
        {query}
        {"\u201d"}
      </span>{" "}
      · {count} {count === 1 ? "result" : "results"} ·{" "}
      <Link href={clearHref} className="underline underline-offset-4 hover:text-ink">
        Clear
      </Link>
    </p>
  );
}