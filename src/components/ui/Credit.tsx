import { siteConfig } from "@/config/site";

const link =
  "underline underline-offset-2 transition-opacity duration-(--dur-base) hover:opacity-60";

// "Made with inkpage by MFNiam": both names are links. Change the wording or the addresses in config/site.ts.
export function Credit() {
  const { credit } = siteConfig;
  return (
    <span>
      {credit.before}
      <a href={credit.product.url} target="_blank" rel="noopener noreferrer" className={link}>
        {credit.product.label}
      </a>
      {credit.between}
      <a href={credit.author.url} target="_blank" rel="noopener noreferrer" className={link}>
        {credit.author.label}
      </a>
    </span>
  );
}