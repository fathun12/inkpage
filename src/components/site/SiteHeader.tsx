type Props = {
  brand: string;
  links: { label: string; href: string }[];
};

// The brand is the username.
export function SiteHeader({ brand, links }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-[3.75rem] items-center justify-between border-b border-line bg-bg px-5 sm:px-8">
      <a href="#top" className="font-voice text-2xl leading-none">
        {brand}
      </a>
      {links.length > 0 && (
        <nav aria-label="Sections" className="flex gap-6 text-sm">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-ink-soft transition-colors duration-(--dur-base) hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}