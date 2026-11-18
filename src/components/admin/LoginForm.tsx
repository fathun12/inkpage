import { Field, Input } from "@/components/ui/Field";
import { Grain } from "@/components/ui/Grain";
import { Notice } from "@/components/ui/Notice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FormAction } from "@/types/form";

type Props = { action: FormAction; error?: string };

export function LoginForm({ action, error }: Props) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5">
      <Grain />
      <form
        action={action}
        className="ink-border shadow-hard flex w-full max-w-sm flex-col gap-5 rounded-md bg-surface p-6"
      >
        <h1 className="font-display text-3xl font-black">Sign in</h1>
        {error && <Notice>{error}</Notice>}
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <SubmitButton variant="accent" pendingLabel="Signing in...">Sign in</SubmitButton>
      </form>
    </main>
  );
}