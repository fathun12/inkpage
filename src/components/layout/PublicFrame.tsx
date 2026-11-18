import type { ReactNode } from "react";
import { siteConfig, type ThemeName } from "@/config/site";
import { Grain } from "@/components/ui/Grain";

type Props = { theme: ThemeName; children: ReactNode };

export function PublicFrame({ theme, children }: Props) {
  return (
    <div data-theme={theme} className="relative min-h-screen bg-bg text-ink">
      <Grain />
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 pb-16 pt-14">
        {children}
        <footer className="pt-6 text-center font-mono text-xs text-ink-soft">
          Made with {siteConfig.name}
        </footer>
      </main>
    </div>
  );
}