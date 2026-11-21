// Upload and block limits live here. Change a number and the whole app follows.
export const mediaConfig = {
  bucket: "media",
  accept: "image/jpeg,image/png,image/webp",
  maxMb: 2,
  maxBytes: 2 * 1024 * 1024,
  maxGallery: 6,
  maxSocials: 8,
  // Image or GIF inside a link or project card.
  cardMedia: {
    accept: "image/jpeg,image/png,image/webp,image/gif",
    maxImageMb: 2,
    maxGifMb: 3,
    maxSourceMb: 20, // the browser shrinks still images, but refuses to open a huge file
    maxAnimatedPerPage: 3,
    maxPx: 1280, // longest side after shrinking
    quality: 0.85,
  },
  // Background photo: uploaded as the ORIGINAL file (no crop, no shrinking), straight from the browser.
  // The bucket limit (migration 20261119070000) is 10 MB, so raising this needs a new migration.
  backgroundPhoto: {
    folder: "bg-photo",
    maxMb: 10,
    accept: "image/jpeg,image/png,image/webp",
    types: [
      { mime: "image/jpeg", ext: "jpg" },
      { mime: "image/png", ext: "png" },
      { mime: "image/webp", ext: "webp" },
    ],
  },
} as const;
