import type { ProductState } from "@/lib/shop-status";

// Price, status and the buy button. The button does not work yet: checkout comes in phase 18d.
export function BuyPanel({ state }: { state: ProductState }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex flex-wrap items-baseline gap-x-4">
        <span className="font-display text-4xl">{state.price}</span>
        {state.note && <span className="font-mono text-xs uppercase tracking-widest text-accent">{state.note}</span>}
      </p>
      <button
        type="button"
        disabled
        className={`self-start border px-5 py-3 font-mono text-xs uppercase tracking-widest disabled:cursor-not-allowed ${
          state.buyable ? "border-ink" : "border-line text-ink-soft"
        }`}
      >
        {state.action}
      </button>
      {state.buyable && <p className="text-xs text-ink-soft">Checkout is not available yet.</p>}
    </div>
  );
}