import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { tone?: "error" | "ok"; children: ReactNode };

export function Notice({ tone = "error", children }: Props) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "ink-border rounded-md px-4 py-3 text-sm font-medium",
        tone === "error" ? "bg-accent text-accent-ink" : "bg-highlight text-ink",
      )}
    >
      {children}
    </p>
  );
}