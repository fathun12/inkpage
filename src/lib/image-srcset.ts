// Lighter copies of a picture on Supabase Storage, made by Vercel (/_next/image).
// `sizes` is the width the picture is DRAWN at; the browser picks the smallest copy that is still sharp.
const stillOnStorage = /\/storage\/v1\/object\/public\/media\/.+\.(webp|jpe?g|png)$/i;

// Every width is in the default list of Next.js (imageSizes and deviceSizes), otherwise the address answers 400.
// Quality 80 is allowed in next.config.ts. A copy is never larger than the file itself.
const widths = [256, 384, 640, 828, 1200];

export function storageImage(src: string, sizes: string): { srcSet?: string; sizes?: string } {
  if (!stillOnStorage.test(src)) return {};
  const url = encodeURIComponent(src);
  const srcSet = widths.map((w) => `/_next/image?url=${url}&w=${w}&q=80 ${w}w`).join(", ");
  return { srcSet, sizes };
}