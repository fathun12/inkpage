import { siteConfig } from "@/config/site";
import type { SocialItem } from "@/types/block";

type Props = { brand: string; socials: SocialItem[] };

export function SiteFooter({ brand, socials }: Props) {
  return (
    <footer className="border-t border-line px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <span className="font-voice text-3xl leading-none">{brand}</span>
        <div className="flex flex-col gap-3 text-sm sm:items-end">
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {socials.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-soft transition-colors duration-(--dur-base) hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} {brand} · {siteConfig.footer}
          </p>
        </div>
      </div>
    </footer>
  );
}