"use server";

import { shopConfig, shopHref } from "@/config/shop";
import { requireUser } from "@/features/auth/queries";
import { redirectWithError, redirectWithSaved } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import type { AddedShopFile, ShopSignInput, ShopSignResult } from "@/types/shop";
import { readProductForm, readSettingsForm } from "./schema";
import { readProductMedia, sweepSiteFiles } from "./media";
import { listProductObjects, signShopFile, sweepProductFiles } from "./upload";

type Db = Awaited<ReturnType<typeof createClient>>;

function dbMessage(error: { code?: string; message: string }): string {
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "The shop tables do not exist yet. Run the newest migration (20261124020000_shop_foundation.sql) in Supabase, then try again.";
  }
  return `Could not save: ${error.message}`;
}

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "product";
}

// The slug is made once, from the title, and stays the same when the title changes (stable links).
async function uniqueSlug(supabase: Db, userId: string, title: string): Promise<string> {
  const base = slugify(title);
  const { data } = await supabase.from("products").select("slug").eq("user_id", userId).like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((row: { slug: string }) => row.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${Date.now()}`;
}

async function savedPaths(supabase: Db, productId: string): Promise<string[]> {
  const { data } = await supabase.from("product_files").select("path").eq("product_id", productId);
  return (data ?? []).map((row: { path: string }) => row.path);
}

// Called by the browser before it uploads a file straight to the private bucket.
export async function signShopFileAction(input: ShopSignInput): Promise<ShopSignResult> {
  const user = await requireUser();
  return signShopFile(user.id, input);
}

export async function createProductAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = shopHref("products");
  const read = readProductForm(formData);
  if ("error" in read) return redirectWithError(back, read.error);

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("products")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const slug = await uniqueSlug(supabase, user.id, read.data.title);
  const media = await readProductMedia(user.id, formData, []);
  if ("error" in media) {
    await sweepSiteFiles(user.id);
    return redirectWithError(back, media.error);
  }
  const { data, error } = await supabase
    .from("products")
    .insert({ user_id: user.id, slug, position: (last?.position ?? -1) + 1, ...read.data, media: media.list })
    .select("id")
    .single();
  await sweepSiteFiles(user.id);
  if (error || !data) return redirectWithError(back, dbMessage(error ?? { message: "No row came back." }));
  redirectWithSaved(shopHref("products", data.id), "Product created. You can add files now.");
}

export async function saveProductAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = field(formData, "id");
  if (!id) return redirectWithError(shopHref("products"), "The product id is missing.");
  const back = shopHref("products", id);
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, media")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!product) return redirectWithError(shopHref("products"), "That product does not exist anymore.");

  // Files uploaded but not saved are lost after a redirect, so they are deleted on every failure.
  const abort = async (message: string): Promise<void> => {
    await sweepProductFiles(user.id, id, await savedPaths(supabase, id));
    await sweepSiteFiles(user.id);
    return redirectWithError(back, message);
  };

  const read = readProductForm(formData);
  if ("error" in read) return abort(read.error);
  const media = await readProductMedia(user.id, formData, product.media);
  if ("error" in media) return abort(media.error);

  const prefix = `${user.id}/${id}/`;
  const added: AddedShopFile[] = [];
  for (const raw of formData.getAll("add_file")) {
    if (typeof raw !== "string") continue;
    try {
      const file = JSON.parse(raw) as Partial<AddedShopFile>;
      if (
        typeof file.path === "string" &&
        file.path.startsWith(prefix) &&
        !file.path.slice(prefix.length).includes("/") &&
        typeof file.name === "string" &&
        file.name.trim() !== ""
      ) {
        added.push({
          path: file.path,
          name: file.name.slice(0, shopConfig.limits.fileName),
          size: Number.isFinite(file.size) ? Number(file.size) : 0,
        });
      }
    } catch {
      // Not a file we know: ignore it.
    }
  }
  const removeIds = new Set(formData.getAll("remove_file").filter((x): x is string => typeof x === "string"));

  const { data: existing } = await supabase.from("product_files").select("id, position").eq("product_id", id);
  const rows = (existing ?? []) as { id: string; position: number }[];
  const kept = rows.filter((row) => !removeIds.has(row.id));
  if (kept.length + added.length > shopConfig.limits.files) {
    return abort(`A product can hold up to ${shopConfig.limits.files} files. Remove some first.`);
  }

  if (added.length > 0) {
    const present = new Set(await listProductObjects(user.id, id));
    const missing = added.find((file) => !present.has(file.path));
    if (missing) return abort(`${missing.name} was not uploaded. Choose it again.`);
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ ...read.data, media: media.list, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (updateError) return abort(dbMessage(updateError));

  if (removeIds.size > 0) {
    const { error } = await supabase.from("product_files").delete().in("id", [...removeIds]).eq("product_id", id);
    if (error) return abort(dbMessage(error));
  }
  if (added.length > 0) {
    const start = kept.reduce((max, row) => Math.max(max, row.position), -1) + 1;
    const { error } = await supabase.from("product_files").insert(
      added.map((file, i) => ({
        product_id: id,
        user_id: user.id,
        path: file.path,
        name: file.name,
        size_bytes: file.size,
        position: start + i,
      })),
    );
    if (error) return abort(dbMessage(error));
  }

  await sweepProductFiles(user.id, id, await savedPaths(supabase, id));
  await sweepSiteFiles(user.id);
  redirectWithSaved(back, "Saved.");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = field(formData, "id");
  if (!id) return redirectWithError(shopHref("products"), "The product id is missing.");
  const back = shopHref("products", id);
  if (formData.get("confirm") !== "on") {
    return redirectWithError(back, "Tick the box to confirm that you want to delete this product.");
  }

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id)
    .eq("user_id", user.id);
  if (countError) return redirectWithError(back, dbMessage(countError));
  if ((count ?? 0) > 0) {
    return redirectWithError(back, "This product already has orders, so it cannot be deleted. Set its status to Archived instead.");
  }

  const paths = await listProductObjects(user.id, id);
  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id);
  if (error) return redirectWithError(back, dbMessage(error));
  if (paths.length > 0) await supabase.storage.from(shopConfig.bucket).remove(paths);
  await sweepSiteFiles(user.id);
  redirectWithSaved(shopHref("products"), "Product deleted.");
}

export async function moveProductAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = shopHref("products");
  const id = field(formData, "id");
  const dir = field(formData, "dir");
  if (!id || (dir !== "up" && dir !== "down")) return redirectWithError(back, "That move is not valid.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, position")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return redirectWithError(back, dbMessage(error));

  const list = (data ?? []) as { id: string; position: number }[];
  const from = list.findIndex((p) => p.id === id);
  const to = dir === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= list.length) return redirectWithSaved(back, "Saved.");

  const order = [...list];
  [order[from], order[to]] = [order[to], order[from]];
  for (let i = 0; i < order.length; i++) {
    if (order[i].position === i) continue;
    const { error: moveError } = await supabase
      .from("products")
      .update({ position: i })
      .eq("id", order[i].id)
      .eq("user_id", user.id);
    if (moveError) return redirectWithError(back, dbMessage(moveError));
  }
  redirectWithSaved(back, "Saved.");
}

// Quick refill from the product list. Empty = unlimited.
export async function setStockAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = shopHref("products");
  const id = field(formData, "id");
  if (!id) return redirectWithError(back, "The product id is missing.");

  const text = field(formData, "stock");
  let stock: number | null = null;
  if (text !== undefined) {
    if (!/^\d+$/.test(text) || Number(text) > shopConfig.limits.maxStock) {
      return redirectWithError(back, "Stock must be a whole number, or empty for unlimited.");
    }
    stock = Number(text);
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ stock, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return redirectWithError(back, dbMessage(error));
  redirectWithSaved(back, "Stock saved.");
}

export async function saveShopSettingsAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const back = shopHref("settings");
  const read = readSettingsForm(formData);
  if ("error" in read) return redirectWithError(back, read.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("shop_settings")
    .upsert({ user_id: user.id, ...read.data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return redirectWithError(back, dbMessage(error));
  redirectWithSaved(back, "Saved.");
}