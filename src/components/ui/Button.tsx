import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "accent" | "ghost" | "danger" | "studio";
type Size = "md" | "sm";

const base =
  "ink-border press inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-body font-medium disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  solid: "bg-surface text-ink",
  accent: "bg-ink text-bg",
  ghost: "bg-transparent text-ink",
  danger: "bg-accent text-accent-ink",
  studio: "bg-ink text-bg uppercase tracking-wider",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3",
  sm: "px-3 py-1.5 text-sm",
};

type Style = { variant?: Variant; size?: Size };

export function Button({
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Style) {
  return <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & Style) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}