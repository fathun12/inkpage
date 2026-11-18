// Crop settings for every image upload. Change sizes and ratios here, not in components.
export const cropPresets = {
  avatar: { aspect: 1, maxPx: 512 },
  photo: { aspect: 1, maxPx: 640 },
  cover: { aspect: 16 / 9, maxPx: 1280 },
  gallery: { aspect: 1, maxPx: 1080 },
  background: { aspect: 4 / 5, maxPx: 1600 },
} as const;

export type CropKind = keyof typeof cropPresets;

// JPEG quality of the cropped file (0 to 1).
export const cropQuality = 0.88;