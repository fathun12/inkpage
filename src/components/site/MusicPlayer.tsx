"use client";

import { useState } from "react";
import type { MusicEmbed } from "@/lib/music";

// A small player in the bottom left corner. The player of YouTube or Spotify is only loaded after the visitor
// presses "Music" (browsers allow sound only after a click, and nothing from other sites loads before that).
// It lives in the shared layout, so the music keeps playing while the visitor moves between pages.
// Closing the panel only hides it: the music keeps playing.
export function MusicPlayer({ embed }: { embed: MusicEmbed }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  function toggle() {
    setLoaded(true);
    setOpen((o) => !o);
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2">
      <div
        id="music-panel"
        aria-hidden={!open}
        inert={!open}
        style={{ height: embed.height }}
        className={`w-[min(20rem,calc(100vw-2rem))] border border-line bg-bg transition-[opacity,transform] duration-(--dur-base) ease-out ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {loaded && (
          <iframe
            src={embed.src}
            title={embed.kind === "youtube" ? "YouTube player" : "Spotify player"}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="size-full border-0"
          />
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="music-panel"
        className="pointer-events-auto font-mono text-[11px] uppercase tracking-widest text-white underline decoration-1 underline-offset-4 mix-blend-difference"
      >
        {open ? "Close music" : "Music"}
        {loaded && <span aria-hidden className="ml-2 inline-block size-1.5 rounded-full bg-current align-middle" />}
      </button>
    </div>
  );
}