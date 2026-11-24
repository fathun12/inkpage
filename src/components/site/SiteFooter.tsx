import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SocialItem } from "@/types/block";
import { ThemeSwitch, type Mode } from "./ThemeSwitch";

type NavItem = { label: string; href: string };
type Props = {
  brand: string;
  name?: string | null;
  bio?: string | null;
  note: string | null;
  socials: SocialItem[];
  nav?: NavItem[];
  // Only the Customize preview sets this, so the buttons change the preview box and not the whole page.
  modeControl?: { value: Mode; onChange: (mode: Mode) => void };
};

const heading = "font-mono text-xs uppercase tracking-widest opacity-60";
const link = "text-sm transition-opacity duration-(--dur-base) hover:opacity-60";

const pad = (n: number) => String(n).padStart(2, "0");

export function SiteFooter({ brand, name, bio, note, socials, nav = [], modeControl }: Props) {
  const hasNote = Boolean(name || bio || note);
  const hasNav = nav.length > 0;
  const hasSocials = socials.length > 0;
  const noteNo = 0;
  const navNo = hasNote ? 1 : 0;
  const socialNo = (hasNote ? 1 : 0) + (hasNav ? 1 : 0);

  return (
    <footer>
      {/* Upper part: the Tertiary color. */}
      <div className="bg-tertiary px-5 pt-14 text-tertiary-ink sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          {(hasNote || hasNav || hasSocials) && (
            <div className="grid gap-12 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
              {hasNote && (
                <div className="flex flex-col gap-3">
                  <p className={heading}>{pad(noteNo)} / Note</p>
                  {name && <p className="font-display text-base font-normal leading-tight">{name}</p>}
                  {bio && <p className="max-w-xs whitespace-pre-line text-xs opacity-70">{bio}</p>}
                  {note && <p className="max-w-xs whitespace-pre-line text-sm opacity-70">{note}</p>}
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

      {/* Full-width band, now thin: copyright, color mode, back to top. */}
      <div className="bg-band px-5 text-band-ink sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
          <p className="text-xs opacity-70">
            © {new Date().getFullYear()} {brand} · {siteConfig.footer}
          </p>
          <div className="flex items-center gap-3">
            <ThemeSwitch control={modeControl} />
            <a
              href="#"
              aria-label="Back to top"
              className="inline-flex size-7 shrink-0 items-center justify-center border border-band-ink font-mono text-xs transition-colors duration-(--dur-base) hover:bg-band-ink hover:text-band"
            >
              <span aria-hidden>↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}