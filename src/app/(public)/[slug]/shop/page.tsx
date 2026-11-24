import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopLinks } from "@/components/shop/ShopLinks";
import { PageIntro } from "@/components/site/PageIntro";
import { VisitCards } from "@/components/site/VisitCards";
import { readSite } from "@/config/site-content";
import { routes } from "@/config/site";
import { getProfileByUsername } from "@/features/profile/queries";
import { getPublicShop, legalLinks } from "@/features/shop/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const { settings } = await getPublicShop(profile.id);
  return { title: `${settings.home_title ?? "Shop"} · ${profile.display_name}` };
}

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const { settings, products } = await getPublicShop(profile.id);
  const site = readSite(profile.site);

  return (
    <>
      <PageIntro
        title={settings.home_title ?? "Shop"}
        intro={settings.is_open ? null : "The shop is closed right now."}
      />
      {products.length > 0 ? (
        <ProductGrid products={products} open={settings.is_open} base={routes.section(profile.username, "shop")} />
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">Nothing here yet.</p>
      )}
      <VisitCards items={site.visits} title={site.visitTitle ?? "Visit website"} />
      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <ShopLinks links={legalLinks(settings, routes.profile(profile.username))} email={settings.contact_email} />
      </div>
    </>
  );
}