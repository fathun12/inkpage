import { mediaConfig } from "@/config/media";
import { loadImage } from "@/lib/image-crop";

const stills = ["image/jpeg", "image/png", "image/webp"];

// An animated WebP would turn into one still picture on a canvas, so it is left as it is.
// The WebP header tells: bytes 8 to 15 are "WEBPVP8X" and bit 2 of byte 20 means "animation".
export async function isAnimatedWebp(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const text = (from: number, to: number) =>
    Array.from(head.subarray(from, to), (c) => String.fromCharCode(c)).join("");
  return text(8, 16) === "WEBPVP8X" && ((head[20] ?? 0) & 0x02) !== 0;
}

// Makes a still picture lighter before it uploads: longest side at most maxPx (never enlarged), WebP at high quality.
// The new file is used ONLY when it is smaller than the original. Anything unusual (GIF, video, animated WebP,
// a browser that cannot write WebP, a picture too big to open) returns the original file untouched.
export async function prepareSiteImage(file: File): Promise<File> {
  const { maxPx, quality } = mediaConfig.siteMedia;
  if (!stills.includes(file.type)) return file;
  try {
    if (file.type === "image/webp" && (await isAnimatedWebp(file))) return file;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
      const base = file.name.replace(/\.[^.]+$/, "") || "image";
      return new File([blob], `${base}.webp`, { type: "image/webp" });
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return file;
  }
}