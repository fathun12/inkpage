type DownloadLink = { label: string; url: string };

export function downloadLinks(nexus?: string | null, github?: string | null): DownloadLink[] {
  return [
    nexus ? { label: "Nexus Mods", url: nexus } : null,
    github ? { label: "GitHub", url: github } : null,
  ].filter((d): d is DownloadLink => d !== null);
}

// The text "Download" followed by one text link per source. Opens in a new tab.
export function Downloads({ links, className = "" }: { links: DownloadLink[]; className?: string }) {
  if (links.length === 0) return null;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-widest ${className}`}>
      <span className="opacity-60">Download</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent"
        >
          {l.label} <span aria-hidden>↓</span>
        </a>
      ))}
    </p>
  );
}