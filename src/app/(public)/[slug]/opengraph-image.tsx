import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { mediaConfig } from "@/config/media";
import { resolveTheme, siteConfig } from "@/config/site";
import { getProfileByUsername } from "@/features/profile/queries";
import { readCustomTheme } from "@/config/custom-theme";
import { ogColors } from "@/styles/og-palette";

export const alt = "Profile preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const sans = "Instrument Sans";
const voice = "Instrument Serif";

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

// Fonts are copied into src/assets/fonts. If they cannot be read, the default font is used.
async function loadFonts() {
  try {
    const [sansFile, voiceFile] = await Promise.all([
      readFile(join(process.cwd(), "src/assets/fonts/instrument-sans-500.woff")),
      readFile(join(process.cwd(), "src/assets/fonts/instrument-serif-italic.woff")),
    ]);
    return [
      { name: sans, data: toArrayBuffer(sansFile), weight: 500 as const, style: "normal" as const },
      { name: voice, data: toArrayBuffer(voiceFile), weight: 400 as const, style: "italic" as const },
    ];
  } catch {
    return undefined;
  }
}

// The share image draws PNG and JPEG reliably, so other formats fall back to the initial.
async function loadAvatar(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!res.ok || (type !== "image/jpeg" && type !== "image/png")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > mediaConfig.maxBytes) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  const p = ogColors(resolveTheme(profile?.theme), readCustomTheme(profile ?? {}));
  const [fonts, avatar] = await Promise.all([loadFonts(), loadAvatar(profile?.avatar_url)]);

  const name = (profile?.display_name ?? siteConfig.name).slice(0, 40);
  const initial = name.trim().charAt(0).toUpperCase();
  const handle = profile ? `@${profile.username}` : "";
  const bio = profile?.bio ? profile.bio.slice(0, 140) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: p.bg,
          color: p.ink,
          padding: 80,
          fontFamily: sans,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              borderRadius: 60,
              background: p.accent,
              color: p.bg,
              overflow: "hidden",
              fontSize: 64,
              fontWeight: 500,
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" width={120} height={120} style={{ width: 120, height: 120, objectFit: "cover" }} />
            ) : (
              initial
            )}
          </div>
          <div style={{ display: "flex", fontFamily: voice, fontStyle: "italic", fontSize: 42, color: p.soft }}>
            {handle}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 500, letterSpacing: -3, lineHeight: 1.02 }}>
            {name}
          </div>
          {bio ? <div style={{ display: "flex", fontSize: 38, color: p.soft }}>{bio}</div> : null}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: p.soft }}>{siteConfig.name}</div>
      </div>
    ),
    { ...size, fonts },
  );
}