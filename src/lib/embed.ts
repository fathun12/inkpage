export type Embed = { provider: "youtube" | "spotify"; src: string; height: number | null };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const SPOTIFY_PATH =
  /^\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]{10,30})/;

function youtube(id: string | null | undefined): Embed | null {
  if (!id || !YOUTUBE_ID.test(id)) return null;
  return { provider: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}`, height: null };
}

// Turns a normal YouTube or Spotify link into a safe embed address. Anything else returns null.
export function parseEmbed(value: string): Embed | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www|m)\./, "");

  if (host === "youtu.be") return youtube(url.pathname.split("/")[1]);

  if (host === "youtube.com") {
    if (url.pathname === "/playlist") {
      const list = url.searchParams.get("list");
      if (!list || !/^[A-Za-z0-9_-]+$/.test(list)) return null;
      return {
        provider: "youtube",
        src: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`,
        height: null,
      };
    }
    const [, kind, id] = url.pathname.split("/");
    if (kind === "shorts" || kind === "embed" || kind === "live") return youtube(id);
    return youtube(url.searchParams.get("v"));
  }

  if (host === "open.spotify.com") {
    const match = SPOTIFY_PATH.exec(url.pathname);
    if (!match) return null;
    const [, kind, id] = match;
    return {
      provider: "spotify",
      src: `https://open.spotify.com/embed/${kind}/${id}`,
      height: kind === "track" || kind === "episode" ? 152 : 352,
    };
  }

  return null;
}
