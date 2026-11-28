import Link from "next/link";
import type { ReactNode } from "react";
import { footerDefaults, type FooterAlign, type FooterBlock, type FooterStyle } from "@/config/footer-style";
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
  // Layout of the footer (Customize). Left out = the original look.
  layout?: FooterStyle;
};

const heading = "text-sm font-semibold opacity-80";
const link = "site-ul text-sm";

const boxAlign: Record<FooterAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};
const textAlign: Record<FooterAlign, string> = { left: "text-left", center: "text-center", right: "text-right" };

export function SiteFooter({
  brand,
  name,
  bio,
  note,
  socials,
  contactEmail = null,
  whatsapp = null,
  nav = [],
  modeControl,
  news,
  layout = footerDefaults,
}: Props) {
  const hasNote = Boolean(name || bio || note);
  const hasNav = nav.length > 0;
  const full = layout.mode === "full";
  const wrap = full ? "w-full" : "mx-auto max-w-5xl";

  const blocks: Record<FooterBlock, ReactNode | null> = {
    note: hasNote ? (
      <div className={`flex flex-col gap-3 ${boxAlign[layout.align.note]}`}>
        <p className={heading}>Note</p>
        {name && <p className="font-display text-base font-normal leading-tight">{name}</p>}
        {bio && <p className="max-w-xs whitespace-pre-line text-xs opacity-70">{bio}</p>}
        {note && <p className="max-w-xs whitespace-pre-line text-sm opacity-70">{note}</p>}
      </div>
    ) : null,
    explore: hasNav ? (
      <nav aria-label="Footer" className={`flex flex-col gap-4 ${boxAlign[layout.align.explore]}`}>
        <p className={heading}>Explore</p>
        <ul className={`flex flex-col gap-2.5 ${boxAlign[layout.align.explore]}`}>
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={link}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    ) : null,
    connect: (
      <div className={`flex flex-col gap-4 ${boxAlign[layout.align.connect]}`}>
        <p className={heading}>Connect</p>
        <ul className={`flex flex-col gap-2.5 ${boxAlign[layout.align.connect]}`}>
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
    ),
  };
  const shown = layout.order.filter((id) => blocks[id] !== null);

  const above = layout.brandSpot === "above";
  // The name, very large. Below the columns it is cut off by the band. Decorative.
  const bigName = (
    <Reveal variant="still">
      <div
        aria-hidden
        className={`select-none overflow-hidden whitespace-nowrap text-[clamp(4rem,19vw,15rem)] ${textAlign[layout.brandAlign]} ${
          above ? "mb-14 h-[0.85em] sm:mb-20" : "mt-16 h-[0.74em] sm:mt-24"
        }`}
      >
        <span className="site-footer-name block font-voice leading-none">{brand}</span>
      </div>
    </Reveal>
  );

  return (
    <footer>
      {/* Upper part: the Tertiary color. */}
      <div className="bg-tertiary px-5 pt-14 text-tertiary-ink sm:px-8 sm:pt-20">
        <div className={wrap}>
          {above && bigName}
          <div
            className={
              full
                ? "flex flex-col gap-12 sm:flex-row sm:justify-between"
                : "grid gap-12 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]"
            }
          >
            {shown.map((id, i) => (
              <div key={id} className={full ? "sm:min-w-48" : undefined}>
                <Reveal delay={i * 100}>{blocks[id]}</Reveal>
              </div>
            ))}
          </div>
          {!above && bigName}
        </div>
      </div>

      {/* Full-width band, thin: copyright, news, color mode, back to top. */}
      <div className="bg-band px-5 text-band-ink sm:px-8">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5`}>
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