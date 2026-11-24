import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SocialItem } from "@/types/block";

type NavItem = { label: string; href: string };
type Props = { brand: string; note: string | null; socials: SocialItem[]; nav?: NavItem[] };

const heading = "font-mono text-xs uppercase tracking-widest text-ink-soft";
const link = "text-sm transition-colors duration-(--dur-base) hover:text-ink-soft";

export function SiteFooter({ brand, note, socials, nav = [] }: Props) {
  return (
    <footer className="border-t border-line px-5 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            {note && (
              <>
                <p className={heading}>00 / Note</p>
                <p className="max-w-xs whitespace-pre-line text-sm text-ink-soft">{note}</p>
              </>
            )}
          </div>

          {nav.length > 0 && (
            <nav aria-label="Footer" className="flex flex-col gap-4">
              <p className={heading}>01 / Explore</p>
              <ul className="flex flex-col gap-2.5">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {socials.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className={heading}>02 / Connect</p>
              <ul className="flex flex-col gap-2.5">
                {socials.map((item) => (
                  <li key={item.url}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={link}>
                      {item.label} <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* The name, very large and cut off by the line below. Decorative. */}
        <div
          aria-hidden
          className="mt-16 h-[0.74em] select-none overflow-hidden whitespace-nowrap text-[clamp(4rem,19vw,15rem)] sm:mt-24"
        >
          <span className="block font-voice leading-none">{brand}</span>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line py-5">
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} {brand} · {siteConfig.footer}
          </p>
          <a
            href="#"
            aria-label="Back to top"
            className="inline-flex size-9 shrink-0 items-center justify-center border border-ink font-mono text-sm transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg"
          >
            <span aria-hidden>↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}