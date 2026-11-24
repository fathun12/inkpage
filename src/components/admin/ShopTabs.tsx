import Link from "next/link";
import { shopHref, shopTabLabels, shopTabs, type ShopTab } from "@/config/shop";
import { cn } from "@/lib/utils";

export function ShopTabs({ current }: { current: ShopTab }) {
  return (
    <nav aria-label="Shop sections" className="flex gap-1 border-b border-line">
      {shopTabs.map((tab) => (
        <Link
          key={tab}
          href={shopHref(tab)}
          aria-current={tab === current ? "page" : undefined}
          className={cn(
            "-mb-px border-b px-3 py-2 font-mono text-xs uppercase tracking-widest",
            tab === current ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink",
          )}
        >
          {shopTabLabels[tab]}
        </Link>
      ))}
    </nav>
  );
}