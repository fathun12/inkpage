import { siGithub } from "simple-icons";
import { Img } from "@/components/ui/Img";
import { downloadWord, logoLabels } from "@/config/item-data";
import type { DownloadLogo, ItemDownload, ItemLink } from "@/types/block";

export type DownloadLink = ItemDownload;

// Older code passes one Nexus link and one GitHub link.
export function downloadLinks(nexus?: string | null, github?: string | null): DownloadLink[] {
  const list: (DownloadLink | null)[] = [
    nexus ? { url: nexus, logo: "nexus" } : null,
    github ? { url: github, logo: "github" } : null,
  ];
  return list.filter((d): d is DownloadLink => d !== null);
}

// A simple mark drawn by hand: an N cut out of a square.
const nexusPath = "M3 3h18v18H3zM7 17V7h2.4l5.2 6.4V7H17v10h-2.4L9.4 10.6V17z";

function Logo({ logo, logoUrl }: { logo: DownloadLogo; logoUrl?: string | null }) {
  // A logo you uploaded is shown as it is, with its own colors.
  if (logoUrl) return <Img src={logoUrl} className="size-5 shrink-0 object-contain" />;
  if (logo === "none") return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0 fill-current">
      <path d={logo === "github" ? siGithub.path : nexusPath} fillRule="evenodd" />
    </svg>
  );
}

// One BUTTON per source: the word "Download" and the logo next to it. Sharp corners, thin line. New tab.
export function Downloads({ links, className = "" }: { links: DownloadLink[]; className?: string }) {
  if (links.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.logoUrl || l.logo === "none" ? downloadWord : `${downloadWord} on ${logoLabels[l.logo]}`}
          className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg"
        >
          <span>{downloadWord}</span>
          <Logo logo={l.logo} logoUrl={l.logoUrl} />
        </a>
      ))}
    </div>
  );
}

// Plain text links with an underline (for example "Visit website"). New tab.
export function TextLinks({ links, className = "" }: { links: ItemLink[]; className?: string }) {
  if (links.length === 0) return null;
  return (
    <p className={`flex flex-wrap gap-x-5 gap-y-1 text-sm ${className}`}>
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent"
        >
          {l.label}
        </a>
      ))}
    </p>
  );
}