"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { itemLimits } from "@/config/item-data";
import { mediaConfig } from "@/config/media";
import { uploadToSignedPath } from "@/lib/direct-upload";
import type { VideoSignAction } from "@/types/media";

type Props = { index: number; id: string; current: string | null; sign: VideoSignAction };
type Note = { tone: "info" | "error"; text: string } | null;

const allowed = ["image/png", "image/webp"];

// The own logo of one Download button. The file uploads straight to Storage as soon as it is picked.
// Only its storage path travels with the form (dl_logo_file_N). An older logo travels as dl_logo_keep_N.
export function DownloadLogoInput({ index, id, current, sign }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<string | null>(null);
  const [path, setPath] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dropped, setDropped] = useState(false);
  const [note, setNote] = useState<Note>(null);

  const shown = preview ?? (dropped ? null : current);
  const keep = !dropped && !path && current ? current : "";

  function lockSave(locked: boolean) {
    const form = wrapRef.current?.closest("form");
    form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((button) => {
      button.disabled = locked;
    });
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (!allowed.includes(file.type)) {
      setNote({ tone: "error", text: "Use a PNG or WebP logo with a transparent background." });
      return;
    }
    if (file.size > itemLimits.logoKb * 1024) {
      setNote({
        tone: "error",
        text: `This logo is ${Math.round(file.size / 1024)} KB. The limit is ${itemLimits.logoKb} KB.`,
      });
      return;
    }

    setNote({ tone: "info", text: "Uploading the logo... keep this page open." });
    lockSave(true);
    try {
      const signed = await sign({ name: file.name, type: file.type, size: file.size });
      if ("error" in signed) {
        setNote({ tone: "error", text: signed.error });
        return;
      }
      const failure = await uploadToSignedPath(mediaConfig.bucket, signed.path, signed.token, file);
      if (failure) {
        setNote({ tone: "error", text: `Upload failed: ${failure}` });
        return;
      }
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setPreview(url);
      setPath(signed.path);
      setDropped(false);
      setNote({ tone: "info", text: "Uploaded. Press the Save button to use it." });
    } catch {
      setNote({ tone: "error", text: "The logo could not be uploaded. Try again." });
    } finally {
      lockSave(false);
    }
  }

  function remove() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
    setPath("");
    setDropped(true);
    setNote(null);
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      {shown && (
        <div className="flex items-center gap-3">
          <Img src={shown} className="size-10 border border-line bg-surface object-contain" />
          <button type="button" onClick={remove} className="text-xs underline underline-offset-4">
            Remove logo
          </button>
        </div>
      )}
      <Input id={id} type="file" accept="image/png,image/webp" onChange={handleChange} />
      <input type="hidden" name={`dl_logo_file_${index}`} value={path} />
      <input type="hidden" name={`dl_logo_keep_${index}`} value={keep} />
      {note && (
        <p role="status" className={note.tone === "error" ? "text-xs text-accent" : "font-mono text-xs text-ink-soft"}>
          {note.text}
        </p>
      )}
    </div>
  );
}