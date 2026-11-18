import { ImageResponse } from "next/og";
import { resolveTheme, siteConfig } from "@/config/site";
import { getProfileByUsername } from "@/features/profile/queries";
import { ogPalette } from "@/styles/og-palette";

export const alt = "Profile preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  const p = ogPalette[resolveTheme(profile?.theme)];

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
              background: p.accent,
              border: `4px solid ${p.ink}`,
              fontSize: 72,
              fontWeight: 800,
            }}
          >
            {initial}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: p.soft }}>{handle}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
          {bio ? <div style={{ display: "flex", fontSize: 38, color: p.soft }}>{bio}</div> : null}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: p.soft }}>{siteConfig.name}</div>
      </div>
    ),
    { ...size },
  );
}
