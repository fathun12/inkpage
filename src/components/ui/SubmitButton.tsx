"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

type Props = Omit<ComponentProps<typeof Button>, "type"> & { pendingLabel?: string };

// Submit button that shows progress: it is disabled and changes its label while the form is being sent.
export function SubmitButton({ children, pendingLabel = "Saving...", disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} aria-busy={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}