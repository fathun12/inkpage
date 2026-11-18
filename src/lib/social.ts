import type { SocialItem } from "@/types/block";

const known: Record<string, string> = {
  "instagram.com": "Instagram",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "github.com": "GitHub",
  "x.com": "X",
  "twitter.com": "X",
  "tiktok.com": "TikTok",
  "facebook.com": "Facebook",
  "fb.com": "Facebook",
  "linkedin.com": "LinkedIn",
  "threads.net": "Threads",
  "threads.com": "Threads",
  "twitch.tv": "Twitch",
  "discord.gg": "Discord",
  "discord.com": "Discord",
  "t.me": "Telegram",
  "wa.me": "WhatsApp",
  "spotify.com": "Spotify",
  "medium.com": "Medium",
  "reddit.com": "Reddit",
  "pinterest.com": "Pinterest",
  "behance.net": "Behance",
  "dribbble.com": "Dribbble",
  "gitlab.com": "GitLab",
  "snapchat.com": "Snapchat",
  "bsky.app": "Bluesky",
  "patreon.com": "Patreon",
  "ko-fi.com": "Ko-fi",
  "substack.com": "Substack",
  "soundcloud.com": "SoundCloud",
  "music.apple.com": "Apple Music",
  "vimeo.com": "Vimeo",
  "tumblr.com": "Tumblr",
  "buymeacoffee.com": "Buy Me a Coffee",
  "steamcommunity.com": "Steam",
  "steampowered.com": "Steam",
  "whatsapp.com": "WhatsApp",
  "line.me": "LINE",
};

export function splitLines(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function socialLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const [domain, label] of Object.entries(known)) {
      if (host === domain || host.endsWith(`.${domain}`)) return label;
    }
    return host;
  } catch {
    return url;
  }
}

export function toSocialItems(lines: string[]): SocialItem[] {
  return lines.map((url) => ({ label: socialLabel(url), url }));
}
