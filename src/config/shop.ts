import { routes } from "@/config/site";

// Every number of the shop lives here. Change a number and the whole shop follows.
export const shopConfig = {
  bucket: "shop-files",
  homeMax: 4,
  lowStockThreshold: 3,
  holdMinutes: 15,
  grantMaxDownloads: 5,
  grantDays: 30,
  signedUrlSeconds: 300,
  limits: {
    title: 80,
    description: 2000,
    includedLines: 10,
    includedLine: 120,
    licenseNote: 300,
    files: 5,
    fileMb: 50,
    fileName: 120,
    maxPriceUsdCents: 100000,
    maxPriceIdr: 10000000,
    maxStock: 100000,
    homeTitle: 60,
    legal: 20000,
    email: 120,
  },
} as const;

export const productStatuses = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const productStatusLabels: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

export const shopTabs = ["products", "settings"] as const;
export type ShopTab = (typeof shopTabs)[number];

export const shopTabLabels: Record<ShopTab, string> = {
  products: "Products",
  settings: "Settings",
};

export function resolveShopTab(value: string | null | undefined): ShopTab {
  return (shopTabs as readonly string[]).includes(value ?? "") ? (value as ShopTab) : "products";
}

// Address of a tab of the shop admin. "edit" keeps one product open.
export function shopHref(tab: ShopTab, edit?: string): string {
  return `${routes.shop}?tab=${tab}${edit ? `&edit=${edit}` : ""}`;
}