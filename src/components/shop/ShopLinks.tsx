import Link from "next/link";

type Props = { links: { label: string; href: string }[]; email: string | null };

const underline =
  "underline decoration-accent decoration-1 underline-offset-4 transition-colors duration-(--dur-base) hover:text-accent";

// Terms, Privacy and Refund links, and the contact email.
export function ShopLinks({ links, email }: Props) {
  if (links.length === 0 && !email) return null;
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-6 text-sm">
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={underline}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {email && (
        <p className="text-ink-soft">
          Questions?{" "}
          <a href={`mailto:${email}`} className={underline}>
            {email}
          </a>
        </p>
      )}
    </div>
  );
}