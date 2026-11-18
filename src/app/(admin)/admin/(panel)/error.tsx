"use client";

import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";

type Props = { error: Error & { digest?: string }; reset: () => void };

export default function PanelError({ error, reset }: Props) {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="font-display text-4xl font-black">Something went wrong</h1>
      <Notice>
        The action did not finish, so nothing was saved. A common cause is a photo that is too large
        for the server. Try a smaller photo, or try again.
        {error.digest ? ` Reference: ${error.digest}.` : ""}
      </Notice>
      <div>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}