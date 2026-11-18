import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Grain } from "@/components/ui/Grain";
import { Notice } from "@/components/ui/Notice";
import type { FormAction } from "@/types/form";

type Props = { action: FormAction; error?: string };

export function SetupForm({ action, error }: Props) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5">
      <Grain />
      <form
        action={action}
        className="ink-border shadow-hard flex w-full max-w-sm flex-col gap-5 rounded-md bg-surface p-6"
      >
        <h1 className="font-display text-3xl font-black">Set up your page</h1>
        {error && <Notice>{error}</Notice>}
        <Field label="Username" htmlFor="username" hint="Your page lives at /username. Letters, numbers, - and _.">
          <Input id="username" name="username" required minLength={3} maxLength={30} autoComplete="off" />
        </Field>
        <Field label="Display name" htmlFor="display_name">
          <Input id="display_name" name="display_name" required maxLength={60} />
        </Field>
        <Button type="submit" variant="accent">Create page</Button>
      </form>
    </main>
  );
}