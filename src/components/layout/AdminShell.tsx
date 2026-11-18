import type { ReactNode } from "react";
import { routes, siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Grain } from "@/components/ui/Grain";
import type { FormAction } from "@/types/form";
import { NavLink } from "./NavLink";

type Props = { username: string; logoutAction: FormAction; children: ReactNode };

export function AdminShell({ username, logoutAction, children }: Props) {
  return (
    <div className="relative min-h-screen">
      <Grain />
      <header className="border-b-2 border-line">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
          <span className="font-display text-2xl font-black">{siteConfig.name}</span>
          <nav className="flex flex-wrap gap-1" aria-label="Admin">
            <NavLink href={routes.admin} exact>Overview</NavLink>
            <NavLink href={routes.links}>Links</NavLink>
            <NavLink href={routes.appearance}>Appearance</NavLink>
            <NavLink href={routes.analytics}>Analytics</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <a
              href={routes.profile(username)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm underline underline-offset-4"
            >
              /{username}
            </a>
            <form action={logoutAction}>
              <Button type="submit" size="sm">Log out</Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-5 py-10">{children}</main>
    </div>
  );
}