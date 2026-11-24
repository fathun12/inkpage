import type { ReactNode } from "react";
import Link from "next/link";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { orderStatusLabels, ordersHref, type OrderStatus } from "@/config/shop";
import { formatUsd } from "@/lib/shop-money";
import { cn } from "@/lib/utils";
import type { FormAction } from "@/types/form";
import type { OrderRow } from "@/types/shop";

type Props = {
  orders: OrderRow[];
  filter: OrderStatus | null;
  max: number;
  actions: { sendLink: FormAction; refund: FormAction };
};

const chips: OrderStatus[] = ["paid", "needs_review", "pending", "refunded"];

function when(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
      {children}
    </span>
  );
}

function OrderItem({ order, filter, actions }: { order: OrderRow; filter: OrderStatus | null; actions: Props["actions"] }) {
  const canSend = order.status === "paid" || order.status === "needs_review";
  const review = order.status === "needs_review";
  return (
    <li>
      <details className="ink-border rounded-md bg-surface">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
          <span className="font-display text-lg font-bold">{order.product_title}</span>
          <span className="font-mono text-xs text-ink-soft">
            {formatUsd(order.amount_cents)} · {order.email} · {when(order.created_at)}
          </span>
          <Badge>{orderStatusLabels[order.status] ?? order.status}</Badge>
        </summary>
        <div className="flex flex-col gap-4 border-t border-line p-4 text-sm">
          <dl className="grid grid-cols-[6rem_1fr] gap-y-1">
            <dt className="text-ink-soft">Order</dt>
            <dd className="font-mono">{order.id.slice(0, 8).toUpperCase()}</dd>
            <dt className="text-ink-soft">Buyer</dt>
            <dd>{order.email}</dd>
            <dt className="text-ink-soft">Provider</dt>
            <dd>{order.provider}</dd>
            <dt className="text-ink-soft">Created</dt>
            <dd>{when(order.created_at)}</dd>
            <dt className="text-ink-soft">Paid</dt>
            <dd>{when(order.paid_at)}</dd>
          </dl>

          {review && (
            <p className="text-ink-soft">
              The payment arrived after the hold ended and the stock was already gone. Accept it to send the files
              anyway, or mark it as refunded.
            </p>
          )}

          {canSend ? (
            <div className="flex flex-col gap-4">
              <form action={actions.sendLink} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="filter" value={filter ?? ""} />
                <div>
                  <SubmitButton size="sm" pendingLabel="Sending...">
                    {review ? "Accept and send link" : "Send link again"}
                  </SubmitButton>
                </div>
                <p className="text-xs text-ink-soft">
                  The buyer gets a new email with a new link. The old link stops working.
                </p>
              </form>
              <form action={actions.refund} className="flex flex-col gap-2 border-t border-line pt-4">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="filter" value={filter ?? ""} />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="confirm" required className="accent-accent" />
                  Yes, mark this order as refunded
                </label>
                <div>
                  <SubmitButton size="sm" pendingLabel="Saving...">
                    Mark refunded
                  </SubmitButton>
                </div>
                <p className="text-xs text-ink-soft">
                  This blocks the downloads. It does not return any money: refund the buyer in your payment dashboard.
                </p>
              </form>
            </div>
          ) : (
            <p className="text-xs text-ink-soft">Nothing to do for this order.</p>
          )}
        </div>
      </details>
    </li>
  );
}

export function ShopOrders({ orders, filter, max, actions }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Filter orders" className="flex flex-wrap gap-2">
        {[null, ...chips].map((status) => (
          <Link
            key={status ?? "all"}
            href={ordersHref(status)}
            aria-current={status === filter ? "true" : undefined}
            className={cn(
              "border px-2 py-1 font-mono text-[11px] uppercase tracking-widest",
              status === filter ? "border-ink text-ink" : "border-line text-ink-soft hover:text-ink",
            )}
          >
            {status ? orderStatusLabels[status] : "All"}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="text-sm text-ink-soft">No orders here yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} filter={filter} actions={actions} />
          ))}
        </ul>
      )}
      {orders.length >= max && <p className="text-xs text-ink-soft">Showing the newest {max} orders.</p>}
    </div>
  );
}