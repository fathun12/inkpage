import type { ReactNode } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FormAction } from "@/types/form";

type Props = {
  action: FormAction;
  error?: string;
  // What shows in the dark panel (the hero of the website). Left out = a plain dark panel.
  panel?: ReactNode;
};

const label = "font-mono text-[11px] uppercase tracking-widest text-ink-soft";
const input =
  "w-full rounded-none border-0 border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink focus:[box-shadow:0_1px_0_0_var(--c-ink)]";

export function LoginForm({ action, error, panel }: Props) {
  return (
    <main className="grid min-h-screen bg-bg text-ink lg:grid-cols-[1.15fr_1fr]">
      <section
        aria-hidden
        className="relative h-[32svh] overflow-hidden bg-band text-band-ink lg:h-auto lg:min-h-screen"
      >
        {panel}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "linear-gradient(to top, rgb(0 0 0 / 0.7), transparent 65%)" }}
        />
        <p className="absolute bottom-6 left-6 font-voice text-4xl leading-none sm:text-5xl lg:bottom-12 lg:left-12 lg:text-7xl">
          Welcome back.
        </p>
      </section>

      <section className="flex items-center px-6 py-14 sm:px-12 lg:px-20">
        <form action={action} className="animate-rise flex w-full max-w-sm flex-col gap-10">
          <div className="flex flex-col gap-4">
            <span className={label}>Admin</span>
            <h1 className="font-display text-5xl font-medium leading-none tracking-tight">Sign in</h1>
          </div>

          {error && (
            <p role="alert" className="border-l border-accent pl-3 text-sm">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className={label}>
                Email
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required className={input} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className={label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={input}
              />
            </div>
          </div>

          <SubmitButton variant="studio" pendingLabel="Signing in..." className="w-full rounded-none! py-3.5">
            Sign in
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}