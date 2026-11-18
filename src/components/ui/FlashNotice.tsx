import type { ReactNode } from "react";
import { Notice } from "@/components/ui/Notice";

type Props = { tone: "error" | "ok"; children: ReactNode };

// Result message of a form. It sticks to the top while scrolling, so it is always seen.
export function FlashNotice({ tone, children }: Props) {
  return (
    <div className="animate-rise sticky top-3 z-20">
      <Notice tone={tone}>
        {tone === "error" && <strong>Failed: </strong>}
        {children}
      </Notice>
    </div>
  );
}