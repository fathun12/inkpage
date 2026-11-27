"use client";

import { useState, useSyncExternalStore } from "react";

type Props = {
  // The clean address on the main domain. null = use the address in the browser.
  url: string | null;
  title: string;
};

const noop = () => () => {};
const button = "font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink";

// Share: the phone's own share sheet when there is one, otherwise copy link, WhatsApp, X and Facebook.
export function ShareButtons({ url, title }: Props) {
  const canShare = useSyncExternalStore(
    noop,
    () => typeof navigator.share === "function",
    () => false,
  );
  const [note, setNote] = useState<string | null>(null);

  const link = () => url ?? window.location.href.split("#")[0];

  function say(text: string) {
    setNote(text);
    window.setTimeout(() => setNote(null), 2000);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
      say("Link copied");
    } catch {
      say("Could not copy the link");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: link() });
    } catch {
      // the reader closed the share sheet
    }
  }

  function open(address: string) {
    window.open(address, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Share</span>
      {canShare && (
        <button type="button" onClick={nativeShare} className={button}>
          Open share menu
        </button>
      )}
      <button type="button" onClick={copy} className={button}>
        Copy link
      </button>
      {!canShare && (
        <>
          <button
            type="button"
            onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${link()}`)}`)}
            className={button}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() =>
              open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(link())}`)
            }
            className={button}
          >
            X
          </button>
          <button
            type="button"
            onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link())}`)}
            className={button}
          >
            Facebook
          </button>
        </>
      )}
      <span role="status" className="font-mono text-[11px] tracking-wide text-ink-soft">
        {note}
      </span>
    </div>
  );
}