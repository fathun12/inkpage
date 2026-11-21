"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { mediaConfig } from "@/config/media";
import { loadImage, resizeToFile } from "@/lib/image-crop";

type Props = { id: string; name: string; allowGif: boolean };
type Status = { text: string; error: boolean };

const cm = mediaConfig.cardMedia;
const allowedTypes = cm.accept.split(",");
const MB = 1024 * 1024;
const kb = (bytes: number) => Math.max(1, Math.round(bytes / 1024));

function putFile(input: HTMLInputElement, file: File) {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
}

// File input for the image or GIF inside a card. NOT a crop: ImageInput would turn a GIF into a still JPEG.
// A still image is only shrunk (WebP, whole picture kept) and replaces the chosen file. A GIF is sent as it is.
// Size and GIF-count problems are caught here first, because the server redirects and would lose the form.
export function MediaInput({ id, name, allowGif }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // The form is reset after a save, so clear the preview too.
  useEffect(() => {
    const form = wrapRef.current?.closest("form");
    if (!form) return;
    function clear() {
      runRef.current += 1;
      setPreview(null);
      setStatus(null);
    }
    form.addEventListener("reset", clear);
    return () => form.removeEventListener("reset", clear);
  }, []);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    runRef.current += 1;
    const run = runRef.current;
    setPreview(null);
    if (!file) {
      setStatus(null);
      return;
    }

    function reject(text: string) {
      input.value = "";
      setPreview(null);
      setStatus({ text, error: true });
    }

    if (!allowedTypes.includes(file.type)) return reject("Use a JPG, PNG, WebP or GIF file.");

    if (file.type === "image/gif") {
      if (!allowGif) {
        return reject(
          `A page can have up to ${cm.maxAnimatedPerPage} GIFs in its cards. Remove a GIF from another card first.`,
        );
      }
      if (file.size > cm.maxGifMb * MB) {
        return reject(`This GIF is ${(file.size / MB).toFixed(1)} MB. The limit is ${cm.maxGifMb} MB.`);
      }
      setPreview(URL.createObjectURL(file));
      setStatus({ text: `GIF ready: ${kb(file.size)} KB.`, error: false });
      return;
    }

    if (file.size > cm.maxSourceMb * MB) {
      return reject(`This image is too large to prepare. Use one under ${cm.maxSourceMb} MB.`);
    }

    setStatus({ text: "Preparing image...", error: false });
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const out = await resizeToFile(img, cm.maxPx, cm.quality, file.name);
      if (run !== runRef.current) return;
      if (out.size > cm.maxImageMb * MB) {
        return reject(
          `Even after shrinking, this image is ${(out.size / MB).toFixed(1)} MB. The limit is ${cm.maxImageMb} MB. Use a smaller image.`,
        );
      }
      putFile(input, out);
      setPreview(URL.createObjectURL(out));
      setStatus({ text: `Ready to upload: ${kb(out.size)} KB.`, error: false });
    } catch {
      if (run === runRef.current) reject("This image could not be read. Try a JPG, PNG, WebP or GIF file.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">
      <Input id={id} name={name} type="file" accept={cm.accept} onChange={handleChange} />
      {preview && (
        <Img src={preview} className="ink-border h-24 w-auto max-w-full self-start rounded-sm bg-surface object-contain" />
      )}
      {status && (
        <p role="status" className={status.error ? "text-xs text-accent" : "font-mono text-xs text-ink-soft"}>
          {status.text}
        </p>
      )}
    </div>
  );
}