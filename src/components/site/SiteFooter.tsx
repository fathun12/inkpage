import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SocialItem } from "@/types/block";
import { ThemeSwitch } from "./ThemeSwitch";

type NavItem = { label: string; href: string };
type Props = { brand: string; note: string | null; socials: SocialItem[]; nav?: NavItem[] };

const heading = "font-mono text-xs uppercase tracking-widest text-ink-soft";
const link = "text-sm transition-colors duration-(--dur-base) hover:text-ink-soft";

const pad = (n: number) => String(n).padStart(2, "0");

export function SiteFooter({ brand, note, socials, nav = [] }: Props) {
  const hasNav = nav.length > 0;
  const hasSocials = socials.length > 0;
  const noteNo = 0;
  const navNo = note ? 1 : 0;
  const socialNo = (note ? 1 : 0) + (hasNav ? 1 : 0);

  return (
    <footer className="border-t border-line">
      <div className="px-5 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          {(note || hasNav || hasSocials) && (
            <div className="grid gap-12 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
              {note && (
                <div className="flex flex-col gap-3">
                  <p className={heading}>{pad(noteNo)} / Note</p>
                  <p className="max-w-xs whitespace-pre-line text-sm text-ink-soft">{note}</p>
                </div>
              )}

              {hasNav && (
                <nav aria-label="Footer" className="flex flex-col gap-4">
                  <p className={heading}>{pad(navNo)} / Explore</p>
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

              {hasSocials && (
                <div className="flex flex-col gap-4">
                  <p className={heading}>{pad(socialNo)} / Connect</p>
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
          )}

          {/* The name, very large and cut off by the band below. Decorative. */}
          <div
            aria-hidden
            className="mt-16 h-[0.74em] select-none overflow-hidden whitespace-nowrap text-[clamp(4rem,19vw,15rem)] sm:mt-24"
          >
            <span className="block font-voice leading-none">{brand}</span>
          </div>
        </div>
      </div>

      {/* Full-width band: copyright, color mode, back to top. */}
      <div className="border-t border-band-line bg-band px-5 text-band-ink sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5">
          <p className="text-xs opacity-70">
            © {new Date().getFullYear()} {brand} · {siteConfig.footer}
          </p>
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            <a
              href="#"
              aria-label="Back to top"
              className="inline-flex size-9 shrink-0 items-center justify-center border border-band-ink font-mono text-sm transition-colors duration-(--dur-base) hover:bg-band-ink hover:text-band"
            >
              <span aria-hidden>↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}