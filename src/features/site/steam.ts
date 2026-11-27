import "server-only";
import { steamIdNumber } from "@/config/site-content";
import { env } from "@/lib/env";
import type { SteamData, SteamGame } from "@/types/steam";

const api = "https://api.steampowered.com";

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

// One call to the Steam Web API. Cached for 30 minutes. The key stays on the server and is never logged.
// Any failure gives null.
async function steam(path: string, params: Record<string, string>, key: string): Promise<unknown> {
  const query = new URLSearchParams({ ...params, key, format: "json" });
  try {
    const res = await fetch(`${api}${path}?${query}`, {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 1800 },
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// The "games" list of a Steam answer, read defensively.
function games(raw: unknown): SteamGame[] {
  const list = obj(obj(raw).response).games;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item): SteamGame[] => {
    const g = obj(item);
    const appid = num(g.appid);
    const name = str(g.name);
    if (!appid || !name) return [];
    return [
      {
        appid,
        name: name.slice(0, 100),
        recentMinutes: num(g.playtime_2weeks),
        totalMinutes: num(g.playtime_forever),
      },
    ];
  });
}

// Profile, recent games and most played games of one Steam user. Null when there is no key, no Steam ID,
// the profile is not public, or no game list could be read (so the section stays hidden).
export async function fetchSteam(steamId: string | null): Promise<SteamData | null> {
  const key = env.steamApiKey;
  const id = steamIdNumber(steamId);
  if (!key || !id) return null;

  const [rawSummary, rawRecent, rawOwned, rawLevel] = await Promise.all([
    steam("/ISteamUser/GetPlayerSummaries/v0002/", { steamids: id }, key),
    steam("/IPlayerService/GetRecentlyPlayedGames/v1/", { steamid: id, count: "6" }, key),
    steam("/IPlayerService/GetOwnedGames/v1/", { steamid: id, include_appinfo: "1", include_played_free_games: "1" }, key),
    steam("/IPlayerService/GetSteamLevel/v1/", { steamid: id }, key),
  ]);

  const players = obj(obj(rawSummary).response).players;
  const p = obj(Array.isArray(players) ? players[0] : null);
  const name = str(p.personaname);
  const avatar = str(p.avatarfull);
  // 3 = public. Anything else (private, friends only) stays hidden.
  if (!name || !avatar || !avatar.startsWith("https://") || num(p.communityvisibilitystate) !== 3) return null;

  const recent = games(rawRecent)
    .filter((g) => g.recentMinutes > 0)
    .sort((a, b) => b.recentMinutes - a.recentMinutes)
    .slice(0, 3);
  const owned = games(rawOwned);
  const top = owned
    .filter((g) => g.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 3);
  if (recent.length === 0 && top.length === 0) return null;

  const profileUrl = str(p.profileurl);
  const playing = str(p.gameextrainfo)?.slice(0, 100) ?? null;
  const levelRaw = obj(obj(rawLevel).response).player_level;

  return {
    id,
    name: name.slice(0, 60),
    avatar,
    href:
      profileUrl && profileUrl.startsWith("https://steamcommunity.com/")
        ? profileUrl
        : `https://steamcommunity.com/profiles/${id}`,
    level: typeof levelRaw === "number" ? levelRaw : null,
    state: playing ? "playing" : num(p.personastate) > 0 ? "online" : "offline",
    playing,
    owned: num(obj(obj(rawOwned).response).game_count) || owned.length,
    totalMinutes: owned.reduce((sum, g) => sum + g.totalMinutes, 0),
    recent,
    top,
  };
}