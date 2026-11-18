// Upload and block limits live here. Change a number and the whole app follows.
export const mediaConfig = {
  bucket: "media",
  accept: "image/jpeg,image/png,image/webp",
  maxMb: 2,
  maxBytes: 2 * 1024 * 1024,
  maxGallery: 6,
  maxSocials: 8,
} as const;
