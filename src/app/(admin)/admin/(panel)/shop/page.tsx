import type { Metadata } from "next";
import { ShopProducts } from "@/components/admin/ShopProducts";
import { ShopSettingsForm } from "@/components/admin/ShopSettingsForm";
import { ShopTabs } from "@/components/admin/ShopTabs";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { resolveShopTab } from "@/config/shop";
import { requireUser } from "@/features/auth/queries";
import {
  createProductAction,
  deleteProductAction,
  moveProductAction,
  saveProductAction,
  saveShopSettingsAction,
  setStockAction,
  signShopFileAction,
} from "@/features/shop/actions";
import { emptySettings, getOwnProducts, getShopSettings } from "@/features/shop/queries";
import { signSiteUploadAction } from "@/features/site/actions";
import { savedText } from "@/lib/flash";

export const metadata: Metadata = { title: "Shop" };

type Props = {
  searchParams: Promise<{ error?: string; saved?: string; t?: string; tab?: string; edit?: string }>;
};

const productActions = {
  create: createProductAction,
  save: saveProductAction,
  remove: deleteProductAction,
  move: moveProductAction,
  setStock: setStockAction,
  sign: signShopFileAction,
  signMedia: signSiteUploadAction,
};

export default async function ShopPage({ searchParams }: Props) {
  const { error, saved, t, tab: rawTab, edit } = await searchParams;
  const tab = resolveShopTab(rawTab);
  const user = await requireUser();
  const formKey = `${tab}-${t ?? "initial"}`;
  const products = tab === "products" ? await getOwnProducts(user.id) : [];
  const settings = tab === "settings" ? await getShopSettings(user.id) : emptySettings;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-display text-4xl font-black">Shop</h1>
      <ShopTabs current={tab} />
      {error && <FlashNotice key={t} tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice key={t} tone="ok">{savedText(saved)}</FlashNotice>}

      {tab === "products" && (
        <ShopProducts products={products} openId={edit ?? null} actions={productActions} formKey={formKey} />
      )}
      {tab === "settings" && <ShopSettingsForm key={formKey} action={saveShopSettingsAction} settings={settings} />}
    </div>
  );
}