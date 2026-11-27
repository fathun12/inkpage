import { searchLimits } from "@/config/search";

type Props = { id: string; value: string | null; placeholder: string; label: string };

// One line with only an underline. A plain GET form (no JavaScript): the search goes to the same page as ?q=...
export function SearchBox({ id, value, placeholder, label }: Props) {
  return (
    <form method="get" role="search" className="mx-auto max-w-5xl px-5 pb-6 sm:px-8">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-baseline gap-4 border-b border-line focus-within:border-ink">
        <input
          id={id}
          type="search"
          name="q"
          defaultValue={value ?? ""}
          placeholder={placeholder}
          maxLength={searchLimits.maxChars}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-ink-soft"
        />
        <button
          type="submit"
          className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink"
        >
          Search
        </button>
      </div>
    </form>
  );
}