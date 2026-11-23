"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { brand: string; home: string; items: { label: string; href: string }[] };

// The brand is the username. The menu only lists pages that have content.
export function SiteHeader({ brand, home, items }: Props) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-[3.75rem] items-center justify-between gap-4 border-b border-line bg-bg px-5 sm:px-8">
      <Link href={home} className="font-voice text-2xl leading-none">
        {brand}
      </Link>
      {items.length > 1 && (
        <nav aria-label="Pages" className="flex gap-5 text-sm sm:gap-6">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b pb-0.5 transition-colors duration-(--dur-base) ${
                  active ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}