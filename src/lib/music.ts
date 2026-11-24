// Turns a pasted YouTube or Spotify link into a safe embed address. Only these two hosts are accepted, and the
// address is built from the ID, so nothing else the visitor-facing page loads can come from the link text.
export type MusicEmbed = { kind: "youtube" | "spotify"; src: string; height: number };

const youtubeId = /^[A-Za-z0-9_-]{11}$/;
const youtubeList = /^[A-Za-z0-9_-]{10,64}$/;
const spotifyId = /^[A-Za-z0-9]{10,40}$/;
const spotifyTypes = ["track", "album", "playlist", "episode", "show", "artist"];

export function musicEmbed(raw: string | null | undefined): MusicEmbed | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
  const parts = u.pathname.split("/").filter(Boolean);

  if (host === "open.spotify.com") {
    const rest = parts[0]?.startsWith("intl-") ? parts.slice(1) : parts;
    const [type, id] = rest;
    if (!type || !id || !spotifyTypes.includes(type) || !spotifyId.test(id)) return null;
    return {
      kind: "spotify",
      src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`,
      height: type === "track" || type === "episode" ? 152 : 352,
    };
  }

  let id: string | null = null;
  if (host === "youtu.be") {
    id = parts[0] ?? null;
  } else if (host === "youtube.com" || host === "music.youtube.com") {
    if (parts[0] === "watch") id = u.searchParams.get("v");
    else if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") id = parts[1] ?? null;
    else if (parts[0] !== "playlist") return null;
  } else {
    return null;
  }

  const listRaw = u.searchParams.get("list");
  const list = listRaw && youtubeList.test(listRaw) ? listRaw : null;
  const video = id && youtubeId.test(id) ? id : null;
  if (!video && !list) return null;
  const query = `${list ? `list=${list}&` : ""}autoplay=1&rel=0&playsinline=1`;
  return {
    kind: "youtube",
    src: `https://www.youtube-nocookie.com/embed/${video ?? "videoseries"}?${query}`,
    height: 200,
  };
}