import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SocialItem } from "@/types/block";
import { NewsTicker, type NewsProps } from "./NewsBar";
import { Reveal } from "./Reveal";
import { ThemeSwitch, type Mode } from "./ThemeSwitch";
import { WhatsAppLink } from "./WhatsAppLink";

type NavItem = { label: string; href: string };
type Props = {
  brand: string;
  name?: string | null;
  bio?: string | null;
  note: string | null;
  socials: SocialItem[];
  contactEmail?: string | null;
  whatsapp?: string | null;
  nav?: NavItem[];
  // Only the Customize preview sets this, so the buttons change the preview box and not the whole page.
  modeControl?: { value: Mode; onChange: (mode: Mode) => void };
  // The news in the black band (also the clock and the countdown). Left out = no news in the footer.
  news?: NewsProps;
};

const heading = "text-sm font-semibold opacity-80";
const link = "site-ul text-sm";

export function SiteFooter({ brand, name, bio, note, socials, contactEmail = null, whatsapp = null, nav = [], modeControl, news }: Props) {
  const hasNote = Boolean(name || bio || note);
  const hasNav = nav.length > 0;

  return (
    <footer>
      {/* Upper part: the Tertiary color. */}
      <div className="bg-tertiary px-5 pt-14 text-tertiary-ink sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          {(
            <div className="grid gap-12 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
              {hasNote && (
                <Reveal>
                  <div className="flex flex-col gap-3">
                    <p className={heading}>Note</p>
                    {name && <p className="font-display text-base font-normal leading-tight">{name}</p>}
                    {bio && <p className="max-w-xs whitespace-pre-line text-xs opacity-70">{bio}</p>}
                    {note && <p className="max-w-xs whitespace-pre-line text-sm opacity-70">{note}</p>}
                  </div>
                </Reveal>
              )}

              {hasNav && (
                <Reveal delay={100}>
                  <nav aria-label="Footer" className="flex flex-col gap-4">
                    <p className={heading}>Explore</p>
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
                </Reveal>
              )}

              <Reveal delay={200}>
                <div className="flex flex-col gap-4">
                  <p className={heading}>Connect</p>
                  <ul className="flex flex-col gap-2.5">
                    {contactEmail && (
                      <li>
                        <a href={`mailto:${contactEmail}`} className={`${link} break-all`}>
                          {contactEmail}
                        </a>
                      </li>
                    )}
                    <li>
                      <WhatsAppLink number={whatsapp} className={link} />
                    </li>
                    {socials.map((item) => (
                      <li key={item.url}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className={link}>
                          {item.label} <span aria-hidden>↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          )}

          {/* The name, very large and cut off by the band below. Decorative. */}
          <Reveal variant="still">
            <div
              aria-hidden
              className="mt-16 h-[0.74em] select-none overflow-hidden whitespace-nowrap text-[clamp(4rem,19vw,15rem)] sm:mt-24"
            >
              <span className="site-footer-name block font-voice leading-none">{brand}</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Full-width band, now thin: copyright, color mode, back to top. */}
      <div className="bg-band px-5 text-band-ink sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
          <p className="text-xs opacity-70">
            © {new Date().getFullYear()}{" "}
            <a
              href={siteConfig.credit.author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="site-ul relative z-10 cursor-pointer"
            >
              {name || brand}
            </a>
          </p>
          {news && (
            <div className="order-last flex min-w-0 basis-full justify-center sm:order-none sm:flex-1">
              <NewsTicker {...news} />
            </div>
          )}
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