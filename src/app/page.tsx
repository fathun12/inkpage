import { ButtonLink } from "@/components/ui/Button";
import { Grain } from "@/components/ui/Grain";
import { routes, siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <Grain />
      <h1 className="animate-rise font-display text-7xl font-black">{siteConfig.name}</h1>
      <p className="max-w-sm text-ink-soft">{siteConfig.description}</p>
      <ButtonLink href={routes.login} variant="accent">Sign in</ButtonLink>
    </main>
  );
}