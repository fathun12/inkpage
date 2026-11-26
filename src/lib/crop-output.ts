import type { PixelArea } from "@/lib/image-crop";

export type CropOutput = {
  type: "webp" | "jpeg";
  // Longest side of the result in pixels. A picture is never enlarged.
  maxPx: number;
  // 0 to 1.
  quality: number;
};

// Cuts an area out of an image. The ratio is whatever the area has (free crop).
// WebP keeps transparency. A browser that cannot write WebP, and the "jpeg" type, get a white background.
export async function cropAreaToFile(
  img: HTMLImageElement,
  area: PixelArea,
  out: CropOutput,
  fileName: string,
): Promise<File> {
  const scale = Math.min(1, out.maxPx / Math.max(area.width, area.height));
  const w = Math.max(1, Math.round(area.width * scale));
  const h = Math.max(1, Math.round(area.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot process images.");
  ctx.imageSmoothingQuality = "high";

  const draw = () => ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, out.quality));

  let blob: Blob | null = null;
  let ext = "jpg";
  if (out.type === "webp") {
    draw();
    const webp = await toBlob("image/webp");
    if (webp && webp.type === "image/webp") {
      blob = webp;
      ext = "webp";
    }
  }
  if (!blob) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    draw();
    blob = await toBlob("image/jpeg");
    ext = "jpg";
  }
  if (!blob) throw new Error("Could not prepare this image.");
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.${ext}`, { type: blob.type });
}