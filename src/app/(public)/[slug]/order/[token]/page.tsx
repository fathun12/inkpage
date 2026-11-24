import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDownloads } from "@/components/shop/OrderDownloads";
import { PageIntro } from "@/components/site/PageIntro";
import { shopConfig } from "@/config/shop";
import { routes } from "@/config/site";
import { getProfileByUsername } from "@/features/profile/queries";
import { getOrderView } from "@/features/shop/order";

type Props = { params: Promise<{ slug: string; token: string }> };

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

const intros: Record<string, string> = {
  paid: "Thank you. Your files are ready below.",
  pending: "Waiting for the payment to be confirmed. Refresh this page in a moment.",
  needs_review: "Your payment arrived after the hold ended. The seller will contact you by email.",
  refunded: "This order was refunded. The files are no longer available.",
};

export default async function OrderPage({ params }: Props) {
  const { slug, token } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const order = await getOrderView(profile.id, token);
  if (!order) notFound();

  const intro = intros[order.status] ?? "This order was not completed.";
  const ends = order.accessEnds
    ? new Date(order.accessEnds).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      })
    : null;

  return (
    <>
      <PageIntro title={order.title} intro={intro} />
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 pb-24 sm:px-8">
        {order.files.length > 0 && (
          <OrderDownloads
            items={order.files.map((f) => ({ ...f, href: `/download/${token}/${f.id}` }))}
          />
        )}
        {ends && (
          <p className="text-sm text-ink-soft">
            Keep the address of this page: it is your download link. It works until {ends}, up to{" "}
            {shopConfig.grantMaxDownloads} downloads per file.
          </p>
        )}
        {order.license && (
          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-xs uppercase tracking-widest text-ink-soft">License</h2>
            <p className="whitespace-pre-line text-sm text-ink-soft">{order.license}</p>
          </section>
        )}
        <Link
          href={routes.section(profile.username, "shop")}
          className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
        >
          ← Back to the shop
        </Link>
      </div>
    </>
  );
}