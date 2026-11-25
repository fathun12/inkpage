"use client";

import { useEffect, useId, useRef, useState } from "react";

const message =
  "I'd rather not be contacted on WhatsApp. Please reach me by email or through one of the other links.";

type Props = { number: string | null; className?: string };

// With a number: a normal link to WhatsApp. Without one: the line still shows,
// and a click opens a small note that the owner prefers other ways of contact.
export function WhatsAppLink({ number, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (number) {
    return (
      <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer" className={className}>
        WhatsApp <span aria-hidden>↗</span>
      </a>
    );
  }

  return (
    <span ref={box} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        className={`${className} cursor-pointer text-left`}
      >
        WhatsApp
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-0 top-full z-10 mt-2 w-60 border border-band-ink bg-band p-3 text-xs leading-snug text-band-ink"
        >
          {message}
        </span>
      )}
    </span>
  );
}