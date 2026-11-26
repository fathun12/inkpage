"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

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
  // On the main domain the owner's name is not in the address (/projects, not /zdtzer0/projects).
  // Cutting the name off both sides lets the same check work on both kinds of address.
  const clean = (path: string) => {
    if (path === home) return "/";
    return path.startsWith(`${home}/`) ? path.slice(home.length) : path;
  };
  const here = clean(pathname);
  const onHome = overlay ?? here === "/";
  const sentinel = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(true);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !onHome || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setTop(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHome]);

  // The entrance motion plays once per visit: after it is over, the page wrapper is marked.
  useEffect(() => {
    const root = sentinel.current?.closest(".site-root");
    if (!root) return;
    const id = window.setTimeout(() => root.setAttribute("data-entered", ""), 3000);
    return () => window.clearTimeout(id);
  }, []);

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
            {items.map((item, i) => {
              const active = here === clean(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  style={{ "--i": i } as CSSProperties}
                  className={`site-nav-item border-b pb-0.5 transition-opacity duration-(--dur-base) ${
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