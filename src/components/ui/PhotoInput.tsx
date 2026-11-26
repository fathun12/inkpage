"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useCrop } from "@/components/ui/CropDialog";
import { Input } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { mediaConfig } from "@/config/media";
import { uploadToSignedPath } from "@/lib/direct-upload";
import type { VideoSignAction } from "@/types/media";

type Props = {
  id: string;
  name: string;
  // Same server action as the background video (it signs photos too). The type name says "Video".
  sign: VideoSignAction;
  onFile?: (file: File | null) => void;
};
type Note = { tone: "info" | "error"; text: string } | null;

const MB = 1024 * 1024;
const photo = mediaConfig.backgroundPhoto;

// Background photo at ORIGINAL quality: no crop, no shrinking. The file itself is not part of the form
// (the input has no name). It is uploaded straight to Storage as soon as it is picked, and only its
// storage path travels with the form.
export function PhotoInput({ id, name, sign, onFile }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const [path, setPath] = useState("");
  const [note, setNote] = useState<Note>(null);
  const { ask, dialog } = useCrop();

  function lockSave(locked: boolean) {
    const form = wrapRef.current?.closest("form");
    form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((button) => {
      button.disabled = locked;
    });
  }

  function fail(input: HTMLInputElement, text: string) {
    input.value = "";
    setPath("");
    onFile?.(null);
    setNote({ tone: "error", text });
    lockSave(false);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    runRef.current += 1;
    const run = runRef.current;
    setPath("");

    if (!file) {
      onFile?.(null);
      setNote(null);
      lockSave(false);
      return;
    }

    if (!photo.types.some((t) => t.mime === file.type)) {
      return fail(input, "Use a JPG, PNG or WebP photo.");
    }
    if (file.size > photo.maxMb * MB) {
      return fail(input, `This photo is ${(file.size / MB).toFixed(1)} MB. The limit is ${photo.maxMb} MB.`);
    }

    const picked = await ask(file, { maxPx: 8000, quality: 0.95, type: "webp" });
    if (run !== runRef.current) return;
    if (!picked) {
      input.value = "";
      onFile?.(null);
      setNote(null);
      return;
    }
    const original = picked === file;
    if (picked.size > photo.maxMb * MB) {
      return fail(input, `The cropped photo is ${(picked.size / MB).toFixed(1)} MB. The limit is ${photo.maxMb} MB.`);
    }

    lockSave(true);
    try {
      setNote({
        tone: "info",
        text: `Uploading the ${original ? "original" : "cropped"} photo... keep this page open.`,
      });
      const signed = await sign({ name: picked.name, type: picked.type, size: picked.size });
      if (run !== runRef.current) return;
      if ("error" in signed) return fail(input, signed.error);

      const failure = await uploadToSignedPath(mediaConfig.bucket, signed.path, signed.token, picked);
      if (run !== runRef.current) return;
      if (failure) return fail(input, `Upload failed: ${failure}`);

      setPath(signed.path);
      onFile?.(picked);
      setNote({
        tone: "info",
        text: `Uploaded (${(picked.size / MB).toFixed(1)} MB${original ? ", original quality" : ""}). Now press Save changes to use it.`,
      });
      lockSave(false);
    } catch {
      if (run === runRef.current) fail(input, "This photo could not be uploaded. Try again.");
    }
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      <Input id={id} type="file" accept={photo.accept} onChange={handleChange} />
      {dialog}
      <input type="hidden" name={name} value={path} />
      {note?.tone === "error" && <Notice>{note.text}</Notice>}
      {note?.tone === "info" && (
        <p role="status" className="font-mono text-xs text-ink-soft">
          {note.text}
        </p>
      )}
    </div>
  );
}