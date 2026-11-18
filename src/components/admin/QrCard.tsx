type Props = { svg: string; url: string };

export function QrCard({ svg, url }: Props) {
  const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return (
    <section className="ink-border flex flex-col gap-5 rounded-md bg-surface p-5 sm:flex-row sm:items-center">
      <div
        role="img"
        aria-label="QR code for your page"
        className="ink-border size-40 shrink-0 bg-surface [&>svg]:size-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="font-display text-2xl font-black">QR code</h2>
        <p className="break-all font-mono text-xs text-ink-soft">{url}</p>
        <div>
          <a
            href={href}
            download="inkpage-qr.svg"
            className="ink-border press inline-flex items-center rounded-md bg-surface px-3 py-1.5 text-sm font-semibold"
          >
            Download SVG
          </a>
        </div>
      </div>
    </section>
  );
}
