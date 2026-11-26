// Crop settings for every image upload. Change sizes and ratios here, not in components.
export const cropPresets = {
  avatar: { aspect: 1, maxPx: 512 },
  photo: { aspect: 1, maxPx: 640 },
  cover: { aspect: 16 / 9, maxPx: 1280 },
  gallery: { aspect: 1, maxPx: 1080 },
  background: { aspect: 4 / 5, maxPx: 2000 },
} as const;

export type CropKind = keyof typeof cropPresets;

// JPEG quality of the cropped file (0 to 1).
export const cropQuality = 0.88;

// The ratios of the crop window. a is the longer side, b the shorter one.
// The window also offers Free, and Portrait or Landscape for every ratio except 1:1.
// "aspect" in the presets above is only the ratio the window opens with. maxPx is the LONGEST side of the result.
export const cropRatios = [
  { id: "1:1", a: 1, b: 1 },
  { id: "4:5", a: 5, b: 4 },
  { id: "3:2", a: 3, b: 2 },
  { id: "16:9", a: 16, b: 9 },
] as const;
export type CropRatioId = "free" | (typeof cropRatios)[number]["id"];

// Shop product pictures: square. css is the aspect-ratio of the card and the product page.
export const productCrop = { aspect: 1, css: "1 / 1" } as const;