import { cleanUrl } from "@/config/seo";
import { hasAbout, type SiteSettings } from "@/config/site-content";

type Who = { username: string; display_name: string; bio?: string | null };

// The author as search engines read it: one Person with a fixed id, so every page points to the same person.
// null when the account has no clean address (only the owner's account has one).
export function personLd(who: Who, site: SiteSettings): Record<string, unknown> | null {
  const home = cleanUrl(who.username, "/");
  if (!home) return null;
  const about = hasAbout(site) ? cleanUrl(who.username, "/about") : null;
  const sameAs = [site.githubUser ? `https://github.com/${site.githubUser}` : null].filter(Boolean);
  return {
    "@type": "Person",
    "@id": `${home}#person`,
    name: who.display_name,
    alternateName: site.alternateNames.length > 0 ? site.alternateNames : undefined,
    url: about ?? home,
    image: site.about.photo ?? undefined,
    description: who.bio ?? undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}