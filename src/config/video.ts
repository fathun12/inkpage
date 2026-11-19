// Background video and GIF settings. Change limits here, not in components.
export const videoConfig = {
  folder: "bg-video",
  maxSeconds: 30,
  videoMaxMb: 10,
  gifMaxMb: 5,
} as const;

export const videoTypes = [
  { mime: "video/mp4", ext: "mp4" },
  { mime: "video/webm", ext: "webm" },
  { mime: "image/gif", ext: "gif" },
] as const;

export const videoAccept = videoTypes.map((t) => t.mime).join(",");

export function isGifUrl(url: string): boolean {
  return /\.gif(\?.*)?$/i.test(url);
}