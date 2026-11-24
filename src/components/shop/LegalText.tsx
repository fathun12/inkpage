import Link from "next/link";

type Props = { text: string; email: string | null; shopHref: string };

export function LegalText({ text, email, shopHref }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
      <div className="flex max-w-2xl flex-col gap-8">
        <p className="whitespace-pre-line leading-relaxed text-ink-soft">{text}</p>
        {email && (
          <p className="text-sm text-ink-soft">
            Contact:{" "}
            <a href={`mailto:${email}`} className="underline decoration-accent decoration-1 underline-offset-4">
              {email}
            </a>
          </p>
        )}
        <Link
          href={shopHref}
          className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
        >
          ← Back to the shop
        </Link>
      </div>
    </div>
  );
}