import { articleImages } from "@/config/article";
import { loadImage, resizeToFile } from "@/lib/image-crop";

const MB = 1024 * 1024;
const allowed = articleImages.accept.split(",");

type Prepared = { file: File } | { error: string };

export function imageFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

function checkSource(file: File): string | null {
  if (!allowed.includes(file.type)) return "Use a JPG, PNG or WebP picture (GIFs are not supported in articles).";
  if (file.size > articleImages.maxSourceMb * MB) {
    return `This picture is too large to prepare. Use one under ${articleImages.maxSourceMb} MB.`;
  }
  return null;
}

function checkResult(file: File): string | null {
  if (file.size <= articleImages.maxMb * MB) return null;
  return `Even after shrinking, this picture is ${(file.size / MB).toFixed(1)} MB. The limit is ${articleImages.maxMb} MB.`;
}

// A picture inside the text: shrunk to WebP, the whole picture kept.
export async function prepareArticleImage(source: File): Promise<Prepared> {
  const problem = checkSource(source);
  if (problem) return { error: problem };
  const url = URL.createObjectURL(source);
  try {
    const img = await loadImage(url);
    const file = await resizeToFile(img, articleImages.maxPx, articleImages.quality, source.name);
    const big = checkResult(file);
    return big ? { error: big } : { file };
  } catch {
    return { error: "This picture could not be read. Try a JPG, PNG or WebP file." };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, articleImages.quality));
}

// The cover: the middle of the picture, cut to 2:1.
export async function prepareCover(source: File): Promise<Prepared> {
  const problem = checkSource(source);
  if (problem) return { error: problem };
  const url = URL.createObjectURL(source);
  try {
    const img = await loadImage(url);
    const { width, height } = articleImages.cover;
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { error: "This browser cannot prepare the cover." };
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
    let blob = await encode(canvas, "image/webp");
    if (!blob || blob.type !== "image/webp") blob = await encode(canvas, "image/jpeg");
    if (!blob) return { error: "This picture could not be prepared." };
    const file = new File([blob], `cover.${blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type });
    const big = checkResult(file);
    return big ? { error: big } : { file };
  } catch {
    return { error: "This picture could not be read. Try a JPG, PNG or WebP file." };
  } finally {
    URL.revokeObjectURL(url);
  }
}