import type { ReactNode } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FormAction } from "@/types/form";

type Props = {
  action: FormAction;
  error?: string;
  // The hero of the website with its intro (greeting, date, big sentence). Left out = a plain dark panel.
  panel?: ReactNode;
};

const label = "font-mono text-[11px] uppercase tracking-widest text-ink-soft";
const input =
  "w-full rounded-none border-0 border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink focus:[box-shadow:0_1px_0_0_var(--c-ink)]";

// The intro was made for a full screen. In this narrower panel its padding and its big sentence are made smaller.
const intro =
  "[&_.site-intro]:px-8 [&_.site-intro]:pb-16 [&_.site-intro]:pt-10 lg:[&_.site-intro]:px-14 lg:[&_.site-intro]:pb-24 lg:[&_.site-intro]:pt-24 " +
  "[&_h2]:text-4xl sm:[&_h2]:text-5xl lg:[&_h2]:text-6xl xl:[&_h2]:text-7xl 2xl:[&_h2]:text-8xl";

export function LoginForm({ action, error, panel }: Props) {
  return (
    <main className="grid min-h-screen bg-bg text-ink lg:grid-cols-[1.15fr_1fr]">
      {/* inert: the panel is decoration, it is skipped by the keyboard and by screen readers. */}
      <section
        inert
        className={`login-panel relative h-[28rem] overflow-hidden bg-band text-band-ink [--site-vh:28rem] lg:h-auto lg:min-h-screen lg:[--site-vh:100svh] ${intro}`}
      >
        {panel ?? (
          <p className="absolute bottom-6 left-6 font-voice text-4xl leading-none sm:text-5xl lg:bottom-12 lg:left-12 lg:text-7xl">
            Welcome back.
          </p>
        )}
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