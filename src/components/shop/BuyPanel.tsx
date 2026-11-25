import Link from "next/link";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { shopConfig } from "@/config/shop";
import type { ProductState } from "@/lib/shop-status";
import type { FormAction } from "@/types/form";

type Props = {
  state: ProductState;
  // Starts the checkout (the page binds it to the profile and the product).
  action: FormAction;
  // Reason of the last failed try (from the address), or null.
  error: string | null;
  links: { label: string; href: string }[];
};

const buttonClass = "self-start rounded-none px-5 py-3 font-mono text-xs uppercase tracking-widest";

// Price, status and the buy form. A product that cannot be bought shows a disabled button and no form.
export function BuyPanel({ state, action, error, links }: Props) {
  const terms = links.find((l) => l.href.endsWith("/terms"));
  const refund = links.find((l) => l.href.endsWith("/refund"));
  const linkClass = "underline underline-offset-2 hover:text-ink";

  return (
    <div className="flex flex-col gap-4">
      <p className="flex flex-wrap items-baseline gap-x-4">
        <span className="font-display text-4xl">{state.price}</span>
        {state.note && <span className="font-mono text-xs uppercase tracking-widest text-accent">{state.note}</span>}
      </p>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}

      {state.buyable ? (
        <form action={action} className="flex flex-col gap-4">
          {/* Honeypot: people never see it, simple bots fill it in. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <Field label="Email" htmlFor="buy-email" hint="Your download link is sent to this email.">
            <Input
              id="buy-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={shopConfig.limits.email}
              className="rounded-none"
            />
          </Field>
          <label className="flex items-start gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="agree" required className="mt-1" />
            <span>
              I agree to the{" "}
              {terms ? (
                <Link href={terms.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Terms of Sale
                </Link>
              ) : (
                "Terms of Sale"
              )}{" "}
              and the{" "}
              {refund ? (
                <Link href={refund.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Refund Policy
                </Link>
              ) : (
                "Refund Policy"
              )}
              .
            </span>
          </label>
          <SubmitButton variant="ghost" className={buttonClass} pendingLabel="Please wait...">
            {state.action}
          </SubmitButton>
        </form>
      ) : (
        <button
          type="button"
          disabled
          className="self-start border border-line px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-soft disabled:cursor-not-allowed"
        >
          {state.action}
        </button>
      )}
    </div>
  );
}