// Upload and block limits live here. Change a number and the whole app follows.
export const mediaConfig = {
  bucket: "media",
  // How long browsers may keep a public file. Every upload gets a new random name, so a year is safe.
  cacheSeconds: 31536000,
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
    maxAnimatedPerPage: 10,
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
  // Website media (hero, list background, gallery, About photo): the ORIGINAL file, straight from the browser.
  // The bucket limit is 10 MB (migration 20261119070000), so raising maxMb needs a new migration.
  siteMedia: {
    folder: "site",
    maxMb: 10,
    // Still pictures are made smaller in the browser before they upload (see lib/site-image.ts).
    // maxPx = longest side. quality 0 to 1. Raise either one if a picture ever looks soft.
    maxPx: 2560,
    quality: 0.92,
    types: [
      { mime: "image/jpeg", ext: "jpg" },
      { mime: "image/png", ext: "png" },
      { mime: "image/webp", ext: "webp" },
      { mime: "image/gif", ext: "gif" },
      { mime: "video/mp4", ext: "mp4" },
      { mime: "video/webm", ext: "webm" },
    ],
  },
} as const;
