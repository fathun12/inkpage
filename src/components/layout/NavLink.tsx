"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { href: string; exact?: boolean; children: ReactNode };

export function NavLink({ href, exact, children }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-1.5 font-mono text-sm uppercase tracking-wider",
        active ? "bg-ink text-bg" : "text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}