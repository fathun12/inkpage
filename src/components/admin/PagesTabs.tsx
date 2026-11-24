import Link from "next/link";
import { pagesTabLabels, pagesTabs, tabHref, type PagesTab } from "@/config/item-data";
import { cn } from "@/lib/utils";

// The tabs of the Pages screen. Each tab is its own address (?tab=), so the server draws only that tab.
export function PagesTabs({ current }: { current: PagesTab }) {
  return (
    <nav aria-label="Pages sections" className="flex flex-wrap gap-1 border-b border-line pb-3">
      {pagesTabs.map((tab) => (
        <Link
          key={tab}
          href={tabHref(tab)}
          aria-current={tab === current ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 font-mono text-sm uppercase tracking-wider",
            tab === current ? "bg-ink text-bg" : "text-ink-soft hover:text-ink",
          )}
        >
          {pagesTabLabels[tab]}
        </Link>
      ))}
    </nav>
  );
}