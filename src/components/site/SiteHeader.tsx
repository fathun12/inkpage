"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  brand: string;
  home: string;
  items: { label: string; href: string }[];
  // The Customize preview sets this (its address is not the Home address).
  overlay?: boolean;
};

// The brand is the username. On Home, at the very top of the page, the bar is transparent over the hero
// and the brand is big. Scrolling down makes it a normal bar again. Other pages always use the normal bar.
export function SiteHeader({ brand, home, items, overlay }: Props) {
  const pathname = usePathname();
  const onHome = overlay ?? pathname === home;
  const sentinel = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(true);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !onHome || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setTop(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHome]);

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute left-0 top-0 h-10 w-px" />
      <header
        className="site-header"
        data-overlay={onHome ? "" : undefined}
        data-top={onHome && top ? "" : undefined}
      >
        <Link href={home} className="site-brand font-voice">
          {brand}
        </Link>
        {items.length > 1 && (
          <nav aria-label="Pages" className="site-nav">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b pb-0.5 transition-opacity duration-(--dur-base) ${
                    active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
    </>
  );
}