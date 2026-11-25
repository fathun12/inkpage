import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { routes } from "@/config/site";
import { getProfileByUsername } from "@/features/profile/queries";
import { startCheckoutAction } from "@/features/shop/checkout-actions";
import { getPublicShop, legalLinks } from "@/features/shop/public";
import { productState } from "@/lib/shop-status";

type Props = { params: Promise<{ slug: string; product: string }> };
type PageProps = Props & {
  searchParams: Promise<{
    buy_error?: string | string[];
    bought?: string | string[];
    status?: string | string[];
  }>;
};

async function load(slug: string, productSlug: string) {
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return null;
  const shop = await getPublicShop(profile.id);
  const product = shop.products.find((p) => p.slug === productSlug);
  return product ? { profile, shop, product } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, product: productSlug } = await params;
  const found = await load(slug, productSlug);
  if (!found) return { title: "Not found" };
  return {
    title: `${found.product.title} · ${found.profile.display_name}`,
    description: found.product.description?.slice(0, 160) ?? undefined,
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug, product: productSlug } = await params;
  const { buy_error, bought, status } = await searchParams;
  const found = await load(slug, productSlug);
  if (!found) notFound();
  const { profile, shop, product } = found;
  const rawError = first(buy_error);

  // Dodo sends the buyer back here with ?status=... added. It only picks the wording of this message:
  // anyone can type an address, so the real payment status always comes from the webhook.
  let notice: string | null = null;
  if (bought) {
    notice =
      first(status) === "succeeded"
        ? "Payment received. Your download link is being sent to your email. If it does not arrive in a few minutes, check your spam folder or contact the seller."
        : "The payment was not completed. You can try again below.";
  }

  return (
    <>
      {notice && (
        <p role="status" className="mx-auto max-w-5xl px-5 pt-6 text-sm text-ink sm:px-8">
          {notice}
        </p>
      )}
      <ProductDetail
        product={product}
        state={productState(product, shop.settings.is_open)}
        back={routes.section(profile.username, "shop")}
        backLabel={shop.settings.home_title ?? "Shop"}
        links={legalLinks(shop.settings, routes.profile(profile.username))}
        email={shop.settings.contact_email}
        action={startCheckoutAction.bind(null, profile.username, product.slug)}
        error={rawError ? rawError.slice(0, 200) : null}
      />
    </>
  );
}