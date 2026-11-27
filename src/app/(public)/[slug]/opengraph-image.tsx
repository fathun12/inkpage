import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { mediaConfig } from "@/config/media";
import { readBackground } from "@/config/background";
import { readSite } from "@/config/site-content";
import { cleanUrl } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { mediaKind, resolveHomeMedia } from "@/lib/site-view";

export const alt = "Profile preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const sans = "Instrument Sans";
// The same font as the brand in the header (font-voice = Instrument Serif, upright).
const voice = "Instrument Serif";

// Same dark look as the Home hero. Used when there is no hero picture that can be drawn.
const fallbackBg = "#140a0c";
const ink = "#ffffff";
const soft = "rgba(255, 255, 255, 0.82)";
const bandHeight = 56;
// Same limit as the upload (10 MB).
const photoMaxBytes = mediaConfig.backgroundPhoto.maxMb * 1024 * 1024;
const drawable = ["image/jpeg", "image/png", "image/webp"];

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 500; style: "normal" };

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function readFont(file: string): Promise<ArrayBuffer | null> {
  try {
    return toArrayBuffer(await readFile(join(process.cwd(), "src/assets/fonts", file)));
  } catch {
    return null;
  }
}

// Each font is optional. If none can be read, the default font is used.
async function loadFonts(): Promise<OgFont[] | undefined> {
  const [sansData, voiceData] = await Promise.all([
    readFont("instrument-sans-500.woff"),
    readFont("instrument-serif-regular.woff"),
  ]);
  const fonts: OgFont[] = [];
  if (sansData) fonts.push({ name: sans, data: sansData, weight: 500, style: "normal" });
  if (voiceData) fonts.push({ name: voice, data: voiceData, weight: 400, style: "normal" });
  return fonts.length > 0 ? fonts : undefined;
}

// The share image cannot draw WebP, so every picture is turned into a JPEG of the exact size (1200 x 630).
async function loadPicture(url: string): Promise<string | null> {
  if (mediaKind(url) !== "image") return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!res.ok || !drawable.includes(type)) return null;
    if (Number(res.headers.get("content-length") ?? 0) > photoMaxBytes) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > photoMaxBytes) return null;
    const jpeg = await sharp(bytes)
      .resize(size.width, size.height, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

// The first hero slide (of the first three) that can be drawn.
async function loadHero(slides: string[]): Promise<string | null> {
  for (const url of slides.slice(0, 3)) {
    const picture = await loadPicture(url);
    if (picture) return picture;
  }
  return null;
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());

  let slides: string[] = [];
  let caption = "";
  if (profile) {
    const site = readSite(profile.site);
    const blocks = await getPublicBlocks(profile.id);
    slides = resolveHomeMedia(site, readBackground(profile), blocks).hero;
    caption = (site.heroCaption ?? profile.bio ?? "").slice(0, 140);
  }

  const [fonts, hero] = await Promise.all([loadFonts(), loadHero(slides)]);

  const name = (profile?.display_name ?? siteConfig.name).slice(0, 40);
  const brand = profile?.username ?? "";
  // The address of the website (mfniam.com). Other accounts get an empty line.
  const home = profile ? cleanUrl(profile.username, "/") : null;
  const host = home ? new URL(home).host : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          background: fallbackBg,
          color: ink,
          padding: `40px 64px ${bandHeight + 40}px 64px`,
          fontFamily: sans,
        }}
      >
        {hero ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero}
              alt=""
              width={1200}
              height={630}
              style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                width: 1200,
                height: 630,
                background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.7))",
              }}
            />
          </>
        ) : null}

        <div style={{ display: "flex", fontFamily: voice, fontSize: 132, lineHeight: 1, letterSpacing: -2 }}>
          {brand}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 500, letterSpacing: -2, lineHeight: 1.05 }}>
            {name}
          </div>
          {caption ? <div style={{ display: "flex", fontSize: 32, color: soft }}>{caption}</div> : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            left: 0,
            bottom: 0,
            width: 1200,
            height: bandHeight,
            background: "#000000",
            color: ink,
            padding: "0 64px",
            fontSize: 24,
            letterSpacing: 2,
          }}
        >
          {host}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}