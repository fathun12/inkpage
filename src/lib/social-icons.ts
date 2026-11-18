import {
  siApplemusic,
  siBehance,
  siBluesky,
  siBuymeacoffee,
  siDiscord,
  siDribbble,
  siFacebook,
  siGithub,
  siGitlab,
  siInstagram,
  siKofi,
  siLine,
  siMedium,
  siPatreon,
  siPinterest,
  siReddit,
  siSnapchat,
  siSoundcloud,
  siSpotify,
  siSteam,
  siSubstack,
  siTelegram,
  siThreads,
  siTiktok,
  siTumblr,
  siTwitch,
  siVimeo,
  siWhatsapp,
  siX,
  siYoutube,
} from "simple-icons";

export type SocialGlyph = { path: string; evenodd: boolean };

const glyph = (icon: { path: string }): SocialGlyph => ({ path: icon.path, evenodd: false });

// simple-icons has no LinkedIn mark, so it is drawn by hand: a rounded square with "in" cut out.
const linkedin: SocialGlyph = {
  evenodd: true,
  path: "M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zM7.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM6 10.5h3V18H6zM11 10.5h2.9v1.1c.5-.8 1.4-1.3 2.6-1.3 2.1 0 3 1.4 3 3.6V18h-3v-3.8c0-1-.3-1.7-1.3-1.7-1 0-1.2.8-1.2 1.7V18H11z",
};

// Domain to logo. Subdomains match too (open.spotify.com, m.facebook.com, ...).
const byDomain: Record<string, SocialGlyph> = {
  "instagram.com": glyph(siInstagram),
  "youtube.com": glyph(siYoutube),
  "youtu.be": glyph(siYoutube),
  "facebook.com": glyph(siFacebook),
  "fb.com": glyph(siFacebook),
  "tiktok.com": glyph(siTiktok),
  "x.com": glyph(siX),
  "twitter.com": glyph(siX),
  "threads.net": glyph(siThreads),
  "threads.com": glyph(siThreads),
  "github.com": glyph(siGithub),
  "gitlab.com": glyph(siGitlab),
  "linkedin.com": linkedin,
  "twitch.tv": glyph(siTwitch),
  "discord.gg": glyph(siDiscord),
  "discord.com": glyph(siDiscord),
  "t.me": glyph(siTelegram),
  "wa.me": glyph(siWhatsapp),
  "whatsapp.com": glyph(siWhatsapp),
  "spotify.com": glyph(siSpotify),
  "music.apple.com": glyph(siApplemusic),
  "soundcloud.com": glyph(siSoundcloud),
  "medium.com": glyph(siMedium),
  "substack.com": glyph(siSubstack),
  "reddit.com": glyph(siReddit),
  "pinterest.com": glyph(siPinterest),
  "snapchat.com": glyph(siSnapchat),
  "bsky.app": glyph(siBluesky),
  "behance.net": glyph(siBehance),
  "dribbble.com": glyph(siDribbble),
  "tumblr.com": glyph(siTumblr),
  "vimeo.com": glyph(siVimeo),
  "patreon.com": glyph(siPatreon),
  "ko-fi.com": glyph(siKofi),
  "buymeacoffee.com": glyph(siBuymeacoffee),
  "steamcommunity.com": glyph(siSteam),
  "steampowered.com": glyph(siSteam),
  "line.me": glyph(siLine),
};

export function socialGlyph(url: string): SocialGlyph | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const [domain, icon] of Object.entries(byDomain)) {
      if (host === domain || host.endsWith(`.${domain}`)) return icon;
    }
  } catch {
    // Not a valid address: no icon.
  }
  return null;
}