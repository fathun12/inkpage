import { cache } from "react";
import { legalKinds, legalTitles, type LegalKind } from "@/config/shop";
import { routes } from "@/config/site";
import { getProfileByUsername } from "@/features/profile/queries";
import { createClient } from "@/lib/supabase/server";
import type { Product, ShopSettings } from "@/types/shop";
import { emptySettings } from "./queries";
import { expireHolds } from "./stock";

function cleanProduct(row: Product): Product {
  return {
    ...row,
    media: Array.isArray(row.media)
      ? row.media.filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u))
      : [],
    included: Array.isArray(row.included) ? row.included.filter((x): x is string => typeof x === "string") : [],
  };
}

// What a visitor may read: the settings and the ACTIVE products. Never throws: a broken shop must not break the website.
export const getPublicShop = cache(
  async (userId: string): Promise<{ settings: ShopSettings; products: Product[] }> => {
    // Stock of orders whose hold ran out comes back before the shop is read.
    await expireHolds();
    const supabase = await createClient();
    const [settings, products] = await Promise.all([
      supabase
        .from("shop_settings")
        .select("is_open, home_title, terms, privacy, refund, contact_email")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);
    if (settings.error || products.error) {
      console.error("getPublicShop failed", settings.error?.message ?? products.error?.message);
      return { settings: emptySettings, products: [] };
    }
    return {
      settings: (settings.data as ShopSettings | null) ?? emptySettings,
      products: ((products.data ?? []) as Product[]).map(cleanProduct),
    };
  },
);

// Links to the legal pages that have a text.
export function legalLinks(settings: ShopSettings, base: string): { label: string; href: string }[] {
  return legalKinds.filter((kind) => settings[kind]).map((kind) => ({ label: legalTitles[kind], href: `${base}/${kind}` }));
}

// One legal page. null = no such profile or no text yet (the page shows "not found").
export const getLegal = cache(async (slug: string, kind: LegalKind) => {
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return null;
  const { settings } = await getPublicShop(profile.id);
  const text = settings[kind];
  if (!text) return null;
  return {
    profile,
    title: legalTitles[kind],
    text,
    email: settings.contact_email,
    shopHref: routes.section(profile.username, "shop"),
  };
});