export type PixelArea = { x: number; y: number; width: number; height: number };

// Biggest area of the given ratio, centred in an image.
export function centerArea(width: number, height: number, aspect: number): PixelArea {
  const fitsWidth = width / aspect <= height;
  const w = fitsWidth ? width : height * aspect;
  const h = fitsWidth ? width / aspect : height;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this image."));
    img.src = src;
  });
}

// Cuts the area out of the image, shrinks it to maxPx wide and returns a JPEG file.
export async function cropToFile(
  img: HTMLImageElement,
  area: PixelArea,
  aspect: number,
  maxPx: number,
  quality: number,
  fileName: string,
): Promise<File> {
  const outW = Math.max(1, Math.round(Math.min(area.width, maxPx)));
  const outH = Math.max(1, Math.round(outW / aspect));
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot process images.");

  // JPEG has no transparency, so transparent PNG areas become white.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outW, outH);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Could not prepare this image.");
  return new File([blob], fileName, { type: "image/jpeg" });
}